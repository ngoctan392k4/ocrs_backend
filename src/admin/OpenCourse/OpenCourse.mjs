import { response, Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// OpenCourse

router.get("/api/admin/openCourse", async (request, response) => {
  try {
    const latestSemester = await pool.query(
      "SELECT * FROM get_latest_semester()"
    );
    const latestSem = latestSemester.rows[0];
    const semid = request.query.semid || latestSem?.semid;

    const course = await pool.query("SELECT * FROM get_courses_by_semid($1)", [
      semid,
    ]);

    const courses = await pool.query("SELECT * FROM get_course()");

    const allSem = await pool.query("SELECT * FROM get_all_semesters()");

    return response.json({
      allCourse: courses.rows,
      course: course.rows,
      latestSem,
      allSem: allSem.rows,
    });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

//updateOpenCourse
router.put("/api/admin/openCourse", async (request, response) => {
  const { add, remove } = request.body;

  if ((!add && !remove) || (add.length == 0 && remove.length == 0)) {
    return response.status(400).json({ message: "No update" });
  }

  let addCount = 0;
  let removeCount = 0;
  let courseHasStudent = [];
  try {
    for (const courseid of add) {
      await pool.query("CALL add_upcoming_course($1)", [courseid]);
      addCount += 1;
    }

    for (const courseid of remove) {
      const result = await pool.query(
        "SELECT checkCourseHasEnrolledStudents($1) AS has_student",
        [courseid]
      );

      const hasStudent = result.rows[0].has_student;

      if (hasStudent) {
        courseHasStudent.push(courseid);
      } else {
        await pool.query("CALL remove_upcoming_course($1)", [courseid]);
        removeCount += 1;
      }
    }

    let cannotRemoveMsg = "";
    if (courseHasStudent.length > 0) {
      cannotRemoveMsg = ` ${courseHasStudent.join(", ")} cannot be remove`;
    }

    const addMsg =
      addCount != 0 ? `${addCount} course(s) opened` : "No new course opened";
    const removeMsg =
      removeCount != 0
        ? `${removeCount} course(s) removed`
        : "No course removed";

    const msg = cannotRemoveMsg == "" ?  addMsg + ", " + removeMsg : addMsg + ", " + removeMsg + ", "+ cannotRemoveMsg;
    return response.json({ message: msg });
    
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
