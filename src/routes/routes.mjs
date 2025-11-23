import { Router } from "express";
import authRouter from '../auth/auth.mjs'
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
import DeleteAccountRouter from '../admin/AccountManagement/DeleteAccount.mjs'


const router = Router();
router.use(authRouter);
router.use(CourseManagementRouter);
router.use(viewAccountRouter);
router.use(addAccountRouter);
router.use(DeleteAccountRouter);

export default router