import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User";
import { Note } from "../src/models/Note";
import { Pyq } from "../src/models/Pyq";
import { CtPyq } from "../src/models/CtPyq";
import { Assignment } from "../src/models/Assignment";
import { Resource } from "../src/models/Resource";
import { ActivityLog } from "../src/models/ActivityLog";

dotenv.config();

async function syncGamification() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  const users = await User.find({});
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    const [notes, pyqs, ctpyqs, assignments, resources] = await Promise.all([
      Note.countDocuments({ user: user._id }),
      Pyq.countDocuments({ user: user._id }),
      CtPyq.countDocuments({ user: user._id }),
      Assignment.countDocuments({ user: user._id }),
      Resource.countDocuments({ user: user._id })
    ]);

    const bonus = user.gamification?.bonusUploads || 0;
    const totalUploads = notes + pyqs + ctpyqs + assignments + resources + bonus;
    const uploadsXp = totalUploads * 20;

    // Get non-upload XP
    const nonUploadActivities = await ActivityLog.find({
      user: user._id,
      actionType: { $nin: ["UPLOAD_NOTE", "UPLOAD_PYQ", "UPLOAD_CTPYQ", "UPLOAD_ASSIGNMENT", "UPLOAD_RESOURCE"] }
    });

    const otherXp = nonUploadActivities.reduce((sum, act) => sum + (act.xpEarned || 0), 0);
    const totalXp = uploadsXp + otherXp;
    
    // Level is floor(XP / 100) + 1
    const newLevel = Math.floor(totalXp / 100) + 1;

    if (!user.gamification) {
      user.gamification = {
        xp: totalXp,
        level: newLevel,
        reputation: totalXp,
        currentStreak: 0,
        longestStreak: 0,
        bonusUploads: bonus
      };
    } else {
      user.gamification.xp = totalXp;
      user.gamification.level = newLevel;
      user.gamification.reputation = totalXp;
      // keep streaks
    }

    await user.save();
    console.log(`Synced ${user.name}: ${totalUploads} uploads, ${totalXp} XP, Level ${newLevel}`);
  }

  console.log("Sync complete!");
  process.exit(0);
}

syncGamification().catch(console.error);
