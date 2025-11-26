import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// Lấy thông tin lớp và lịch
router.get("/api/admin/ClassManagement/editClass/:clsid", async (req, res) => {
  const { clsid } = req.params;

  try {
    const instructorResult = await pool.query("SELECT * FROM get_allinstructor()");
    const classResult = await pool.query("SELECT * FROM getClass($1)", [clsid]);

    if (!classResult.rows.length) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.json({
      instructors: instructorResult.rows,
      classes: classResult.rows[0], 
    });

  } catch (err) {
    console.error("GET /editClass/:clsid ERROR:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
});

// Sửa lớp
router.put("/api/admin/ClassManagement/editClass/:clsid", async (req, res) => {
  const { clsid } = req.params;
  const { classcode, classname, capacity, courseid, instructorid, semid, schedule } = req.body;

  if (!clsid) {
    return res.status(400).json({ message: "Missing clsid" });
  }

  try {
    await pool.query(
      `CALL editClass($1,$2,$3,$4,$5,$6,$7,$8::json)`,
      [
        clsid,
        classcode,
        classname,
        capacity,
        courseid,
        instructorid,
        semid,
        JSON.stringify(schedule ?? [])
      ]
    );

    return res.json({ success: true, message: "Class updated successfully" });

  } catch (err) {
    console.error("PUT /editClass/:clsid ERROR:", err);

  if (err.message.includes("INSTRUCTOR_CONFLICT")) {
    return res.status(400).json({
      code: "INSTRUCTOR_CONFLICT",
      message: err.message.replace("INSTRUCTOR_CONFLICT: ", "")
    });
  }

  if (err.message.includes("LOCATION_CONFLICT")) {
    return res.status(400).json({
      code: "LOCATION_CONFLICT",
      message: err.message.replace("LOCATION_CONFLICT: ", "")
    });
  }

  if (err.message.includes("Schedule conflict inside class")) {
    return res.status(400).json({
      code: "SCHEDULE_OVERLAP_INSIDE",
      message: "Schedule overlap inside class!"
    });
  }

    return res.status(500).json({ message: "Database error" });
  }
});

export default router;
