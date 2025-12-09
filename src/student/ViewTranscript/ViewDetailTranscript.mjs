import { request, response, Router } from "express";
import pool from "../../utils/pgConfig.mjs";
import { param } from "express-validator";

const router = Router();

router.get(
  "/api/student/transcript/detailTranscript",
  async (request, response) => {
    try {
      const accountid = request.user.accountid;
      console.log(accountid);
      if (!accountid) {
        return response
          .status(401)
          .json({ message: "Unauthorized: No accountid" });
      }
      const allSem = await pool.query("SELECT * FROM get_all_semesters()");
      const semid = request.query.semid;

      const classes = await pool.query(
        "SELECT * FROM get_enrolled_classes($1, $2)",
        [accountid, semid]
      );

      return response.json({
        allSem: allSem.rows,
        classes: classes.rows,
      });
    } catch (error) {
      console.error("DB ERROR:", error.message);
      return response.status(500).json({ message: "Database Error" });
    }
    
  }
);  

router.get(
  "/api/student/transcript/detailTranscript/:classid",
  async (request, response) => {
    try {
      const { classid } = request.params;
      const accountid = request.user.accountid;

      const grade = await pool.query("SELECT * FROM get_student_class_grades($1, $2)", [accountid, classid])
      const classes = await pool.query("SELECT * FROM getclass($1)", [classid])

      return response.json({
        grade: grade.rows,
        classes: classes.rows[0]
      })
    } catch (error) {
      console.error("DB ERROR:", error.message);
      return response.status(500).json({ message: "Database Error" });
    }
  }
);

export default router;
