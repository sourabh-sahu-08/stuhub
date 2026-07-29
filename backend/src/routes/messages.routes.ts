import { Router } from "express";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { AuthRequest } from "../types.js";

export const messagesRouter = Router();

// Post an admin request message (from a student to owners/co-owners)
messagesRouter.post("/admin-request", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Save as a broadcast message for admins
    const newMessage = new Message({
      text: message,
      sender: req.user?.id, // Note: req.user from JWT payload has 'id', not '_id' typically
      type: "admin-request"
    });

    await newMessage.save();
    res.status(201).json({ message: "Request sent successfully" });
  } catch (error) {
    next(error);
  }
});

// Get messages for admins
messagesRouter.get("/admin", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user || !["owner", "co-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ type: "admin-request" })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});
