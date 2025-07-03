import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, required: true },
  AvatarUrl: { type: String, default: "" },
  roles: {
    type: [String],
    enum: ["student", "instructor", "admin"],
    default: ["student"],
    required: true,
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
}, {
  timestamps: true,
});

// ✅ Safe model creation
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
