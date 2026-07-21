import fs from "fs";
import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";
import { PDFParse } from "pdf-parse";
import { Groq } from "groq-sdk";
import { env } from "../config/env.js";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY || "dummy",
});

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
    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      return res.status(400).json({ message: "Subject must be at least 2 characters long." });
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

// POST /api/pyq-analyzer/analyze - Perform the actual AI analysis
pyqAnalyzerRouter.post("/analyze", requireAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    }

    if (!env.GROQ_API_KEY) {
      return res.status(503).json({ message: "AI capabilities are currently unavailable. Missing GROQ API Key." });
    }

    const { subject, branch, semester } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const syllabusFiles = files?.["syllabus"];
    const pyqFiles = files?.["pyqs"];

    if (!syllabusFiles || syllabusFiles.length !== 1) {
      return res.status(400).json({ message: "Exactly one syllabus PDF is required." });
    }
    if (!pyqFiles || pyqFiles.length < 3 || pyqFiles.length > 10) {
      return res.status(400).json({ message: "Between 3 and 10 PYQ PDFs are required." });
    }

    try {
      // 1. Parse Syllabus (first 5000 characters to save tokens)
      const syllabusParser = new PDFParse({ data: syllabusFiles[0].buffer });
      const syllabusData = await syllabusParser.getText();
      const syllabusText = syllabusData.text.slice(0, 5000);

      // 2. Parse PYQs (truncate to first 3000 chars per PDF to keep it under token limits)
      const pyqTexts = await Promise.all(
        pyqFiles.map(async (file) => {
          const parser = new PDFParse({ data: file.buffer });
          const data = await parser.getText();
          return `--- PYQ: ${file.originalname} ---\n` + data.text.slice(0, 3000);
        })
      );
      const combinedPyqText = pyqTexts.join("\n\n");

      // 3. Construct prompt
      const prompt = `
You are an expert academic AI.
I am providing you with a course syllabus and a set of past year exam questions (PYQs).
Subject: ${subject}
Branch: ${branch}
Semester: ${semester}

SYLLABUS EXTRACT:
${syllabusText}

PAST EXAM PAPERS EXTRACT:
${combinedPyqText}

Task:
1. Identify the main chapters/topics from the syllabus.
2. Analyze the PYQs to see which chapters are asked the most.
3. Calculate an estimated percentage "weightage" for each chapter based on frequency.
4. Also list 3-5 "importantTopics" that repeat often.

Output STRICTLY in the following JSON format without any markdown or extra text:
{
  "chapters": [
    {
      "name": "Chapter Name",
      "weightage": 25,
      "description": "Brief description of topics covered"
    }
  ],
  "importantTopics": ["Topic 1", "Topic 2"]
}
`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant", // Use a smaller, faster model with 8k context
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response from Groq");
      }

      const parsedJSON = JSON.parse(responseContent);

      return res.status(200).json(parsedJSON);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      try {
        fs.writeFileSync("analyze-error.txt", error.stack || error.message);
      } catch (e) {}
      return res.status(500).json({ message: "Failed to analyze documents. " + (error.message || "") });
    }
  });
});

