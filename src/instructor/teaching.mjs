import { response, Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

router.get("/api/instructor/teaching/sem", async (request, response) => {
  try {
    const currentSemester = await pool.query(
      "SELECT * FROM get_current_semester()"
    );
    return response.json({
      current_sem: currentSemester.rows,
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ message: error.message });
  }
});

router.get("/api/instructor/teaching/assignedClass", async (request, response) => {
  try {
    const accountid = request.user.accountid;
    const {semid} = request.query;

    const assignedClass = await pool.query(
      "SELECT * FROM getassignedclasseswithschedule($1, $2)", [accountid, semid]
    );

    return response.json({
      assigned_class: assignedClass.rows
    });
  } catch (error) {
    console.log(error);

    return response.status(400).json({ message: error.message });
  }
});

export default router;