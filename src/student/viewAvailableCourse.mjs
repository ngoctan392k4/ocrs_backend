// routes/student/testViewAvailableCourse.mjs
import { Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

// Lấy danh sách tất cả available course cho semester mới nhất
router.get("/api/student/Available-Course", async (req, res) => {
    try {
        // Lấy latest semester
        const latestSem = await pool.query("SELECT * FROM get_latest_semester()");
        if (!latestSem.rows.length) {
            return res.status(404).json({ message: "No latest semester found" });
        }
        const semid = latestSem.rows[0].semid;

        // Lấy danh sách course cho semester đó
        const result = await pool.query(
            "SELECT * FROM get_available_courses_detail($1)",
            [semid]
        );

        return res.json({
            semid,
            semester: latestSem.rows[0],
            courses: result.rows
        });
    } catch (error) {
        console.error("DB ERROR:", error.message);
        return res.status(500).send("Database Error");
    }
});
export default router;

