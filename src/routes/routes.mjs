import { Router } from "express";
import authRouter from '../auth/auth.mjs';
import classRoute from '../admin/ClassManagement/ViewClass.mjs';
import addclassRoute from '../admin/ClassManagement/AddClass.mjs'
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'

const router = Router();

router.use(authRouter);
router.use(classRoute);
router.use(addclassRoute);
router.use(viewCourseRouter);

export default router