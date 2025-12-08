import { Router } from "express";
import { createRequire } from "module";
import pool from "../../utils/pgConfig.mjs";
import { sendInvoiceEmail } from "../../utils/sendInvoiceEmail.mjs";

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
        const { accountid } = req.user;

        const data = await pool.query(
            'SELECT * FROM get_student_tuition($1)',
            [accountid]
        )

        return res.json(data.rows);

    } catch (e) {
        console.error("DB ERROR: ", e.message);
        return res.status(500).send("Database Error");
    }
});

router.post("/api/student/payment/create-link", async (req, res) => {
    const { amount } = req.body;
    const { accountid } = req.user;

    try {
        const orderCode = Number(String(Date.now()).slice(-6));

        const paymentData = {
            orderCode: orderCode,
            amount: Number(amount),
            description: `Tuition`,
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
            [accountid, orderCode]
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
            const { orderCode } = webhookData;

            // Update data in DB to 'PAID'
            await pool.query(
                `CALL update_tuition_status($1, $2)`,
                [orderCode, 'Paid']
            );

            try {
                // Fetch Student & Payment Info
                const studentQuery = await pool.query(
                    `SELECT * FROM get_payment_from_orderCode($1)`,
                    [orderCode]
                );

                // Fetch Course Details
                const coursesQuery = await pool.query(
                    `SELECT * FROM get_paymentdetails_from_orderCode($1)`,
                    [orderCode]
                );

                if (studentQuery.rows.length > 0) {
                    const { name, emailaddress, total_amount, date } = studentQuery.rows[0];
                    const courseList = coursesQuery.rows;

                    const paymentDate = new Date(date).toLocaleDateString("en-GB");

                    // Send Email
                    sendInvoiceEmail(
                        emailaddress,
                        name,
                        orderCode,
                        total_amount,
                        paymentDate,
                        courseList
                    );
                } else {
                    console.log("WARNING: Payment found but no Student info returned.")
                }
            } catch (e) {
                console.error("Failed to fetch info for email:", e);
                // We do not throw here to ensure we still return { success: true } to PayOS
            }
        }

        return res.json({ success: true });
    } catch (e) {
        console.error("Webhook Error", e.message);
        return res.json({ success: false });
    }
});

export default router;