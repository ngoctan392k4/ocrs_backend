import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'


const router = Router();
router.use(authRouter);
router.use(CourseManagementRouter);
router.use(addAccountRouter);
router.use(DeleteAccountRouter);

export default router