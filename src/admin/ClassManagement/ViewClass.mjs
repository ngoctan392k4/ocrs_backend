import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/admin/ClassManagement", async (req, res) => {
  try {

  const classesResult = await pool.query("SELECT * FROM getClassesWithSchedule()");
    // Lấy course
    const courseResult = await pool.query("SELECT * FROM get_course()");

    // Lấy instructor
    const instructorResult = await pool.query("SELECT * FROM get_allinstructor()");
    const Semester = await pool.query("SELECT * FROM get_semester()");

    return res.json({
      classes: classesResult.rows, 
      courses: courseResult.rows,
      instructors: instructorResult.rows,
      semester: Semester.rows
    });

  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

router.post("/api/admin/semester/next", async (req, res) => {
  try {
    await pool.query("CALL create_next_semester()");
    return res.json({ message: "Semester incremented" });
  } catch (err) {
    console.error("SEMESTER ERROR:", err.message);
    return res.status(500).json({ error: "Database Error" });
  }
});

// Xóa class
router.delete("/api/admin/ClassManagement/:clsid", async (req, res) => {
  const { clsid } = req.params;

  try {
    // CALL procedure
    await pool.query("CALL delete_class($1)", [clsid]);

    return res.json({ message: `Class ${clsid} deleted successfully.` });
  } catch (err) {
    console.error("DELETE CLASS ERROR:", err.message);
    return res.status(500).json({ error: "Database Error" });
  }
});

export default router;
