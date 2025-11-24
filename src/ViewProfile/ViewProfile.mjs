import { request, response, Router } from "express";
import pool from "../utils/pgConfig.mjs";

const router = Router();

function isLoggedIn(request, response, next) {
  if (request.isAuthenticated()) return next();
  return response.status(401).json({ message: "Not authenticated" });
}

router.get("/api/profile/me", isLoggedIn, async (request, response) => {
  try {
    const loggedUserId = request.user.accountid; 
    const result = await pool.query(
      "SELECT * FROM get_account_by_id($1)",
      [loggedUserId]
    );

    if (!result.rows.length) {
      return response.status(404).json({ message: "Account not found" });
    }

    return response.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Server error" });
  }
});

// Logging out
router.post("/api/logout", (request, response) => {
  request.logout(error => {
    if (error) {
      console.error("Logout error:", error);
      return response.status(500).json({ message: "Logout failed" });
    }

    request.session.destroy(() => {   
      response.clearCookie("connect.sid");
      return response.json({ message: "Logged out successfully" });
    });
  });
});

export default router;