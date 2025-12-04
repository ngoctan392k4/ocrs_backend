import { Router } from "express";
import {
  query,
  validationResult,
  body,
  matchedData,
  checkSchema,
} from "express-validator";
import passport from "passport";
import crypto from "crypto";
import "./local-stategies.mjs";
import pool from "../utils/pgConfig.mjs";
import { genToken } from "../utils/genToken.mjs";
import { hashPassword } from "../utils/hashFunc.mjs";
import { sendResetPasswordEmail } from '../utils/sendResetPwd.mjs'


const router = Router();

router.post("/api/auth", (request, response, next) => {
  passport.authenticate("local", (error, user, info) => {
    // Process sever connection error
    if (error) {
      return next(error);
    }

    if (!user) {
      return response.status(401).json(info);
    }

    request.logIn(user, async (error) => {
      if (error) {
        return next(error);
      }

      const userInfo = {
        id: user.accountid,
        username: user.username,
        role: user.role,
      };

      return response.status(200).json(userInfo);
    });
  })(request, response, next);
});

router.get("/api/check-session", (request, response) => {
  if (request.user) {
    return response.json({ loggedIn: true, user: request.user });
  }

  response.json({ loggedIn: false });
});

router.post("/api/auth/forgotPassword", async (request, response) => {
  // Get email
  const { email } = request.body;
  const result = await pool.query("SELECT check_exist_email ($1) AS exists", [
    email,
  ]);

  const matchEmail = result.rows[0].exists;

  if (!matchEmail)
    return response.status(404).json({ message: "Not Found Email" });

  // Gen Token to reset pwd
  const { resetToken, passwordResetToken, passwordResetTokenExpire } = genToken();
  await pool.query("CALL save_reset_pwd_token($1, $2, $3)", [
    email,
    passwordResetToken,
    passwordResetTokenExpire,
  ]);

  await sendResetPasswordEmail(email, resetToken);

  return response.status(200).json({
    message: "Reset token generated"
  });
});

router.post("/api/auth/resetPassword", async (request, response, next) => {
  try {
    const { token, pwd } = request.body;

    if (!token) {
      return response.status(400).json({ message: "Invalid URL" });
    }

    if (!pwd) {
      return response.status(400).json({ message: "Null pwd" });
    }

    const hash256Token = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await pool.query("SELECT * FROM get_mail_expire($1)", [hash256Token]);

    // When token does not exist in DTB due to thge usage before
    if (result.rowCount === 0) {
      return response.status(400).json({ message: "Invalid token" });
    }

    const { email, expire } = result.rows[0];
    if (Date.now() > expire || !expire) {
      return response.status(400).json({ message: "Token expired" });
    }

    const hashedNewPwd = await hashPassword(pwd);

    await pool.query("CALL save_new_pwd($1, $2)", [hashedNewPwd, email]);
    await pool.query("CALL update_status_token($1)", [hash256Token]);

    return response.status(200).json({ message: "OK" });
  } catch (error) {
    next(error);
  }
});

router.post("/api/auth/logout", (request, response, next) => {
    request.logOut((err) => {
        if (err) {
            return next(err);
        }

        request.session.destroy((err) => {
             if (err) {
                console.error('Error destroying session after logout:', err);
             }

             response.clearCookie('connect.sid');

             return response.status(200).json({ message: "Logout successful" });
        });
    });
});

router.get("/api/student/me", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Not authenticated" });
  }

  if (request.user.role !== 'student') {
    return;
  }

  try {
    const accountId = request.user.accountid;

    const result = await pool.query(
      'SELECT * FROM get_studentid_by_accountid($1)',
      [accountId]
    );

    if (result.rows.length === 0) {
      return response.status(404).json(null);
    }

    return response.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student me:", error);
    return response.status(500).json({message: "Server error"})
  }
});

export default router;
