import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { UserBadge } from "../models/UserBadge.js";

const XP_REWARDS = {
  UPLOAD_NOTE: 20,
  UPLOAD_PYQ: 20,
  UPLOAD_CTPYQ: 20,
  UPLOAD_ASSIGNMENT: 20,
  UPLOAD_RESOURCE: 20,
  RECEIVED_LIKE: 5,
  RECEIVED_DOWNLOAD: 2,
  DAILY_CONTRIBUTION: 10,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 250,
};

export class GamificationService {
  /**
   * Logs an activity and awards XP to the user.
   * Handles streak updates and levels automatically.
   */
  static async logActivity(
    userId: string | mongoose.Types.ObjectId,
    actionType: keyof typeof XP_REWARDS,
    itemRef?: string | mongoose.Types.ObjectId,
    itemModel?: string,
    description?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");
      
      if (!user.gamification) {
        user.gamification = {
          xp: 0,
          level: 1,
          reputation: 0,
          currentStreak: 0,
          longestStreak: 0,
          bonusUploads: 0,
          lastContributionDate: undefined
        };
      }

      let xpEarned = XP_REWARDS[actionType] || 0;
      let isDailyFirst = false;

      // Handle Daily Streak Logic for Uploads
      if (actionType.startsWith("UPLOAD_")) {
        const now = new Date();
        const lastDate = user.gamification?.lastContributionDate;

        if (!lastDate) {
          // First ever upload
          isDailyFirst = true;
          user.gamification!.currentStreak = 1;
          user.gamification!.longestStreak = 1;
        } else {
          const nowStr = now.toISOString().split("T")[0];
          const lastStr = lastDate.toISOString().split("T")[0];

          if (nowStr !== lastStr) {
            isDailyFirst = true;
            // Check if exactly one day difference
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1 || diffDays === 0) { // handling tz diffs
              user.gamification!.currentStreak += 1;
              if (user.gamification!.currentStreak > user.gamification!.longestStreak) {
                user.gamification!.longestStreak = user.gamification!.currentStreak;
              }
            } else {
              // Streak broken
              user.gamification!.currentStreak = 1;
            }
          }
        }
        
        user.gamification!.lastContributionDate = now;

        if (isDailyFirst) {
          xpEarned += XP_REWARDS.DAILY_CONTRIBUTION;
          await ActivityLog.create([{
            user: userId,
            actionType: "STREAK_BONUS",
            xpEarned: XP_REWARDS.DAILY_CONTRIBUTION,
            description: `Daily contribution bonus`
          }], { session });
        }

        // Check for streak badges
        if (user.gamification!.currentStreak === 7) {
          xpEarned += XP_REWARDS.STREAK_7_DAYS;
          await this.awardBadge(userId, "7_DAY_STREAK", "🔥 7 Day Streak", "Contributed for 7 consecutive days", session);
        } else if (user.gamification!.currentStreak === 30) {
          xpEarned += XP_REWARDS.STREAK_30_DAYS;
          await this.awardBadge(userId, "30_DAY_STREAK", "🔥 30 Day Streak", "Contributed for 30 consecutive days", session);
        }
      }

      // Create primary activity log
      await ActivityLog.create([{
        user: userId,
        actionType,
        xpEarned: XP_REWARDS[actionType] || 0,
        itemRef,
        itemModel,
        description
      }], { session });

      // Update User XP & Level
      user.gamification!.xp += xpEarned;
      user.gamification!.reputation += xpEarned;
      user.gamification!.level = Math.floor(user.gamification!.xp / 100) + 1;

      await user.save({ session });
      
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error in GamificationService:", error);
    }
  }

  static async awardBadge(
    userId: string | mongoose.Types.ObjectId, 
    badgeId: string, 
    title: string, 
    description: string, 
    session: mongoose.ClientSession
  ) {
    const existing = await UserBadge.findOne({ user: userId, badgeId }).session(session);
    if (!existing) {
      await UserBadge.create([{
        user: userId,
        badgeId,
        title,
        description
      }], { session });
      
      await ActivityLog.create([{
        user: userId,
        actionType: "ACHIEVEMENT_UNLOCKED",
        xpEarned: 0,
        description: `Unlocked Badge: ${title}`
      }], { session });
    }
  }
}
