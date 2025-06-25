import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  AvatarUrl: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["instructor", "admin","student"], 
    default: "student", 
    required: true,
  },
}, {
  timestamps: true, 
});
const User = mongoose.model("User", userSchema);
export default User;