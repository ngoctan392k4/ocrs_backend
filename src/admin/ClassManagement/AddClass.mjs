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

    // Nếu cả 2 đều không có → lỗi nghiêm trọng
    if (!latest && !current) {
      return res.status(400).json({
        code: "NO_SEMESTER",
        message: "No semester data found!",
      });
    }

    // =======================================================
    // CASE 1: current semester KHÔNG có → dùng latest luôn
    // =======================================================
    if (!current) {
      const courses = await pool.query(
        "SELECT * FROM get_courses_by_semid($1)",
        [latest.semid]
      );

      if (courses.rows.length === 0) {
        return res.status(400).json({
          code: "NO_COURSE_LATEST",
          message: `No courses have been opened for ${latest.semid} yet!`,
        });
      }

      const instructors = await pool.query("SELECT * FROM get_allinstructor()");

      return res.json({
        allowSemid: latest.semid,
        semesterInfo: latest,
        statusMessage: "CURRENT_NOT_FOUND_USE_LATEST",
        courses: courses.rows,
        instructors: instructors.rows,
        latestSemester: latest,
      });
    }

    // =======================================================
    // CASE 2: current = latest
    // → chỉ cho add class trong 7 ngày từ start_date
    // =======================================================
    if (current && current.semid === latest.semid) {
      const today = new Date();
      const startDate = new Date(current.start_date);
      const deadlineDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (today > deadlineDate) {
        return res.status(400).json({
          code: "DEADLINE_EXPIRED",
          message: "The deadline for adding classes for this semester has expired",
          latestSemester: latest,
        });
      }

      // OK → cho add class cho current
      const courses = await pool.query(
        "SELECT * FROM get_courses_by_semid($1)",
        [current.semid]
      );

      const instructors = await pool.query("SELECT * FROM get_allinstructor()");

      return res.json({
        allowSemid: current.semid,
        semesterInfo: current,
        statusMessage: "ALLOW_CURRENT_7_DAYS",
        courses: courses.rows,
        instructors: instructors.rows,
        latestSemester: latest,
      });
    }

    // =======================================================
    // CASE 3: current ≠ latest → add class cho latest
    // =======================================================
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
      statusMessage: "ALLOW_LATEST",
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
