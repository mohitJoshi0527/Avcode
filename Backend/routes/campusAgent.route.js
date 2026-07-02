import express from "express";
import axios from "axios";
import { ensureAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/campus-agent/chat
 *
 * Auth-protected gateway to the Python Smart Campus Assistant.
 * The student_id is taken from req.user._id (Passport session) and injected
 * server-side — the browser NEVER has the ability to supply or spoof it.
 */
router.post(
  "/chat",
  ensureAuthenticated,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string" || query.trim().length === 0) {
        return res.status(400).json({ message: "Query is required." });
      }

      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://localhost:8000";

      // student_id is injected HERE — the user message only contains the query
      const payload = {
        student_id: req.user._id.toString(),
        query: query.trim(),
      };

      const aiResponse = await axios.post(
        `${aiServiceUrl}/campus-agent/chat`,
        payload,
        { timeout: 60000 } // 60s timeout for agentic multi-step reasoning
      );

      return res.status(200).json({ response: aiResponse.data.response });
    } catch (err) {
      console.error("Campus Agent error:", err.message);
      const status = err.response?.status || 500;
      const message =
        err.response?.data?.detail || "Campus Agent encountered an error.";
      return res.status(status).json({ message });
    }
  }
);

export default router;
