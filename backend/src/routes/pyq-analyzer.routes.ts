import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

// Setup multer to accept files up to 5MB, filtering for PDFs only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
}).fields([
  { name: "syllabus", maxCount: 1 },
  { name: "pyqs", maxCount: 10 }
]);

export const pyqAnalyzerRouter = Router();

// GET /api/pyq-analyzer/health - Dev only connectivity verification
pyqAnalyzerRouter.get("/health", requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ ok: true, message: "AI PYQ Analyzer endpoint is online." });
});

// POST /api/pyq-analyzer/validate-upload - Validate subject, branch, semester, syllabus, and 3-10 PYQs
pyqAnalyzerRouter.post("/validate-upload", requireAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size exceeds 5MB limit." });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ message: "Unexpected file field or exceeded file limits." });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    const { subject, branch, semester } = req.body;

    // Validate inputs
    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return res.status(400).json({ message: "Subject must be at least 3 characters long." });
    }
    if (!branch || typeof branch !== "string" || branch.trim().length < 2) {
      return res.status(400).json({ message: "Branch must be at least 2 characters long." });
    }
    if (!semester) {
      return res.status(400).json({ message: "Semester is required." });
    }
    const parsedSemester = Number(semester);
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return res.status(400).json({ message: "Semester must be a number between 1 and 8." });
    }

    // Validate files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const syllabusFiles = files?.["syllabus"];
    const pyqFiles = files?.["pyqs"];

    if (!syllabusFiles || syllabusFiles.length !== 1) {
      return res.status(400).json({ message: "Exactly one syllabus PDF is required." });
    }

    if (!pyqFiles || pyqFiles.length < 3 || pyqFiles.length > 10) {
      return res.status(400).json({ message: "Between 3 and 10 PYQ PDFs are required." });
    }

    // Enforce PDF MIME types manually
    if (syllabusFiles[0].mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Syllabus must be a PDF file." });
    }
    for (const file of pyqFiles) {
      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "All PYQ files must be PDFs." });
      }
    }

    // Extract metadata
    const syllabusMetadata = {
      fileName: syllabusFiles[0].originalname,
      fileSize: syllabusFiles[0].size
    };

    const pyqsMetadata = pyqFiles.map(file => ({
      fileName: file.originalname,
      fileSize: file.size
    }));

    return res.status(200).json({
      readyForAnalysis: true,
      subject: subject.trim(),
      branch: branch.trim(),
      semester: parsedSemester,
      syllabus: syllabusMetadata,
      pyqs: pyqsMetadata
    });
  });
});
