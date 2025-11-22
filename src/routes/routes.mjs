import { Router } from "express";
import authRouter from '../auth/auth.mjs';
import classRoute from '../admin/ClassManagement/ViewClass.mjs';
import addclassRoute from '../admin/ClassManagement/AddClass.mjs'
import courseDeleteRoute from '../admin/CourseManagement/DeleteCourse.mjs';
import viewCourseRouter from '../admin/CourseManagement/ViewCourse.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'
import editClassRouter from '../admin/ClassManagement/AddClass.mjs'
import courseDeleteRoute from '../admin/CourseManagement/DeleteCourse.mjs';
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
import DeleteAccountRouter from '../admin/AccountManagement/DeleteAccount.mjs'

const router = Router();

router.use(authRouter);
router.use(classRoute);
router.use(addclassRoute);
router.use(viewCourseRouter);
router.use(courseDeleteRoute);
router.use(viewAccountRouter);
router.use(addAccountRouter);
router.use(editClassRouter);
router.use(DeleteAccountRouter);

export default router