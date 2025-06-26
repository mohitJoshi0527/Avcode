import express from 'express';
import videoUpload from '../middleware/vidoeUploader.js';
import { uploadCourseVideo } from '../controllers/course.controller.js';
import { createCourse } from '../controllers/course.controller.js';
const router = express.Router();

router.post(
  '/:courseId/videos',
  videoUpload.single('video'),
  uploadCourseVideo
);
router.post(
  '/createcourse',createCourse
);

export default router;
