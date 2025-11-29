import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/admin/ClassManagement", async (req, res) => {
  try {

  const classesResult = await pool.query("SELECT * FROM getClassesWithSchedule()");

    return res.json({
      classes: classesResult.rows
    });

  } catch (error) {
    console.error("DB ERROR:", error.message);
    return res.status(500).json({ message: "Database Error" });
  }
});

router.delete("/api/admin/ClassManagement/:clsid", async (req, res) => {
  const { clsid } = req.params;

  try {
    await pool.query("CALL delete_class($1)", [clsid]);

    return res.json({ message: `Class ${clsid} deleted successfully.` });
  } catch (err) {
    console.error("DELETE CLASS ERROR:", err.message);
    return res.status(500).json({ error: "Database Error" });
  }
});

export default router;
