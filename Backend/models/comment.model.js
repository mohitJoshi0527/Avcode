import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date,     default: Date.now }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  videoId:   { type: mongoose.Schema.Types.ObjectId, required: true },  // matches content.videos._id
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date,   default: Date.now },
  replies:   [replySchema]
}, {
  timestamps: true   // also adds updatedAt if you ever edit comments
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default Comment;