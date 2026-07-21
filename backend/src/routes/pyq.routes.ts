import { Router, Response } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Pyq } from "../models/Pyq.js";
import { Subject, Department } from "../models/Academic.js";
import type { AuthRequest } from "../types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const pyqRouter = Router();

// 1. Upload PYQ
pyqRouter.post("/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No question paper file was uploaded." });
    }

    const { paperName, subject, semester, syllabus, branch } = req.body;

    if (!paperName || typeof paperName !== "string" || paperName.trim().length === 0) {
      return res.status(400).json({ message: "Paper name is required." });
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

    const newPyq = await Pyq.create({
      user: req.user?.id,
      fileName: req.file.originalname,
      paperName: paperName.trim(),
      subject: subject.trim(),
      semester: semNum,
      syllabus,
      branch: branch.trim().toUpperCase(),
      fileData: base64Data,
      mimeType: req.file.mimetype
    });

    const pyqResult = newPyq.toObject();
    delete (pyqResult as any).fileData;

    res.status(201).json(pyqResult);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch PYQs for a branch and semester
pyqRouter.get("/list/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
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
        { paperName: searchRegex },
        { subject: searchRegex }
      ];
    }

    const papers = await Pyq.find(query)
      .select("-fileData")
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    res.json(papers);
  } catch (error) {
    next(error);
  }
});

// 3. Download/Stream PYQ File
pyqRouter.get("/download/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const pyq = await Pyq.findById(req.params.id);
    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found." });
    }
    if (!pyq.fileData) {
      return res.status(404).json({ message: "File data not found (this might be a Drive Link note)." });
    }

    const fileBuffer = Buffer.from(pyq.fileData, "base64");

    res.setHeader("Content-Type", pyq.mimeType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pyq.fileName || 'pyq.pdf'}"`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});

// 4. Delete PYQ
pyqRouter.delete("/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const pyq = await Pyq.findById(req.params.id);
    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found." });
    }

    if (pyq.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You are not authorized to delete this PYQ." });
    }

    await Pyq.findByIdAndDelete(req.params.id);
    res.json({ message: "PYQ deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// 5. Get Subject options filtered by department/branch
pyqRouter.get("/subjects/:branch/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
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
