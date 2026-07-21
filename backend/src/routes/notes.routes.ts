import { Router, Response } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Subject, Department } from "../models/Academic.js";
import type { AuthRequest } from "../types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const notesRouter = Router();

// 0. Fetch recent notes across all branches (for dashboard)
notesRouter.get("/recent", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const recentNotes = await Note.find({}, "title fileName subject semester syllabus branch createdAt")
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(recentNotes);
  } catch (error) {
    next(error);
  }
});

// 1. Upload Note
notesRouter.post("/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No notes file was uploaded." });
    }

    const { title, subject, semester, syllabus, branch } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Notes title is required." });
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

    const base64Data = req.file.buffer.toString("base64");

    const newNote = await Note.create({
      user: req.user?.id,
      fileName: req.file.originalname,
      title: title.trim(),
      subject: subject.trim(),
      semester: semNum,
      syllabus,
      branch: branch.trim().toUpperCase(),
      fileData: base64Data,
      mimeType: req.file.mimetype
    });

    const noteResult = newNote.toObject();
    delete (noteResult as any).fileData;

    res.status(201).json(noteResult);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch Notes for a branch and semester
notesRouter.get("/list/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
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

    const notes = await Note.find(query)
      .select("-fileData")
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// 3. Download/Stream Note File
notesRouter.get("/download/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    if (!note.fileData) {
      return res.status(404).json({ message: "File data not found (this might be a Drive Link note)." });
    }

    const fileBuffer = Buffer.from(note.fileData, "base64");

    res.setHeader("Content-Type", note.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${note.fileName || 'note.pdf'}"`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});

// 4. Delete Note
notesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You are not authorized to delete this note." });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// 5. Get Subject options filtered by department/branch
notesRouter.get("/subjects/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const dept = await Department.findOne({ code: req.params.branch.toUpperCase() });
    if (!dept) {
      return res.json([]);
    }

    const subjects = await Subject.find({ semester: semNum, department: dept._id }).select("name code");
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});
