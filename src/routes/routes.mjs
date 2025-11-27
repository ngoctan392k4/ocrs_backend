import { Router } from "express";
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'
import authRouter from '../auth/auth.mjs'
import classRoute from '../admin/ClassManagement/ViewClass.mjs'
import addClassRouter from '../admin/ClassManagement/AddClass.mjs'  
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
import DeleteAccountRouter from '../admin/AccountManagement/DeleteAccount.mjs'
import EditAccountRouter from '../admin/AccountManagement/EditAccount.mjs'
import editClassRouter from '../admin/ClassManagement/EditClass.mjs'


const router = Router();
router.use(authRouter);
router.use(CourseManagementRouter);
router.use(classRoute);
router.use(viewAccountRouter);
router.use(addAccountRouter);
router.use(DeleteAccountRouter);
router.use(EditAccountRouter);

router.use(addClassRouter);
router.use(editClassRouter);


export default router;
