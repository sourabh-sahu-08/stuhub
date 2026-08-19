import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Note } from "../models/Note.js";
import { Pyq } from "../models/Pyq.js";
import { CtPyq } from "../models/CtPyq.js";
import { Assignment } from "../models/Assignment.js";
import { Resource } from "../models/Resource.js";
import { ActivityLog } from "../models/ActivityLog.js";

dotenv.config();

const XP_REWARDS = {
  UPLOAD_NOTE: 20,
  UPLOAD_PYQ: 20,
  UPLOAD_CTPYQ: 20,
  UPLOAD_ASSIGNMENT: 20,
  UPLOAD_RESOURCE: 20,
};

async function backfillXp() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stuhub");
    console.log("Connected to DB. Starting XP backfill...");

    const users = await User.find();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      const [notes, pyqs, ctpyqs, assignments, resources] = await Promise.all([
        Note.find({ user: user._id }),
        Pyq.find({ user: user._id }),
        CtPyq.find({ user: user._id }),
        Assignment.find({ user: user._id }),
        Resource.find({ user: user._id }),
      ]);

      const totalUploads = notes.length + pyqs.length + ctpyqs.length + assignments.length + resources.length;
      
      // Calculate expected base XP from uploads
      const expectedXp = 
        (notes.length * XP_REWARDS.UPLOAD_NOTE) +
        (pyqs.length * XP_REWARDS.UPLOAD_PYQ) +
        (ctpyqs.length * XP_REWARDS.UPLOAD_CTPYQ) +
        (assignments.length * XP_REWARDS.UPLOAD_ASSIGNMENT) +
        (resources.length * XP_REWARDS.UPLOAD_RESOURCE);

      if (totalUploads > 0) {
        if (!user.gamification) {
          user.gamification = {
            xp: 0,
            level: 1,
            reputation: 0,
            currentStreak: 0,
            longestStreak: 0,
            bonusUploads: 0,
            lastContributionDate: undefined,
          };
        }

        // Strictly calculate based on uploads. Add likes/downloads if available.
        const totalLikes = 
          notes.reduce((sum, n) => sum + ((n as any).likes || 0), 0) +
          pyqs.reduce((sum, p) => sum + ((p as any).likes || 0), 0) +
          ctpyqs.reduce((sum, c) => sum + ((c as any).likes || 0), 0) +
          assignments.reduce((sum, a) => sum + ((a as any).likes || 0), 0) +
          resources.reduce((sum, r) => sum + ((r as any).likes || 0), 0);

        const totalDownloads = 
          notes.reduce((sum, n) => sum + ((n as any).downloads || 0), 0) +
          pyqs.reduce((sum, p) => sum + ((p as any).downloads || 0), 0) +
          ctpyqs.reduce((sum, c) => sum + ((c as any).downloads || 0), 0) +
          assignments.reduce((sum, a) => sum + ((a as any).downloads || 0), 0) +
          resources.reduce((sum, r) => sum + ((r as any).downloads || 0), 0);

        const exactXp = expectedXp + (totalLikes * 5) + (totalDownloads * 2);

        if (user.gamification.xp !== exactXp || user.gamification.bonusUploads !== 0) {
          console.log(`Resetting ${user.name}: Has ${totalUploads} uploads, ${totalLikes} likes, ${totalDownloads} downloads. Current XP: ${user.gamification.xp}. New Exact XP: ${exactXp}`);
          user.gamification.xp = exactXp;
          user.gamification.reputation = exactXp;
          user.gamification.level = Math.floor(exactXp / 100) + 1;
          user.gamification.bonusUploads = 0; // Strip the boost
          await user.save();
        }
      }
    }
    console.log("XP backfill complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during backfill:", error);
    process.exit(1);
  }
}

backfillXp();
