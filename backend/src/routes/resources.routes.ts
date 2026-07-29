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
      $or: [
        // Case 1: Match by subject (enables cross-branch and cross-semester for Sem 1/2)
        {
          subject: { $in: validSubjectNames },
          $or: [
            { semester: semNum },
            { semester: null }, { semester: { $exists: false } },
            ...(semNum === 1 || semNum === 2 ? [{ semester: semNum === 1 ? 2 : 1 }] : [])
          ]
        },
        // Case 2: Match by exact branch (fallback if subject is invalid/unmapped)
        {
          branch: branchCode,
          $or: [
            { semester: semNum },
            { semester: null }, { semester: { $exists: false } },
            ...(semNum === 1 || semNum === 2 ? [{ semester: semNum === 1 ? 2 : 1 }] : [])
          ]
        },
        // Case 3: Global resources (no subject, branch is ALL/null)
        {
          $and: [
            { $or: [{ branch: null }, { branch: "" }, { branch: "ALL" }, { branch: { $exists: false } }] },
            { $or: [{ semester: semNum }, { semester: null }, { semester: { $exists: false } }] },
            { $or: [{ subject: null }, { subject: "" }, { subject: { $exists: false } }] }
          ]
        }
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
