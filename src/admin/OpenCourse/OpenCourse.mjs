import { response, Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// OpenCourse

router.get("/api/admin/openCourse", async (request, response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM get_courses_not_in_upcoming()"
    );
    const latestSemester = await pool.query(
      "SELECT * FROM get_latest_semester()"
    );

    return response.json({
      course: result.rows,
      semester: latestSemester.rows,
    });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

router.post("/api/admin/openCourse", async (request, response) => {
  const { courses } = request.body;

  if (!courses || courses.length == 0) {
    return response.status(400).json({ message: "No courses selected" });
  }

  let count = 0;
  try {
    for (const courseid of courses) {
      await pool.query("CALL add_upcoming_course($1)", [courseid]);
      count += 1;
    }

    return response.json({ message: `${count} course(s) opened successfully` });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).json({ error: "Failed to open courses" });
  }
});

router.post("/api/admin/semester/next", async (request, response) => {
  try {
    await pool.query("CALL create_next_semester()");
    return response.json({ message: "Semester incremented" });
  } catch (err) {
    console.error("SEMESTER ERROR:", err.message);
    return response.status(500).json({ error: "Database Error" });
  }
});

export default router;
