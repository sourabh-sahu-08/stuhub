import { Router } from "express";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { UserBadge } from "../models/UserBadge.js";
import { Note } from "../models/Note.js";
import { Pyq } from "../models/Pyq.js";
import { CtPyq } from "../models/CtPyq.js";
import { Assignment } from "../models/Assignment.js";

export const gamificationRouter = Router();

// Get global platform stats
gamificationRouter.get("/leaderboard/stats", async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalHeroes,
      notesCount, pyqsCount, ctpyqsCount, assignmentsCount,
      notesMonthly, pyqsMonthly, ctpyqsMonthly, assignmentsMonthly,
      notesDownloads, pyqsDownloads, ctpyqsDownloads, assignmentsDownloads
    ] = await Promise.all([
      User.countDocuments({ "gamification.xp": { $gt: 0 } }),
      Note.countDocuments(), Pyq.countDocuments(), CtPyq.countDocuments(), Assignment.countDocuments(),
      Note.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Pyq.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      CtPyq.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Assignment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
      Pyq.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
      CtPyq.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
      Assignment.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }])
    ]);

    const totalUploads = notesCount + pyqsCount + ctpyqsCount + assignmentsCount;
    const monthlyContributions = notesMonthly + pyqsMonthly + ctpyqsMonthly + assignmentsMonthly;
    
    const extractTotal = (agg: any[]) => agg[0]?.total || 0;
    const totalDownloads = extractTotal(notesDownloads) + extractTotal(pyqsDownloads) + extractTotal(ctpyqsDownloads) + extractTotal(assignmentsDownloads);

    res.json({
      totalHeroes,
      totalUploads,
      totalDownloads,
      monthlyContributions
    });
  } catch (error) {
    next(error);
  }
});

// Get recent global activity
gamificationRouter.get("/leaderboard/activity", async (req, res, next) => {
  try {
    const [notesList, pyqsList, ctpyqsList, assignmentsList] = await Promise.all([
      Note.find().sort({ createdAt: -1 }).limit(10).populate("user", "name avatar").lean(),
      Pyq.find().sort({ createdAt: -1 }).limit(10).populate("user", "name avatar").lean(),
      CtPyq.find().sort({ createdAt: -1 }).limit(10).populate("user", "name avatar").lean(),
      Assignment.find().sort({ createdAt: -1 }).limit(10).populate("user", "name avatar").lean()
    ]);

    const recentActivity = [
      ...notesList.map(n => ({ id: n._id, title: n.title, type: "Note", user: n.user, createdAt: n.createdAt })),
      ...pyqsList.map(p => ({ id: p._id, title: `${p.subject || 'PYQ'} - ${(p as any).year}`, type: "PYQ", user: p.user, createdAt: p.createdAt })),
      ...ctpyqsList.map(c => ({ id: c._id, title: `${c.subject || 'CT-PYQ'} - ${(c as any).year}`, type: "CT-PYQ", user: c.user, createdAt: c.createdAt })),
      ...assignmentsList.map(a => ({ id: a._id, title: a.title, type: "Assignment", user: a.user, createdAt: a.createdAt }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    res.json(recentActivity);
  } catch (error) {
    next(error);
  }
});

// Get the main leaderboard
gamificationRouter.get("/leaderboard", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Sort by XP (reputation) and only show users with XP > 0
    const topUsers = await User.find({ "gamification.xp": { $gt: 0 } })
      .sort({ "gamification.xp": -1 })
      .limit(limit)
      .select("name avatar department branch gamification")
      .lean();

    // Fetch total contributions for each top user
    const usersWithContributions = await Promise.all(
      topUsers.map(async (user) => {
        const [notes, pyqs, ctpyqs, assignments] = await Promise.all([
          Note.countDocuments({ user: user._id }),
          Pyq.countDocuments({ user: user._id }),
          CtPyq.countDocuments({ user: user._id }),
          Assignment.countDocuments({ user: user._id })
        ]);
        return {
          ...user,
          totalContributions: notes + pyqs + ctpyqs + assignments
        };
      })
    );

    res.json(usersWithContributions);
  } catch (error) {
    next(error);
  }
});

// Get a user's gamified profile
gamificationRouter.get("/profile/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get Badges
    const badges = await UserBadge.find({ user: userId }).sort({ earnedAt: -1 });

    // Get Recent Activity
    const activityTimeline = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get Total Uploads across collections
    const [notesList, pyqsList, ctpyqsList, assignmentsList] = await Promise.all([
      Note.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Pyq.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      CtPyq.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Assignment.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean()
    ]);
    
    // Also get counts
    const totalUploads = await Note.countDocuments({ user: userId }) +
                         await Pyq.countDocuments({ user: userId }) +
                         await CtPyq.countDocuments({ user: userId }) +
                         await Assignment.countDocuments({ user: userId });

    // Combine into recentUploads
    const recentUploads = [
      ...notesList.map(n => ({ id: n._id, title: n.title, type: "Note", createdAt: n.createdAt, views: (n as any).views || 0, likes: (n as any).likes || 0 })),
      ...pyqsList.map(p => ({ id: p._id, title: `${p.subject || 'PYQ'} - ${(p as any).year}`, type: "PYQ", createdAt: p.createdAt, views: (p as any).views || 0, likes: (p as any).likes || 0 })),
      ...ctpyqsList.map(c => ({ id: c._id, title: `${c.subject || 'CT-PYQ'} - ${(c as any).year}`, type: "CT-PYQ", createdAt: c.createdAt, views: (c as any).views || 0, likes: (c as any).likes || 0 })),
      ...assignmentsList.map(a => ({ id: a._id, title: a.title, type: "Assignment", createdAt: a.createdAt, views: (a as any).views || 0, likes: (a as any).likes || 0 }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    // Generate Heatmap Data (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const heatmapLogs = await ActivityLog.aggregate([
      { 
        $match: { 
          user: user._id,
          createdAt: { $gte: oneYearAgo },
          actionType: { $in: ["UPLOAD_NOTE", "UPLOAD_PYQ", "UPLOAD_CTPYQ", "UPLOAD_ASSIGNMENT"] }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const heatmapData = heatmapLogs.map(log => ({
      date: log._id,
      count: log.count
    }));

    res.json({
      user,
      badges,
      totalUploads,
      recentUploads,
      activityTimeline,
      heatmapData
    });
  } catch (error) {
    next(error);
  }
});
