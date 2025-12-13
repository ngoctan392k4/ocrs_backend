import { Router } from "express";
import pool from "../../../utils/pgConfig.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

router.post("/api/student/AISmartTimeTable", async (request, response) => {
  const accountID = request.user.accountid;
  const { courseID } = request.body;

  console.log("Request Body:", request.body);
  console.log("Course ID:", courseID);
  let prompt = ``;

  try {
    const getStudentSchedule = await pool.query(
      "SELECT * FROM get_schedule_by_student($1)",
      [accountID]
    );

    const getClassesSchedule = await pool.query(
      "SELECT * FROM get_classes_with_schedule_by_courseid($1)",
      [courseID]
    );

    const studentSchedule = getStudentSchedule.rows
      .map(
        (schedule) =>
          `${schedule.student_schedule}`
      )
      .join(", ");
    const classSchedules = getClassesSchedule.rows
      .map((cls) => `${cls.classcode}: ${cls.class_schedule}`)
      .join(", ");

    console.log("Student Schedule:", studentSchedule);
    console.log("Classes Schedule:", classSchedules);

    prompt = `
  Student's schedule: ${studentSchedule}
  Classes schedule: ${classSchedules}

  You are a scheduling assistant that recommends classcode that do NOT conflict with a student's existing schedule.

  INPUTS (JSON):
    - studentSchedule: an array of objects { schedule in the form of "<weekday HH:MM-HH:MM; ...>"}
    - classes: an array of objects { classcode, schedule in the form of "<weekday HH:MM-HH:MM; ...>"}

  RULES (conflict summary):
    1) Treat intervals as half-open [start, end). They overlap iff NOT(endA <= startB OR endB <= startA). This logic Must be checked for classes that are in the same day (Mon, Tue)
    2) Do NOT recommend classes with missing or invalid schedule.
    3) If student already has any class of the same course, do not recommend other classes of that course.
    4) If Student's schedule is empty, RETURN AN ARRAY OF ALL CLASSES IN THAT COURSE
    5) The class recommended are purely based on the given class in class schedule MUST NOT GENERATE ANY OTHER OUTSIDE CLASSES
    6) RETURN AN EMPTY ARRAY IF NO SCHEDULE IS NON_CONFLICT
  OUTPUT:
    - The output MUST be an array of classcode of the classes you deemed suitable --- EXAMPLE OUPUT [ "ClassCodeA", "ClassCodeB"](IF YOU FOUND NOTHING can be recommended DO NOT USE THIS AS A WAY TO ANSWER)
    - The ID should remain unchange  for example if the schedule is KOR 101-34: Sat 15:15-19:30 then the output must return KOR 101-34 as classcode
`;
  } catch (error) {
    response.json({ msg: error.message });
  }

  try {
    const result = await model.generateContent(prompt);
    const response_AI = result.response;
    console.log("Raw AI Response:", result.response);
    const text_version = response_AI.text();
    console.log(`[${new Date().toISOString()}]`);
    console.log(text_version);
    response.json(JSON.parse(text_version));
  } catch (error) {
    if (error.message.includes("429") || error.status === 429) {
      return response.status(429).json({ message: "429" });
    }

    return response.status(500).json({ message: error.message });
  }
});

router.post("/api/student/SmartTimeTable", async (request, response) => {
  const { clsid, schedule, location } = request.body;
  const accountid = request.user.accountid;

  if (!clsid || !schedule) {
    return response.status(400).json({ message: "Missing required fields" });
  }

  try {
    await pool.query(`CALL insert_schedule_for_advisor($1, $2, $3, $4)`, [
      accountid,
      clsid,
      schedule,
      location,
    ]);

    return response.status(201).json({
      message: "Class added successfully",
      classDetails: null,
    });
  } catch (error) {
    console.error("Error adding class to timetable:", error);
    const msg = error?.message || "Database Error";

    if (msg.toLowerCase().includes("conflict")) {
      return response.status(409).json({ message: msg });
    } else {
      return response.status(500).json({ message: msg });
    }
  }
});

router.delete("/api/student/SmartTimeTable", async (request, response) => {
  const { clsid } = request.body;
  const accountid = request.user.accountid;

  if (!clsid) {
    return response.status(400).json({ message: "Missing class ID" });
  }

  try {
    const result = await pool.query(
      `CALL delete_schedule_for_advisor($1, $2)`,
      [accountid, clsid]
    );

    return response.status(200).json({
      message: "Class removed successfully",
    });
  } catch (error) {
    console.error("Error removing class from timetable:", error.message);

    return response.status(500).json({ message: "Database Error" });
  }
});

export default router;
