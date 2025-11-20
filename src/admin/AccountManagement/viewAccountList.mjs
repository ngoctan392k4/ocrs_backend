import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

router.get("/api/admin/accountManagement", async(req, res) => {
    try {
        const data = await pool.query('SELECT accountid, username, email, status, role FROM get_account_list()');
        return res.json(data.rows);
    } catch(error) {
        console.error("DB ERROR: ", error.message);
        return res.status(500).send("Database Error");
    }
});

export default router;