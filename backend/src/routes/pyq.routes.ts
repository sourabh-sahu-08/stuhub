import { Router, Response } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Pyq } from "../models/Pyq.js";
import { Subject } from "../models/Academic.js";
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

    const { paperName, subject, semester } = req.body;

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

    const base64Data = req.file.buffer.toString("base64");

    const newPyq = await Pyq.create({
      user: req.user?.id,
      fileName: req.file.originalname,
      paperName: paperName.trim(),
      subject: subject.trim(),
      semester: semNum,
      fileData: base64Data,
      mimeType: req.file.mimetype
    });

    // Return the PYQ without fileData for size performance
    const pyqResult = newPyq.toObject();
    delete (pyqResult as any).fileData;

    res.status(201).json(pyqResult);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch PYQs for a semester
pyqRouter.get("/semester/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const { q } = req.query;
    let query: any = { semester: semNum };

    if (q && typeof q === "string" && q.trim().length > 0) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { paperName: searchRegex },
        { subject: searchRegex }
      ];
    }

    // Exclude fileData to optimize payload size
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

    const fileBuffer = Buffer.from(pyq.fileData, "base64");

    res.setHeader("Content-Type", pyq.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${pyq.fileName}"`);
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

    // Restrict deletion to uploader
    if (pyq.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You are not authorized to delete this PYQ." });
    }

    await Pyq.findByIdAndDelete(req.params.id);
    res.json({ message: "PYQ deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// 5. Get Subject options for autocomplete
pyqRouter.get("/subjects/:semester", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const semNum = parseInt(req.params.semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    const subjects = await Subject.find({ semester: semNum }).select("name code");
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});
