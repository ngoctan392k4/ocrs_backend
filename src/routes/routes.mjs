import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
const router = Router();

router.use(authRouter);
router.use(viewCourseRouter);
router.use(addAccountRouter);

export default router