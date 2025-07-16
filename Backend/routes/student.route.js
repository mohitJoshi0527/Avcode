import express from "express";
import {enrolledCourses,allCourses,pushenrollCourse, getCourseContent,rateCourse} from "../controllers/student.controller.js";
import { ensureAuthenticated, authorizeRoles } from "../middleware/auth.js"; 
const router = express.Router();
router.get('/enrolled',ensureAuthenticated, authorizeRoles("student"),enrolledCourses);
router.get('/all', ensureAuthenticated, authorizeRoles("student"), allCourses);
router.post('/enroll/:courseId', ensureAuthenticated, authorizeRoles("student"), pushenrollCourse);
router.get('/getcourse/:courseId', ensureAuthenticated, authorizeRoles("student"), getCourseContent);
router.post('/course/:courseId/rate',ensureAuthenticated, authorizeRoles("student"), rateCourse);

export default router;