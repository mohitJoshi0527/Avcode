import express from "express";
import {enrolledCourses,allCourses} from "../controllers/student.controller.js";
import { ensureAuthenticated, authorizeRoles } from "../middleware/auth.js"; 
const router = express.Router();
router.get('/enrolled',ensureAuthenticated, authorizeRoles("student"),enrolledCourses);
router.get('/all', ensureAuthenticated, authorizeRoles("student"), allCourses);
export default router;