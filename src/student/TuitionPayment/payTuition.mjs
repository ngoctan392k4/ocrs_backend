import { Router } from "express";
import { createRequire } from "module";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

const require = createRequire(import.meta.url);
const payosLib = require("@payos/node");

const PayOS = payosLib.PayOS || payosLib;

const payos = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

router.get("/api/student/tuition", async (req, res) => {
    try {
        const { student_id } = req.query;

        const data = await pool.query(
            'SELECT * FROM get_student_tuition($1)',
            [student_id]
        )

        return res.json(data.rows);

    } catch (e) {
        console.error("DB ERROR: ", e.message);
        return res.status(500).send("Database Error");
    }
});

router.post("/api/student/payment/create-link", async (req, res) => {
    const { amount, student_id } = req.body;

    try {
        const orderCode = Number(String(Date.now()).slice(-6));

        const paymentData = {
            orderCode: orderCode,
            amount: Number(amount),
            description: `Tuition ${student_id}`,
            items: [
                {
                    name: `Tuition Fee - Current Semester`,
                    quantity: 1,
                    price: Number(amount)
                }
            ],
            returnUrl: "http://localhost:5173/payFee",
            cancelUrl: "http://localhost:5173/payFee"
        };

        const paymentLinkResponse = await payos.paymentRequests.create(paymentData);

        await pool.query(
            `CALL link_order_to_payment($1, $2)`,
            [student_id, orderCode]
        );

        return res.json({
            checkoutUrl: paymentLinkResponse.checkoutUrl
        });
    } catch (e) {
        console.error('PAYMENT ERROR: ', e.message);
        return res.status(500).json({
            message: "Failed to create payment link"
        });
    }
});

router.post("/api/student/tuition/webhook", async (req, res) => {

    try {
        const webhookData = await payos.webhooks.verify(req.body);

        //If payment is success
        if (webhookData.code === "00") {
            console.log("Checking...")
            const { orderCode } = webhookData;

            // Update data in DB to 'PAID'
            await pool.query(
                `CALL update_tuition_status($1, $2)`,
                [orderCode, 'Paid']
            );

        }

        return res.json({ success: true });
    } catch (e) {
        console.error("Webhook Error", e.message);
        return res.json({ success: false });
    }
});

export default router;