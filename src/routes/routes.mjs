import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import courseDeleteRoute from '../admin/CourseManagement/DeleteCourse.mjs';
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'



const router = Router();

router.use(authRouter);
router.use(viewCourseRouter);
router.use(courseDeleteRoute);

export default router