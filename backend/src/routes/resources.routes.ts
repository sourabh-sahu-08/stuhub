import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Resource } from "../models/Resource.js";
import { Subject } from "../models/Academic.js";
import type { AuthRequest } from "../types.js";

export const resourcesRouter = Router();

// 1. Fetch recent resources across all branches (for dashboard, if needed)
resourcesRouter.get("/recent", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const recentResources = await Resource.find({}, "title url type subject semester syllabus branch createdAt")
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(recentResources);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch Resources for a branch and semester
resourcesRouter.get("/list/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const branchCode = req.params.branch.toUpperCase();
    
    // Auto-include subjects for this branch and semester
    const validSubjects = await Subject.find({
      branches: branchCode,
      semesters: semNum
    });
    const validSubjectNames = validSubjects.map(s => s.name);

    const { q, syllabus } = req.query;
    let query: any = {
      $and: [
        { $or: [{ branch: branchCode }, { branch: { $exists: false } }, { branch: null }, { branch: "" }, { branch: "ALL" }] },
        { $or: [{ semester: semNum }, { semester: { $exists: false } }, { semester: null }] },
        { $or: [{ subject: { $in: validSubjectNames } }, { subject: { $exists: false } }, { subject: null }, { subject: "" }] }
      ]
    };

    if (syllabus === "new" || syllabus === "old") {
      query.syllabus = syllabus;
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      const searchRegex = new RegExp(q.trim(), "i");
      query = {
        $and: [
          query,
          { $or: [{ title: searchRegex }, { subject: searchRegex }] }
        ]
      };
    }

    const resources = await Resource.find(query)
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    next(error);
  }
});
