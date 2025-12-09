import {
  getStudentHistory,
  getCurriculum,
  getUpcomingCourse,
  getPrereq,
} from "./recommendation.mjs";
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const router = Router();

router.post("/api/student/recommendCourse", async (request, response) => {
  const accountID = request.user.accountid;
  const { semester } = request.body;
  let prompt = ``;

  try {
    const [history, openCourse, curriculum, prerequisite] = await Promise.all([
      getStudentHistory(accountID, semester),
      getUpcomingCourse(semester),
      getCurriculum(accountID),
      getPrereq(),
    ]);
    console.log(`[${new Date().toISOString()}]`);

    // console.log(`HISTORY: ${JSON.stringify(history)}`);
    // console.log(`OPEN: ${JSON.stringify(openCourse)}`);
    // console.log(`CURR: ${JSON.stringify(curriculum)}`);
    // console.log(`PRE: ${JSON.stringify(prerequisite)}`);

    prompt = `
            You are a professor in Course Recommendation Assistance in various famous university around the world.
            You always provide the useful pieces of advice with 100% of accuracy for students in learning progress.
            Recently, you are a Course Recommendation Assistant in XYZ university, which is a private university in Viet Nam, training tens of majors in various field like information technology, economic, tourism, linguistics,...

            I will provide 4 types of inputs including list of course that students have already studied and passed, list of upcoming courses for the next semester, the curriculum of student's major and prerequisites rules
            Based on all inputs, recommend the best set of courses for student
            Your recommendations must include course options (only course ID) such that the maximum of credits in the semester is 20 credits

            Here are my three input categories:
            1. Student's studied courses: ${JSON.stringify(history)}
            2. List of upcoming courses for the next semester: ${JSON.stringify(
              openCourse
            )}
            3. The curriculum of student's major: ${JSON.stringify(curriculum)}
            4. Prerequisite rules: ${JSON.stringify(prerequisite)}

            TASK:
            Suggest courses for this student based on the following rules:
            - Rule 1: Only suggest courses that are in the "Open Courses" list.
            - Rule 2: Do NOT suggest courses that are already in the "Student History".
            - Rule 3 (Important): Check "Prerequisite Rules".
                + If the course is not in the rules list -> Allowed to take.
                + If the course has a rule -> Check if the student has taken the required courses.
                + Note the AND/OR logic in the condition groups. AND is mandatory for all prerequisites; OR is optional with pick of n for prerequisites

            OUTPUT FORMAT (List):
            [
                course_id, course_id, course_id,....
            ]
        `;
  } catch (error) {
    response.json({ msg: error.message });
  }

  try {
    const result = await model.generateContent(prompt);
    const response_AI = result.response;
    const text_version = response_AI.text();
    console.log(`[${new Date().toISOString()}]`);
    response.json(JSON.parse(text_version));

  } catch (error) {
    response.json({ msg: error.message });
  }
});

export default router;
