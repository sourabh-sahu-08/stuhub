import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";

export const settingsRouter = Router();

// Helper to get or create settings
async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

// Public accessible: get current settings
settingsRouter.get("/", async (_req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Admin only: update settings
settingsRouter.put("/ai-chatbot", requireAuth, allowRoles("admin"), async (req, res, next) => {
  try {
    const { isAiChatbotEnabled } = req.body;
    let settings = await getSettings();
    settings.isAiChatbotEnabled = Boolean(isAiChatbotEnabled);
    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});
