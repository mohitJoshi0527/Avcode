import mongoose from "mongoose";

// Sub-schema for file entries
const fileSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // MIME type
    s3Key: { type: String, required: true }, // S3 path
  },
  { _id: false } // prevent automatic _id in subdocs
);

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    videos: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        s3Key: {
          type: String,
          required: true,
        },
      },
    ],
    attachments: [
      {
        pdf: [fileSchema],
        codeFiles: [fileSchema],
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
  },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
