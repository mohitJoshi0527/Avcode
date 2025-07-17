// POST /api/course/:courseId/video/:videoId/comment
// body: { content: string }
import Comment from '../models/comment.model.js';
export async function postComment(req, res) {
  const { courseId, videoId } = req.params;
  const { content } = req.body;
  const author = req.user._id;

  const comment = new Comment({ course: courseId, videoId, author, content });
  await comment.save();
  res.status(201).json(comment);
}
// POST /api/comment/:commentId/reply
// body: { content: string }
export async function postReply(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;
  const author = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) return res.status(404).json({ message: 'Not found' });

  comment.replies.push({ author, content });
  await comment.save();
  res.json(comment);
}
// GET /api/course/:courseId/video/:videoId/comments
export async function getComments(req, res) {
  const { courseId, videoId } = req.params;
  const comments = await Comment
    .find({ course: courseId, videoId })
    .populate('author', 'name avatarUrl')
    .populate('replies.author', 'name avatarUrl')
    .sort('createdAt');
  res.json(comments);
}
