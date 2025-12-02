import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/student/schedule/studySchedule", async (req, res) => {
  try {
    const accountid = req.user.accountid;
    if (!accountid) {
      return res.status(401).json({ message: "Unauthorized: No accountid" });
    }

    const currentSemResult = await pool.query("SELECT * FROM get_current_semester()");
    const currentSem = currentSemResult.rows[0] || null;

    if (!currentSem) {
      return res.status(404).json({ message: "No current semester found" });
    }

    const semid = currentSem.semid;

    const enrolledResult = await pool.query(
      "SELECT * FROM getstudentschedule($1, $2)",
      [accountid, semid]
    );

    const enrolled = enrolledResult.rows;

    return res.json({
      enrolled,
      currentSem
    });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

export default router;
