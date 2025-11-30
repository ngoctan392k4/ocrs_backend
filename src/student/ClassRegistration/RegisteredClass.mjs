import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/student/registeredClass", async (req, res) => {
  try {
    const accountid = req.user.accountid;

    const currentSemResult = await pool.query("SELECT * FROM get_current_semester()");
    const currentSem = currentSemResult.rows[0];

    const latestSemResult = await pool.query("SELECT * FROM get_latest_semester()");
    const latestSem = latestSemResult.rows[0];

    const viewRegisteredResult = await pool.query(
      "SELECT * FROM getInitialRegistrations($1)",
      [accountid]
    );

    return res.json({
      registered: viewRegisteredResult.rows,
      currentSem, 
      latestSem   
    });

  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

router.delete("/api/student/registeredClass/:clsid", async (req, res) => {
  const accountid = req.user.accountid;
  const { clsid } = req.params;  
  try {
    await pool.query("CALL delete_registeredclass($1, $2)", [accountid, clsid]);
    return res.json({ message: `Class ${clsid} deleted successfully.` });
  } catch (err) {
    console.error("DELETE CLASS ERROR:", err.message);
    return res.status(500).json({ error: "Database Error" });
  }
});

export default router;
