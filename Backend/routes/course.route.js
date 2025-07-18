import express from 'express';
import videoUpload from '../middleware/vidoeUploader.js';
import { uploadCourseVideo } from '../controllers/course.controller.js';
import { createCourse } from '../controllers/course.controller.js';
import {  ensureAuthenticated } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import { deleteCourseVideo } from '../controllers/course.controller.js';
import { getVideoUrl } from '../controllers/course.controller.js';
import { uploadAttachment } from '../controllers/course.controller.js';
import attachUploader from '../middleware/attachUploader.js';
import { getAttachmentUrl } from '../controllers/course.controller.js';
const router = express.Router();

router.post(
  '/:courseId/videos',
  ensureAuthenticated,authorizeRoles("instructor"),videoUpload.single('video'),
  uploadCourseVideo
);
router.post(
  '/createcourse',ensureAuthenticated,authorizeRoles("instructor"),createCourse
);
router.delete(
  '/:courseId/videos/:videoId',
  ensureAuthenticated, authorizeRoles("instructor"),
  deleteCourseVideo
)
router.get(
  '/:courseId/videos/:videoId/url',
  ensureAuthenticated, authorizeRoles("instructor"),
  getVideoUrl
);
router.post(
  '/:courseId/attachments',
  ensureAuthenticated, authorizeRoles("instructor"),attachUploader.single('file'),
  uploadAttachment
);
router.get(
  "/:courseId/attachments/:fileKey/url",
 ensureAuthenticated, authorizeRoles("instructor"),
  getAttachmentUrl
);
export default router;
