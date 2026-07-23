import { Router } from "express";
import { Feedback } from "../models/Feedback";

const router = Router();

// Submit new feedback
router.post("/", async (req, res) => {
  try {
    const { name, email, type, message } = req.body;

    if (!name || !email || !type || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!['issue', 'suggestion'].includes(type)) {
      return res.status(400).json({ message: "Invalid feedback type" });
    }

    const newFeedback = new Feedback({
      name,
      email,
      type,
      message,
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ message: "Failed to submit feedback", error: error.message });
  }
});

export default router;
