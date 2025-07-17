import express from 'express';
import { postComment } from '../controllers/comment.controller.js';
import { postReply } from '../controllers/comment.controller.js';
import { getComments } from '../controllers/comment.controller.js';
const router = express.Router();
router.post('/course/:courseId/video/:videoId/comment', postComment);
router.post('/:commentId/reply', postReply);
router.get('/course/:courseId/video/:videoId/comments', getComments);
export default router;
