import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

//get previous data
router.get("/api/admin/accountManagement/edit/:accountid", async(req, res) => {
    try {
        const {accountid} = req.params;
        const data = await pool.query('SELECT * FROM get_account_by_id($1)', [accountid]);
        if (data.rows.length === 0) {
            return res.status(404).send("Account Not Found");
        }
        return res.json(data.rows[0]);
    } catch (error) {
        console.error("DB ERROR: ", error.message);
        return res.status(500).send("Database Error");
    }
});

// post edited data
router.put("/api/admin/accountManagement/edit/:accountid", async(req, res, next) => {
    
    const { accountid } = req.params;
    const { username, mail, phone: phone_number, dob, role, selectedStatus: status, department, major, name: full_name } = req.body;
    try {
        if (!dob) {
            return res.status(400).json({
                success: false,
                message: "Date of birth is required."
            });
        }
        //Check if mail exists
        const { rows: existsRows_email } = await pool.query(
            "SELECT check_exist_email($1, $2) AS exists", 
            [mail, accountid]
        );

        if (existsRows_email[0].exists) {
            return res.status(400).json(
                {
                    success: false,
                    message: `Email "${mail}" already exists.`
                });
        }

        const { rows: existsRows_username } = await pool.query(
            "SELECT check_exist_user($1, $2) AS exists",
        [username, accountid]
        );

        if (existsRows_username[0].exists) {
            return res.status(400).json(
                {
                    success: false,
                    message: `Username "${username}" already exists.`
                });
        }

        await pool.query(
            `CALL edit_account(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )`,
            [
               username, mail, phone_number, dob, role, status, department, major, full_name, accountid
            ]
        );

        return res.json({
            message: `Account with ID ${accountid} updated successfully`
        })
    }
    catch (e) {
        console.error('UPDATE ERROR:', e.message);
        return res.status(500).json({
            message: "Update error"
        });
    }
});

export default router;