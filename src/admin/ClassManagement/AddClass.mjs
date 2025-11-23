import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

/* ------------------------------
  POST: Add new class via procedure
------------------------------ */
router.post("/api/admin/ClassManagement/addClass", async (req, res) => {
  try {
    const { classcode, courseid, instructorid, semid, classname, capacity, schedule } = req.body;

    // CALL procedure add_class_with_schedule
    // Giả sử procedure có OUT parameter p_clsID
    await pool.query(
      `CALL add_class_with_schedule(
        $1, $2, $3, $4, $5, $6, $7::json, $8
      )`,
      [
        classcode,
        courseid,
        instructorid,
        semid,
        classname,
        capacity,
        JSON.stringify(schedule),
        null // OUT parameter
      ]
    );

    return res.json({ success: true, message: "Class added successfully!" });
  } catch (err) {
    console.error("POST /addClass ERROR:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
});

/* ------------------------------
  GET: Fetch courses, instructors, latest semester
------------------------------ */
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