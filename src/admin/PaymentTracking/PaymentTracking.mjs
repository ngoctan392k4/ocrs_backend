import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// GET all payments
router.get("/api/admin/paymentTracking", async(req, res) => {
    try {
        const data = await pool.query('SELECT * FROM get_payments()');
        return res.json(data.rows);
    } catch(error) {
        console.error("DB ERROR: ", error.message);
        return res.status(500).send("Database Error");
    }
});

// POST update status
router.post("/api/admin/paymentTracking/updateStatus", async(req, res) => {
    try {
        const { paymentid, status } = req.body;

        if (!paymentid || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await pool.query(
            "CALL update_payment_status($1, $2)",
            [status, paymentid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Payment ID not found" });
        }

        return res.json({ success: true, message: "Status updated successfully" });

    } catch (error) {
        console.error("DB ERROR: ", error.message);
        return res.status(500).send("Database Error");
    }
})

export default router;