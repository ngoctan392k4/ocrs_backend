import { response, Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// ViewCourse

router.get("/api/admin/CourseManagement", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_course()");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

// AddCourse

router.post("/api/admin/CourseManagement", async (request, response) => {
  const { courseID, courseCode, courseName, tosu, pre, para, des, credits } = request.body;

  try {
    if (!courseID || !courseName) {
      return response.status(400).json({
        success: false,
        message: "CourseID and CourseName are required",
      });
    }

    const allCreditsZero = Object.values(credits || {}).every((c) => c === 0);
    if (allCreditsZero) {
      return response.status(400).json({
        success: false,
        message: "At least one credit must be greater than 0",
      });
    }
        const { rows: existsRows } = await pool.query(
      `SELECT checkID_existed($1) AS exists`, [courseID]
    );

    if (existsRows[0].exists) {
      return response.status(400).json({
        success: false,
        message: `Course ID ${courseID} already exists. Please use a different Course ID.`,
      });
    }
    await pool.query(
      `CALL insert_course(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )`,
      [
        courseCode,
        courseID,
        courseName,
        tosu,
        pre || null,
        para || null,
        des || null,
        credits.LEC,
        credits.LAB,
        credits.Review,
        credits.Project,
        credits.Internship,
        credits.Studio,
        credits.FieldTrip,
        credits.CLC,
        credits.DEM,
        credits.Discussion,
        credits.LanguageDialogue,
        credits.Workshop,
      ]
    );

    return response.json({
      success: true,
      message: "Course added successfully",
    });

  } catch (error) {
    console.error("DB Error:", error.message);
    return response.status(500).json({
      success: false,
      message: "Database Error",
    });
  }
});

// DelCourse

router.delete("/api/admin/CourseManagement/:courseid", async (req, res) => {
    const { courseid } = req.params;

    try {
        const result = await pool.query(
            "CALL delete_course($1)",
            [courseid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error.message);
        return res.status(500).send("Database Error");
    }
});

export default router;
