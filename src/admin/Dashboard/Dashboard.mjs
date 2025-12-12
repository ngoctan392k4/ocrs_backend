import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();


router.get("/api/admin/statistic", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_statistics()");
    return response.json(result.rows[0]);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});


router.get("/api/admin/majorDistribution", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_majorDistribution()");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});


router.get("/api/admin/enrollment", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM get_enrollmentTrend()");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});

export default router;
