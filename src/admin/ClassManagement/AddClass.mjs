import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.post("/api/admin/ClassManagement/addClass", async (req, res) => {
  try {
    const { classcode, courseid, instructorid, semid, classname, capacity, schedule } = req.body;

    await pool.query(
      `CALL add_class_with_schedule($1, $2, $3, $4, $5, $6, $7::json, $8)`,
      [classcode, courseid, instructorid, semid, classname, capacity, JSON.stringify(schedule ?? []), null]
    );

    return res.json({ success: true, message: "Class added successfully!" });

  } catch (err) {
    console.error("POST /addClass ERROR:", err);


    if (err.message.includes("INSTRUCTOR_CONFLICT")) {
      return res.status(400).json({
        code: "INSTRUCTOR_CONFLICT",
        message: err.message.replace("INSTRUCTOR_CONFLICT: ", "")
      });
    }

    if (err.message.includes("LOCATION_CONFLICT")) {
      return res.status(400).json({
        code: "LOCATION_CONFLICT",
        message: err.message.replace("LOCATION_CONFLICT: ", "")
      });
    }

    if (err.message.includes("Schedule conflict inside class")) {
      return res.status(400).json({
        code: "SCHEDULE_OVERLAP_INSIDE",
        message: "Schedule overlap inside class!"
      });
    }

    if (err.code === "23505") {
      return res.status(400).json({
        code: "DUPLICATE_CLASSCODE",
        field: "classcode",
        message: "Class Code already exists!"
      });
    }

    if (err.message.includes("already exists!")) {
      return res.status(400).json({
        code: "PROC_DUPLICATE",
        field: "classcode",
        message: "Class Code already exists!"
      });
    }

    if (err.code === "P0001" && err.message.includes("schedule conflict")) {
      return res.status(400).json({
        code: "SCHEDULE_OVERLAP",
        message: "Schedule overlap!"
      });
    }

    return res.status(500).json({ message: "Database error" });
  }
});

router.get("/api/admin/ClassManagement/addClass", async (req, res) => {
  try {
    const courseResult = await pool.query("SELECT * FROM get_course()");
    const instructorResult = await pool.query("SELECT * FROM get_allinstructor()");
    const latestSemester = await pool.query("SELECT * FROM get_latest_semester()");

    return res.json({
      courses: courseResult.rows,
      instructors: instructorResult.rows,
      semesterlat: latestSemester.rows
    });
  } catch (error) {
    console.error("GET /addClass DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

export default router;
