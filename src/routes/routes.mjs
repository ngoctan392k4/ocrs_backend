import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'

const router = Router();

router.use(authRouter);
router.use(CourseManagementRouter);
import courseDeleteRoute from '../admin/CourseManagement/DeleteCourse.mjs';
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'


router.use(authRouter);
router.use(viewCourseRouter);
router.use(courseDeleteRoute);
router.use(addAccountRouter);

export default router