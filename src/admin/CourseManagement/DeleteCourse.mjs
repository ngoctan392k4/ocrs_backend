import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// DELETE Course by ID
router.delete("/api/admin/CourseManagement/:courseid", async (req, res) => {
    const { courseid } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM courses WHERE courseid = $1",
            [courseid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error.message);
        return res.status(500).send("Database Error");
    }
});

export default router;
