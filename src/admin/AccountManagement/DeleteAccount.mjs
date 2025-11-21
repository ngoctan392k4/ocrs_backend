import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";

const router = Router();

// Delete account via accountID
router.delete("/api/admin/accountManagement/:accountid", async (request, response) => {
    const { accountid } = request.params;

    try {
        const result = await pool.query(
            "CALL inactivate_account($1)",
            [accountid]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "account not found" });
        }

        return response.status(200).json({ message: "account deleted successfully" });
    } catch (error) {
        return response.status(500).send("Database Error");
    }
});

export default router;
