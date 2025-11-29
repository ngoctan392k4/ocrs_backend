import { response, Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// OpenCourse

router.get("/api/admin/openCourse", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_courses_not_in_upcoming()");

    return response.json(
    result.rows
    );
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

router.post("/api/admin/openCourse", async (req, res) => {
  const { courses } = req.body; 

  if (!courses || courses.length == 0) {
    return res.status(400).json({ message: "No courses selected" });
  }

  let count = 0;
  try {
    for (const courseid of courses) {
      await pool.query("CALL add_upcoming_course($1)", [courseid]);
      count+=1;
    }

    return res.json({ message: `${count} course(s) opened successfully` });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ error: "Failed to open courses" });
  }
});

export default router;
