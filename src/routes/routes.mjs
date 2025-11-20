import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'

const router = Router();

router.use(authRouter);
router.use(CourseManagementRouter);

export default router