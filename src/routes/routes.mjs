import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'

const router = Router();

router.use(authRouter);
router.use(viewCourseRouter);
router.use(viewAccountRouter);

export default router