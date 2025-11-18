import express, { response } from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./utils/pgConfig.mjs";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

app.get("/", (request, response) => {
  return response.send({ msg: "Hello" });
});

app.get("/api/admin/CourseManagement", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    return response.json(result.rows);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    return response.status(500).send("Database Error");
  }
});
