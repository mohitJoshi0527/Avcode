// server.js

import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import MongoStore from "connect-mongo";
import { connectDB } from "./config/db.js";
import "./utils/passport.js"; // load Google strategy
import authRoutes from "./routes/auth.route.js";
import courseRoutes from "./routes/course.route.js";
import cors from "cors";
// ✅ Load environment variables
dotenv.config(); // `.env` is now in /Backend

// ✅ Create express app
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL, // Adjust as needed
  credentials: true,
}))
// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Sessions (MongoDB store)
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
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false, // true if HTTPS (production)
      sameSite : 'lax',
    },
  })
);

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/course", courseRoutes); 
// ✅ Test route (optional)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
