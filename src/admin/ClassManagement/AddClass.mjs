import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.post("/api/admin/ClassManagement/AddClass", async (req, res) => {
  try {
    const {
      classcode,
      courseid,
      instructorid,
      semid,
      classname,
      capacity,
      schedule
    } = req.body;

    // CALL procedure
    const result = await pool.query(
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
        null // OUT parameter sẽ trả về p_clsID
      ]
    );

    return res.json({ message: "Class added successfully!" });

  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
});

router.get("/api/admin/CourseManagement", async (req, res) => {
  try {
    // Lấy course
    const courseResult = await pool.query("SELECT * FROM get_course()");

    // Lấy instructor
    const instructorResult = await pool.query("SELECT * FROM get_allinstructor()");
    const latestSemester = await pool.query("SELECT * FROM get_latest_semester()");

    return res.json({
      courses: courseResult.rows,
      instructors: instructorResult.rows,
      semesterlat: latestSemester.rows
    });

  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

export default router;