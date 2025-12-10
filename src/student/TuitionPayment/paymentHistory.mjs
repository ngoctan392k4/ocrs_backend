import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// GET: /api/student/payment-history
router.get("/api/student/payment-history", async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.user || !req.user.accountid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { accountid } = req.user;

        // Call the SQL function we created earlier
        const data = await pool.query(
            'SELECT * FROM get_student_payment_history($1)',
            [accountid]
        );

        return res.json(data.rows);

    } catch (e) {
        console.error("PAYMENT HISTORY ERROR: ", e.message);
        return res.status(500).send("Database Error");
    }
});

export default router;