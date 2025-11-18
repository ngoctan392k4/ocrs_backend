import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'

const router = Router();

router.use(authRouter);
router.use(viewCourseRouter);

export default router