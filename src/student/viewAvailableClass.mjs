import { Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

// lấy danh sách class theo courseID + latest sem
router.post("/api/student/Available-Course/Class", async (req, res) => {
    const { courseID } = req.body;

    if (!courseID) {
        return res.status(400).json({ message: "ko fetch dc courseID" });
    }

    try {
        // Lấy latest semester
        const latestSem = await pool.query("SELECT * FROM get_latest_semester()");
        if (!latestSem.rows.length) {
            return res.status(404).json({ message: "No latest semester found" });
        }
        const semID = latestSem.rows[0].semid;

        // Lấy class theo courseID + latest sem
        const query = `SELECT * FROM get_classes_by_course_sem($1, $2)`;
        const result = await pool.query(query, [courseID, semID]);

        return res.json(result.rows);
    } catch (error) {
        console.error("DB ERROR:", error.message);
        return res.status(500).send("Database Error");
    }
});
export default router;