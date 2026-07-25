import { Router, Response } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Assignment } from "../models/Assignment.js";
import { Subject, Department } from "../models/Academic.js";
import type { AuthRequest } from "../types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const assignmentsRouter = Router();

// 0. Fetch recent assignments across all branches (for dashboard)
assignmentsRouter.get("/recent", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const recentAssignments = await Assignment.find({}, "title fileName subject semester syllabus branch createdAt")
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(recentAssignments);
  } catch (error) {
    next(error);
  }
});

// 1. Upload Assignment
assignmentsRouter.post("/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, subject, semester, syllabus, branch, driveUrl } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Assignment title is required." });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    const semNum = parseInt(semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    if (syllabus !== "new" && syllabus !== "old") {
      return res.status(400).json({ message: "Syllabus type must be either 'new' or 'old'." });
    }

    if (!branch || typeof branch !== "string" || branch.trim().length === 0) {
      return res.status(400).json({ message: "Branch code is required." });
    }

    if (!req.file && !driveUrl) {
      return res.status(400).json({ message: "Either a file or a Google Drive link must be provided." });
    }

    let base64Data;
    if (req.file) {
      base64Data = req.file.buffer.toString("base64");
    }

    const newAssignment = await Assignment.create({
      user: req.user?.id,
      fileName: req.file?.originalname,
      title: title.trim(),
      subject: subject.trim(),
      semester: semNum,
      syllabus,
      branch: branch.trim().toUpperCase(),
      fileData: base64Data,
      mimeType: req.file?.mimetype,
      driveUrl: driveUrl?.trim()
    });

    const assignmentResult = newAssignment.toObject();
    delete (assignmentResult as any).fileData;

    res.status(201).json(assignmentResult);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch Assignments for a branch and semester
assignmentsRouter.get("/list/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const { q, syllabus } = req.query;
    let query: any = {
      semester: semNum,
      branch: req.params.branch.toUpperCase()
    };

    if (syllabus === "new" || syllabus === "old") {
      query.syllabus = syllabus;
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex }
      ];
    }

    const assignments = await Assignment.find(query)
      .select("-fileData")
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

// 3. Download/Stream Assignment File
assignmentsRouter.get("/download/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    if (!assignment.fileData) {
      return res.status(404).json({ message: "File data not found (this might be a Drive Link assignment)." });
    }

    const fileBuffer = Buffer.from(assignment.fileData, "base64");

    res.setHeader("Content-Type", assignment.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${assignment.fileName || 'assignment.pdf'}"`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});

// 4. Delete Assignment
assignmentsRouter.delete("/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (assignment.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You are not authorized to delete this assignment." });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// 5. Get Subject options filtered by department/branch
assignmentsRouter.get("/subjects/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const dept = await Department.findOne({ code: req.params.branch.toUpperCase() });
    if (!dept) {
      return res.json([]);
    }

    const { syllabus } = req.query;
    let query: any = { semester: semNum, department: dept._id };
    if (syllabus === "new" || syllabus === "old") {
      query.syllabus = syllabus;
    }

    const subjects = await Subject.find(query).select("name code");
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});
