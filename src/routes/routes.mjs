import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import courseDeleteRoute from '../admin/CourseManagement/DeleteCourse.mjs';
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'

import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
import editAccountRouter from '../admin/AccountManagement/EditAccount.mjs'
const router = Router();

router.use(authRouter);
router.use(viewCourseRouter);
router.use(viewAccountRouter);
router.use(courseDeleteRoute);
router.use(addAccountRouter);
router.use(editAccountRouter);



export default router;
