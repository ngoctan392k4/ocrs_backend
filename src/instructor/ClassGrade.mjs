import { response, Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

router.get("/api/instructor/classgrade/sem", async (request, response) => {
  try {
    const currentSemester = await pool.query(
      "SELECT * FROM get_current_semester()"
    );
    const allSem = await pool.query("SELECT * FROM get_all_semesters()");
    return response.json({
      current_sem: currentSemester.rows,
      allSem: allSem.rows,
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: error.message });
  }
});

router.get("/api/instructor/classgrade/assignedClass", async (request, response) => {
  try {
    const accountid = request.user.accountid;
    const { semid } = request.query;

    const assignedClass = await pool.query(
      "SELECT * FROM getassignedclasseswithschedule($1, $2)", [accountid, semid]
    );

    return response.json({
      assigned_class: assignedClass.rows
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: error.message });
  }
});

router.post("/api/instructor/classgrade/gradeList", async (request, response) => {
  try {
    const { classID } = request.body;

    const gradeList = await pool.query(
      "SELECT * FROM get_grades_by_classid($1)", [classID]
    );

    return response.json({
      gradeList: gradeList.rows
    });

  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: error.message });
  }
});

router.post("/api/instructor/classgrade/studentList", async (request, response) => {
  try {
    const { classID } = request.body;

    const studentList = await pool.query(
      "SELECT * FROM get_studentlist_by_classid($1)", [classID]
    );
    return response.json({
      studentList: studentList.rows
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: error.message });
  }
});

router.post('/api/instructor/classgrade/editgrade', async (req, res) => {
  try {
    const { studentID, classID, gradeType, newScore } = req.body;

    await pool.query(
      'CALL editgrade($1, $2, $3, $4)', 
      [studentID, classID, gradeType, newScore]
    );

    return res.json({
      message: 'Grade updated successfully!',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
});

export default router;
