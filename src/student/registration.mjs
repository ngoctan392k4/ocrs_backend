import { response, Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

// Get all courses except for course with classID for BU 1
router.get("/api/student/classRegiter/backup1", async (request, response) => {
  try {
    const { classcode, semester } = request.query;
    const result = await pool.query("SELECT * FROM get_backup_1($1, $2)", [
      classcode,
      semester,
    ]);

    return response.json({
      bu1_courses: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database Error" });
  }
});

// Get all courses except for course with classID and BU 1 course for BU 2
router.get("/api/student/classRegiter/backup2", async (request, response) => {
  try {
    const { classcode, semester, bu1 } = request.query;
    const result = await pool.query("SELECT * FROM get_backup_2($1, $2, $3)", [
      classcode,
      semester,
      bu1,
    ]);

    return response.json({
      bu2_courses: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database Error" });
  }
});

// Get the latest semester
router.get("/api/student/classRegiter/sem", async (request, response) => {
  try {
    const latestSemester = await pool.query(
      "SELECT * FROM get_latest_semester()"
    );
    return response.json({
      latest_sem: latestSemester.rows,
    });
  } catch (error) {
    console.log(error);

    return response.status(400).json({ message: error.message });
  }
});

// Confirm class for registering
router.post(
  "/api/student/classRegiter/confirmClass",
  async (request, response) => {
    try {
      const { classID, semID } = request.body;

      // Check if class exists
      const check_classID = await pool.query(
        "SELECT * FROM check_class_sem($1, $2)",
        [classID, semID]
      );
      const isExist = check_classID.rows[0].check_class_sem;

      if (!isExist) {
        return response.status(404).json({
          message: `Not exist`,
        });
      }

      const accountid = request.user.accountid;

      // Check if student is satified with preqs
      const check_preq = await pool.query("SELECT * FROM check_prerequisite_satisfied($1, $2, $3)", [accountid, classID, semID])
      const isSatified = check_preq.rows[0].check_prerequisite_satisfied;
      if (!isSatified) {
        const preq = await pool.query("SELECT * FROM get_preq($1, $2)", [classID, semID])

        return response.status(400).json({
                message: 'Not satified',
              preqs: preq.rows
        });
      }

      // Check if student registered in the same semester with the same course
      const check_registered = await pool.query(
        "SELECT * FROM check_registered($1, $2, $3)",
        [classID, semID, accountid]
      );
      if (check_registered.rowCount !== 0) {
        return response.status(400).json({
          message: `Already register the course`,
        });
      }

      // Check conflict schedule with other class in the same semester
      const check_conflict = await pool.query(
        "SELECT * FROM check_schedule_conflict($1, $2, $3)",
        [accountid, classID, semID]
      );

      if (check_conflict.rowCount!==0 && check_conflict.rows[0].check_schedule_conflict!==null) {
        return response.status(400).json({
          message: `Conflict`,
          conflict_course: check_conflict.rows[0].check_schedule_conflict
        });
      }

      // Check slots for the class
      const check_registered_num = await pool.query("SELECT * FROM get_registered_number($1, $2)", [classID, semID])
      const get_class_capacity = await pool.query("SELECT * FROM get_total_number($1, $2)", [classID, semID])

      if (check_registered_num.rows[0].get_registered_number === get_class_capacity.rows[0].get_total_number){
        return response.status(400).json({
          message: `Class full`,
          registered_num: check_registered_num.rows[0]?.get_registered_number,
          capacity: get_class_capacity.rows[0]?.get_total_number
        });
      }

      return response.status(200).json({
          message: `successfully`,
        });
    } catch (error) {
      console.log(error);
      return response.status(400).json({ message: `${error.message}` });
    }
  }
);

// Register classes
router.post("/api/student/classRegiter/register", async (request, response) => {
  try {
    const { registeredClass, semid, selectedBU1, selectedBU2 } = request.body;
    const accountid = request.user.accountid;

    const result = await pool.query(
      "CALL save_registration($1, $2, $3, $4, $5)",
      [registeredClass, semid, selectedBU1, selectedBU2, accountid]
    );

    return response.status(200).json({
      message: "Register successfully",
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: `${error.message}` });
  }
});

export default router;
