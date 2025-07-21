import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import MongoStore from "connect-mongo";
import { connectDB } from "./config/db.js";
import "./utils/passport.js"; 
import authRoutes from "./routes/auth.route.js";
import courseRoutes from "./routes/course.route.js";
import instructorRoutes from "./routes/instructor.route.js"; 
import studentRoutes from "./routes/student.route.js"; 
import commentRoutes from "./routes/comment.route.js"; 
import path from "path";
import cors from "cors";
dotenv.config(); 
const _dirname=path.resolve();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
}))
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:process.env.MONGODB_URL,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      httpOnly: true,
      secure: false, 
      sameSite : 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/course", courseRoutes); 
app.use("/api/instructor",instructorRoutes); 
app.use("/api/student", studentRoutes); 
app.use("/api/comment",commentRoutes);
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

app.use(express.static(path.join(_dirname,"frontend/dist")))
app.get('*',(req,res)=>{
  res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"))
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
