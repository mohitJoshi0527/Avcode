import express from 'express';
import { getCurrentUser, logout } from '../controllers/auth.controller.js';
import {  googleCallback,googleLogin } from '../controllers/auth.controller.js';

const router = express.Router();

// 🔁 1. Start Google OAuth login
router.get('/google',googleLogin);
router.get('/success', (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(`
      <h2>✅ Login successful</h2>
      <p>You are now logged in.</p>
      <pre>${JSON.stringify(req.user, null, 2)}</pre>
      <p>Try accessing <a href="/profile">/profile</a> to confirm session works.</p>
    `);
  }
  res.status(401).send("<h2>❌ Not authenticated</h2>");
});
// 🔁 2. Callback route after Google login
router.get('/google/callback',googleCallback);
router.get('/me', getCurrentUser);

// 🚪 4. Logout route
router.get('/logout', logout);
export default router;
