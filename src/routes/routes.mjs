import { Router } from "express";
import CourseManagementRouter from '../admin/CourseManagement/CourseManagement.mjs'
import viewAccountRouter from '../admin/AccountManagement/viewAccountList.mjs'
import authRouter from '../auth/auth.mjs'
import classRoute from '../admin/ClassManagement/ViewClass.mjs'
import addClassRouter from '../admin/ClassManagement/AddClass.mjs'
import addAccountRouter from '../admin/AccountManagement/AddAccount.mjs'
import DeleteAccountRouter from '../admin/AccountManagement/DeleteAccount.mjs'
import editClassRouter from '../admin/ClassManagement/EditClass.mjs'
import viewRegisteredRouter from '../student/ClassRegistration/RegisteredClass.mjs'
import EditAccountRouter from '../admin/AccountManagement/EditAccount.mjs'
import OpenCourseRouter from '../admin/OpenCourse/OpenCourse.mjs'
import DashboardRouter from '../admin/Dashboard/Dashboard.mjs'

import ClassRegistrationRouter from '../student/registration.mjs'
import StudySchedule from '../student/Schedule/StudySchedule.mjs';
import viewAvailableCourseRouter from '../student/viewAvailableCourse.mjs'
import viewAvalabieClassRouter from '../student/viewAvailableClass.mjs'
import payTuitionRouter from '../student/TuitionPayment/payTuition.mjs'
import paymentHistory from '../student/TuitionPayment/paymentHistory.mjs'
import detailTranscriptRouter from '../student/ViewTranscript/ViewDetailTranscript.mjs'
import overallTransciptRouter from '../student/ViewTranscript/ViewOverallTranscript.mjs'

import Teaching from '../instructor/teaching.mjs'
import TeachingSchedule from '../instructor/Schedule/TeachingSchedule.mjs';
import ClassGrade from '../instructor/ClassGrade.mjs'

import recommendationController from '../student/AI/Recommendation/recommendationController.mjs'
import chatbot from '../student/AI/Chatbot/chatbot.mjs'
import SmartTimeTable from '../student/AI/SmartTimeTable/TimeTable.mjs'

const router = Router();
router.use(authRouter);

// Admin
router.use(CourseManagementRouter);
router.use(classRoute);
router.use(viewAccountRouter);
router.use(addAccountRouter);
router.use(DeleteAccountRouter);
router.use(addClassRouter);
router.use(editClassRouter);
router.use(viewRegisteredRouter);
router.use(EditAccountRouter);
router.use(OpenCourseRouter);
router.use(DashboardRouter);


// Student
router.use(ClassRegistrationRouter);
router.use(StudySchedule);
router.use(ClassRegistrationRouter)
router.use(viewAvailableCourseRouter)
router.use(viewAvalabieClassRouter)
router.use(payTuitionRouter)
router.use(paymentHistory)
router.use(viewAvailableCourseRouter);
router.use(viewAvalabieClassRouter);
router.use(detailTranscriptRouter);
router.use(recommendationController);
router.use(chatbot);
router.use(SmartTimeTable);
router.use(overallTransciptRouter);

// Instructor
router.use(Teaching);
router.use(TeachingSchedule);
router.use(ClassGrade);

export default router;
