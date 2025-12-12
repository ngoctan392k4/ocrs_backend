import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

/* -----------------------------------------------------------
   1) API: Lấy danh sách kỳ + danh sách class theo kỳ
----------------------------------------------------------- */
router.get(
  "/api/student/transcript/overallTranscript",
  async (request, response) => {
    try {
      const accountid = request.user?.accountid;
      if (!accountid) {
        return response
          .status(401)
          .json({ message: "Unauthorized: No accountid" });
      }

      // Lấy danh sách tất cả semester
      const allSem = await pool.query("SELECT * FROM get_all_semesters()");

      // Semester đang chọn
      const semid = request.query.semid || "";

      // Lấy danh sách lớp đã học trong kỳ
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
  "/api/student/transcript/overallTranscript/getgrade",
  async (request, response) => {
    try {
      const accountid = request.user?.accountid;

      if (!accountid)
        return response.status(401).json({
          message: "Unauthorized: No accountid",
        });

      const semid = request.query.semid || "";

      const grade = await pool.query(
        "SELECT * FROM get_grades_by_accountid($1, $2)",
        [accountid, semid]
      );

      const overgrade = await pool.query(
        "SELECT * FROM get_overall_grades_by_accountid($1)",
        [accountid]
      );

      return response.json({
        grade: grade.rows,
        overgrade: overgrade.rows,
      });
    } catch (error) {
      console.error("DB ERROR:", error.message);
      return response.status(500).json({ message: "Database Error" });
    }
  }
);

export default router;
