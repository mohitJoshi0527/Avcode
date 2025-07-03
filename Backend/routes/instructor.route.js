import express from "express";
const router = express.Router();
import {getCourse, getCourseById } from "../controllers/instructor.controller.js";
import { ensureAuthenticated, authorizeRoles } from "../middleware/auth.js";
router.get("/courses", ensureAuthenticated, authorizeRoles("instructor"),getCourse);
router.get("/courses/:courseId", ensureAuthenticated, authorizeRoles("instructor"), getCourseById);
export default router;