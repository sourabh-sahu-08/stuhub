import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Pyq } from "../models/Pyq.js";
import { Assignment } from "../models/Assignment.js";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;

    // We can run these counts in parallel
    const [notesCount, pyqsCount, assignments] = await Promise.all([
      Note.countDocuments({ user: userId }),
      Pyq.countDocuments({ user: userId }),
      Assignment.find({ userId }).select("status dueDate")
    ]);

    const pendingAssignments = assignments.filter(a => a.status !== "Submitted").length;

    res.json({
      metrics: {
        notesUploaded: notesCount,
        pyqsUploaded: pyqsCount,
        pendingAssignments
      }
    });
  } catch (error) {
    next(error);
  }
});
