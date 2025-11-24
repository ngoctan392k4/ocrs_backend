import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/admin/ClassManagement/editClass/:clsid", async (req, res) => {
  const { clsid } = req.params;

  try {

    const instructorResult = await pool.query("SELECT * FROM get_allinstructor()");
    const scheduleResult = await pool.query("SELECT * FROM get_cls_schedule($1)", [clsid]);
    const result = await pool.query("SELECT * FROM getClass($1)", [clsid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.json({
      instructors: instructorResult.rows,
      schedule: scheduleResult.rows[0],
      classes: result.rows[0]
    });

  } catch (err) {
    console.error("GET /editClass/:clsid ERROR:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
});

/* PUT class */
router.put("/api/admin/ClassManagement/editClass/:clsid", async (req, res) => {
  const { clsid } = req.params;
  const { classcode, classname, capacity, courseid, instructorid, semid, schedule } = req.body;

  if (!clsid) {
    return res.status(400).json({ message: "Missing clsid" });
  }

  try {
    await pool.query(
      "CALL editClass($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        clsid,
        classcode,
        classname,
        capacity,
        courseid,
        instructorid,
        semid,
        JSON.stringify(schedule)
      ]
    );

    return res.json({ message: "Class updated successfully" });
  } catch (err) {
    console.error("PUT /editClass/:clsid ERROR:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
});

export default router;