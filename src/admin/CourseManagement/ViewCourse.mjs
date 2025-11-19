import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/admin/CourseManagement", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_course()");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

export default router;