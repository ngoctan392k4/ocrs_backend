import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/instructor/schedule/teachingSchedule", async (req, res) => {
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

    const registeredResult = await pool.query(
      "SELECT * FROM getteachingschedule($1, $2)",
      [accountid, semid]
    );

    const assigned = registeredResult.rows;

    return res.json({
      assigned,
      currentSem
    });
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

export default router;
