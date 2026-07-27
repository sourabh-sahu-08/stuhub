import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import type { AuthTokenPayload } from "../types.js";

// Extend Socket to include the authenticated user
interface AuthenticatedSocket extends Socket {
  user?: AuthTokenPayload;
}

export function setupSocketServer(io: Server) {
  // Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log(`User connected to chat: ${socket.user?.id}`);

    try {
      // Send the last 50 messages to the newly connected client
      const recentMessages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "name avatar role")
        .populate({
          path: "replyTo",
          select: "text sender",
          populate: { path: "sender", select: "name" }
        })
        .lean();

      // Reverse to chronological order (oldest to newest)
      recentMessages.reverse();
      socket.emit("chat_history", recentMessages);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }

    // Handle incoming messages
    socket.on("send_message", async (payload: { text: string; replyTo?: string } | string) => {
      let text = "";
      let replyToId = null;

      if (typeof payload === "string") {
        text = payload;
      } else if (payload && typeof payload === "object") {
        text = payload.text;
        if (payload.replyTo) {
          replyToId = payload.replyTo;
        }
      }

      if (!text || typeof text !== "string" || text.trim().length === 0) return;
      if (!socket.user) return;

      try {
        const newMessage = await Message.create({
          text: text.trim(),
          sender: socket.user.id,
          replyTo: replyToId
        });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "name avatar role")
          .populate({
            path: "replyTo",
            select: "text sender",
            populate: { path: "sender", select: "name" }
          })
          .lean();

        // Broadcast to all connected clients
        io.emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });
    // Admin: Delete a message
    socket.on("delete_message", async (messageId: string) => {
      if (!socket.user || !["admin", "co-owner", "owner"].includes(socket.user.role)) {
        return; // Only admins, co-owners, and owners can delete
      }

      try {
        const message = await Message.findById(messageId).populate("sender");
        if (!message) return;

        // Prevent non-owners from deleting owner messages
        if ((message.sender as any).role === "owner" && socket.user.role !== "owner") {
          return;
        }

        await Message.findByIdAndDelete(messageId);
        io.emit("message_deleted", messageId);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    });

    // Owner: Edit a message
    socket.on("edit_message", async (payload: { messageId: string; newText: string }) => {
      if (!socket.user || socket.user.role !== "owner") {
        return; // Only owners can edit messages
      }

      try {
        const { messageId, newText } = payload;
        if (!newText || typeof newText !== "string" || newText.trim().length === 0) return;

        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { text: newText.trim(), isEdited: true },
          { new: true }
        )
          .populate("sender", "name avatar role")
          .populate({
            path: "replyTo",
            select: "text sender",
            populate: { path: "sender", select: "name" }
          })
          .lean();

        if (updatedMessage) {
          io.emit("message_edited", updatedMessage);
        }
      } catch (err) {
        console.error("Error editing message:", err);
      }
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected from chat: ${socket.user?.id}`);
    });
  });
}
