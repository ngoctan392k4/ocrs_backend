import {
  getStudentHistory,
  getCurriculum,
  getUpcomingCourse,
  getPrereq,
} from "../Recommendation/recommendation.mjs";
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import pool from "../../../utils/pgConfig.mjs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.3,
  },
});

const router = Router();

// Initialize latest semester ID
let SEMESTER = "";

// Initialize global context for chat
let GLOBAL_CONTEXT = {
  openCourse: [],
  prerequisite: null,
};

async function initialFetchContext() {
  const response = await pool.query("SELECT * FROM get_latest_semester()");
  const data = response.rows[0].semid;
  SEMESTER = data;

  const [openCourse, prerequisite] = await Promise.all([
    getUpcomingCourse(SEMESTER),
    getPrereq(),
  ]);

  GLOBAL_CONTEXT.prerequisite = prerequisite;
  GLOBAL_CONTEXT.openCourse = openCourse;
}
initialFetchContext();

// Store chat session
const userSessions = new Map();

router.post("/api/student/chat", async (request, response) => {
  const accountID = request.user.accountid;
  const { message } = request.body;
  let prompt = ``;
  let chatHistory = [];

  try {
    let userSession = userSessions.get(accountID);

    if (!userSession) {
      const [history, curriculum] = await Promise.all(
        [
          getStudentHistory(accountID, SEMESTER),
          // getUpcomingCourse(SEMESTER),
          getCurriculum(accountID),
          // getPrereq(),
        ]
      );
      console.log(`[${new Date().toISOString()}]`);

      // console.log(`HISTORY: ${JSON.stringify(history)}`);
      // console.log(`OPEN: ${JSON.stringify(GLOBAL_CONTEXT.openCourse)}`);
      // console.log(`CURR: ${JSON.stringify(curriculum)}`);
      // console.log(`PRE: ${JSON.stringify(prerequisite)}`);
      prompt = `
            You are a professor in Academic Advisor in various famous university around the world.
            You always provide the useful pieces of advice with 100% of accuracy for students in learning progress.
            Recently, you are a anAcademic Advisor in XYZ university, which is a private university in Viet Nam, training tens of majors in various field like information technology, economic, tourism, linguistics,...

            I will provide 4 types of inputs including list of course that students have already studied and passed, list of upcoming courses for the next semester, the curriculum of student's major and prerequisites rules
            Based on all inputs, answer student's questions
            Your answers should be clear and concise since students need the quick helps.

            Here are four input categories:
            1. Student's studied courses: ${JSON.stringify(history)}
            2. List of upcoming courses for the next semester: ${JSON.stringify(
              GLOBAL_CONTEXT.openCourse
            )}
            3. The curriculum of student's major: ${JSON.stringify(curriculum)}
            4. Prerequisite rules: ${JSON.stringify(GLOBAL_CONTEXT.prerequisite)}


            DATA READING INSTRUCTIONS:
            1. "OPEN_CLASSES": List of course codes for registration.
            2. "CURRICULUM":
                - "selection_rule": "MANDATORY" (Required courses).
                - "selection_rule": "OPTIONAL_PICK_N" (Optional courses, must accumulate enough courses according to "pick_count").
            3. "PREREQUISITES" (Prerequisite courses):
                - Carefully read the "logic" (AND/OR) and "group" columns.
                - If groups are the same, consider the logic within that group.
                - If groups are different, default to AND (must satisfy all groups).

            GUARDRAIL'S GUIDELINES:
                - Only answer questions about: Courses, Credit Registration, Prerequisites, and Study Pathways based on the given inputs.
                - If a student asks about Prerequisites: Clearly state the requirements in the format "To take Course A, you need to pass: (Course X or Course Y) AND (Course Z)".
                - If a student asks an unrelated question (e.g., "Tell a joke", "Write game code"): Respond with: "Sorry, I'm only here to answer questions about the coursework related to your progress".
                - Tone: Friendly and energetic
                - Language: Based on the user's language

            EXAMPLE ANSWER:
                User: "What are the requirements for the ENG 166 course?"
                You: "To take the ENG 166 course, you need to meet the following requirements:
                    - Group 1: Completed ENG 116.
                    Note: This course is currently NOT available."
        `;

      chatHistory = [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
        {
          role: "model",
          parts: [{ text: "Got it. I'm ready to assist students" }],
        },
      ];

      const chat = model.startChat({
        history: chatHistory,
      });

      userSession = { chat };
      userSessions.set(accountID, userSession);

      setTimeout(() => userSessions.delete(accountID), 30 * 60 * 1000);
    }

    const result = await userSession.chat.sendMessage(message);
    const text_version = result.response.text();

    response.json({ reply: text_version });
  } catch (error) {
    userSessions.delete(accountID);
    if (error.message.includes("429") || error.status === 429) {
      return response.status(429).json({message: "429"});
    }
    response.json({ msg: error.message });
  }
});

export default router;
