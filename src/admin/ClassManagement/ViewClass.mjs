import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";


const router = Router();
router.get("/api/admin/ClassManagement", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM getClassesWithSchedule()");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
})

router.delete("/api/admin/ClassManagement/:clsid", async (req, res) => {
  const { clsid } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM classes WHERE clsid = $1",
      [clsid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    return res.status(500).send("Database Error");
  }
});

export default router;