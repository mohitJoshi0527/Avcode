import express from 'express';
import { getCurrentUser, logout } from '../controllers/auth.controller.js';
import {  googleCallback,googleLogin } from '../controllers/auth.controller.js';

const router = express.Router();

// 🔁 1. Start Google OAuth login
router.get('/google',googleLogin);
router.get('/success', (req, res) => {
  res.status(200).json({ message: 'Login successful', user: req.user });
});
// 🔁 2. Callback route after Google login
router.get('/google/callback',googleCallback);
router.get('/me', getCurrentUser);

// 🚪 4. Logout route
router.get('/logout', logout);
export default router;
