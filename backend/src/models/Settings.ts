import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  isAiChatbotEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// We use a singleton pattern, so there's only one Settings document.
export const Settings = mongoose.model("Settings", settingsSchema);
