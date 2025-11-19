import { Router } from "express";
import authRouter from '../auth/auth.mjs';
import classRoute from '../admin/ClassManagement/ViewClass.mjs';


const router = Router();

router.use(authRouter);
router.use(classRoute);

export default router