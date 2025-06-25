  import mongoose from "mongoose";
  const courseSchema = new mongoose.Schema({
    title : {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true, 
    },
    tags : {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content:{
      videos: [
        {
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
          },
          videoUrl: {
            type: String,
            required: true,
          },
        },
      ],
      attachments: [
        {
          pdf: [
            {
            type: String,
            fileURL: String,
            },
        ],
          codeFiles: {
            type: String,
            fileURL: String,
          },
        },
      ],
    }
  });
  const Course = mongoose.model("Course", courseSchema);
  export default Course;