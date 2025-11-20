import { Router } from "express";
import pool from "../../utils/pgConfig.mjs";
import { hashPassword } from "../../utils/hashFunc.mjs";

const router = Router();

router.post("/api/addAccount", async (request, response, next) => {
  try {
    const { selectedRole, name, phone, mail, dob, department, major } =
      request.body;

    // Standardize role
    const role = selectedRole.toLowerCase().trim();

    // Initialize username
    const username = mail.split("@")[0];

    // Initialize default password
    const defaultPassword = await hashPassword(username);

    // Initialize studentID or adminID or instructorID and get major
    let id = "";
    let majorOrDept = "";

    if (selectedRole === "Admin") {
      const result = await pool.query("SELECT * FROM countAdmin()");

      const currentCount = result.rows[0].countadmin || 0;
      const newCount = parseInt(currentCount) + 1;
      id = "ADM" + newCount;
    } else if (selectedRole === "Student") {
      const result = await pool.query("SELECT * FROM countStudent()");

      const currentCount = result.rows[0].countstudent || 0;
      const newCount = parseInt(currentCount) + 1;
      id = "STU" + newCount;

      majorOrDept = major;
    } else {
      const result = await pool.query("SELECT * FROM countInstruc()");

      const currentCount = result.rows[0].countinstruc || 0;
      const newCount = parseInt(currentCount) + 1;
      id = "INT" + newCount;

      majorOrDept = department;
    }

    // Initialize accountID
    const result = await pool.query("SELECT * FROM countAccount()");
    const currentCountAccount = result.rows[0].countaccount || 0;
    const newCount = parseInt(currentCountAccount) + 1;
    const accountCode = "ACC" + newCount;

    // Get currentYear for enrollment year
    const currentYear = new Date().getFullYear();

    // Call procedure to insert new account
    const query = `
      CALL save_new_account(
        $1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11
      )
    `;

    const values = [
      accountCode,
      username,
      id,
      defaultPassword,
      mail,
      role,
      name,
      phone,
      dob || null,
      majorOrDept,
      currentYear,
    ];

    await pool.query(query, values);

    return response.status(200).json({
      message: "Account added successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
