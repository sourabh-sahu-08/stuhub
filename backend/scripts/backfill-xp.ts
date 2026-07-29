import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/models/User.js';
import { Note } from '../src/models/Note.js';
import { Pyq } from '../src/models/Pyq.js';
import { CtPyq } from '../src/models/CtPyq.js';
import { Assignment } from '../src/models/Assignment.js';

async function backfillXP() {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected.");

    const users = await User.find({});
    console.log(`Found ${users.length} users. Backfilling XP...`);

    for (const user of users) {
      const [notes, pyqs, ctpyqs, assignments] = await Promise.all([
        Note.countDocuments({ user: user._id }),
        Pyq.countDocuments({ user: user._id }),
        CtPyq.countDocuments({ user: user._id }),
        Assignment.countDocuments({ user: user._id })
      ]);

      const totalUploads = notes + pyqs + ctpyqs + assignments;
      const calculatedXp = totalUploads * 20;
      const level = Math.floor(calculatedXp / 100) + 1;

      if (!user.gamification) {
        user.gamification = {
          xp: 0,
          level: 1,
          reputation: 0,
          currentStreak: 0,
          longestStreak: 0
        };
      }

      user.gamification.xp = calculatedXp;
      user.gamification.reputation = calculatedXp;
      user.gamification.level = level;
      user.gamification.longestStreak = totalUploads > 0 ? 1 : 0;
      
      await user.save();
      console.log(`Updated ${user.name}: XP=${calculatedXp}, Lvl=${level}`);
    }

    console.log("Backfill complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error backfilling XP:", error);
    process.exit(1);
  }
}

backfillXP();
