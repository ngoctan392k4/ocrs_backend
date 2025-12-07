import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.post("/api/admin/ClassManagement/addClass", async (req, res) => {
  try {
    const { classcode, courseid, instructorid, semid, classname, capacity, schedule } = req.body;

    await pool.query(
      `CALL add_class_with_schedule($1, $2, $3, $4, $5, $6, $7::json, $8)`,
      [
        classcode,
        courseid,
        instructorid,
        semid,
        classname,
        capacity,
        JSON.stringify(schedule ?? []),
        null,
      ]
    );

    return res.json({
      success: true,
      message: "Class added successfully!",
    });

  } catch (err) {
    console.error("POST /addClass ERROR:", err);

    if (err.message.includes("INSTRUCTOR_CONFLICT")) {
      return res.status(400).json({
        code: "INSTRUCTOR_CONFLICT",
        message: err.message.replace("INSTRUCTOR_CONFLICT: ", ""),
      });
    }

    if (err.message.includes("LOCATION_CONFLICT")) {
      return res.status(400).json({
        code: "LOCATION_CONFLICT",
        message: err.message.replace("LOCATION_CONFLICT: ", ""),
      });
    }

    if (err.message.includes("Schedule conflict inside class")) {
      return res.status(400).json({
        code: "SCHEDULE_OVERLAP_INSIDE",
        message: "Schedule overlap inside class!",
      });
    }

    if (err.code === "23505") {
      return res.status(400).json({
        code: "DUPLICATE_CLASSCODE",
        field: "classcode",
        message: "Class Code already exists!",
      });
    }

    if (err.message.includes("already exists!")) {
      return res.status(400).json({
        code: "PROC_DUPLICATE",
        field: "classcode",
        message: "Class Code already exists!",
      });
    }

    if (err.code === "P0001" && err.message.includes("schedule conflict")) {
      return res.status(400).json({
        code: "SCHEDULE_OVERLAP",
        message: "Schedule overlap!",
      });
    }

    return res.status(500).json({ message: "Database error" });
  }
});


router.get("/api/admin/ClassManagement/addClass", async (req, res) => {
  try {
    const [latestRes, currentRes] = await Promise.all([
      pool.query("SELECT * FROM get_latest_semester()"),
      pool.query("SELECT * FROM get_current_semester()"),
    ]);

    const latest = latestRes.rows[0];
    const current = currentRes.rows[0];

    if (!latest) {
      return res.status(400).json({
        code: "NO_LATEST_SEMESTER",
        message: "No latest semester found!",
      });
    }

    // CASE: current equals latest -> next semester not created yet
    if (current && current.semid === latest.semid) {
      return res.status(400).json({
        code: "CURRENT_EQUALS_LATEST",
        message: "Next semester not created yet!",
        latestSemester: latest,
      });
    }

    // TÍNH NGÀY HẠN: limitDate = latest.start_date - 14 ngày
    const today = new Date();
    const latestStart = new Date(latest.start_date);

    const limitDate = new Date(latestStart);
    limitDate.setDate(limitDate.getDate() - 14);

    // Nếu today >= limitDate => trong vòng 14 ngày trước khi kỳ bắt đầu => khóa
    if (today >= limitDate) {
      return res.status(400).json({
        code: "DEADLINE_EXPIRED_14",
        message:
          "The deadline for adding classes for the next semester has expired",
        latestSemester: latest,
      });
    }

    // Nếu vượt qua kiểm tra hạn thì lấy danh sách môn của latest
    const courseResult = await pool.query(
      "SELECT * FROM get_courses_by_semid($1)",
      [latest.semid]
    );

    if (courseResult.rows.length === 0) {
      return res.status(400).json({
        code: "NO_COURSE_LATEST",
        message: `No courses have been opened for ${latest.semid} yet!`,
        latestSemester: latest,
      });
    }

    const instructors = await pool.query("SELECT * FROM get_allinstructor()");

    return res.json({
      allowSemid: latest.semid,
      semesterInfo: latest,
      statusMessage: "ALLOW_ADD",
      courses: courseResult.rows,
      instructors: instructors.rows,
      latestSemester: latest,
    });
  } catch (error) {
    console.error("GET /addClass DB ERROR:", error);
    return res.status(500).json({ message: "Database Error" });
  }
});



export default router;
