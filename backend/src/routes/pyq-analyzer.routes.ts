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
      // Adaptive per-paper char limit to keep total prompt within ~80k tokens
      // Groq llama-3.3-70b context = 128k tokens, ~4 chars/token
      // Total char budget for papers ≈ 80k tokens × 4 = 320k chars
      // Subtract syllabus (5k) and prompt schema (~8k) → ~30k chars left for papers
      // Each paper gets: min(8000, 30000 / count) chars
      const pyqCount = pyqFiles.length;
      const PER_PAPER_LIMIT = Math.max(3000, Math.floor(30000 / pyqCount));
      const SYLLABUS_LIMIT = 5000;

      // 1. Parse Syllabus
      const syllabusParser = new PDFParse({ data: syllabusFiles[0].buffer });
      const syllabusData = await syllabusParser.getText();
      const syllabusText = syllabusData.text.slice(0, SYLLABUS_LIMIT);

      // 2. Parse PYQs with adaptive limit per paper
      const pyqTexts = await Promise.all(
        pyqFiles.map(async (file) => {
          const parser = new PDFParse({ data: file.buffer });
          const data = await parser.getText();
          return `--- PYQ: ${file.originalname} ---\n` + data.text.slice(0, PER_PAPER_LIMIT);
        })
      );
      const combinedPyqText = pyqTexts.join("\n\n");

      // 3. Construct V2 mega-prompt
      const prompt = `
You are an AI Exam Intelligence Engine and Chief Examination Strategist with decades of experience analyzing university exam patterns.
You are given ${pyqCount} past year question papers and a syllabus for:
Subject: ${subject}
Branch: ${branch}
Semester: ${semester}

SYLLABUS:
${syllabusText}

PAST YEAR PAPERS (${pyqCount} papers):
${combinedPyqText}

TASK: Perform a deep multi-dimensional analysis of ALL provided exam papers against the syllabus.

CRITICAL RULES — YOU MUST FOLLOW THESE:
1. UNITS: Identify EVERY unit/chapter in the syllabus. For EACH unit, generate a separate entry in "units" array. Do NOT merge units. Do NOT give only one unit. If the syllabus has 5 units, return 5 unit objects. If it has 6, return 6.
2. TOP REPEATED TOPICS: List the top 12-15 most frequently repeated topics across ALL units, sorted by frequency. Provide deep analysis of their trends.
3. PREDICTED QUESTIONS: Generate at least 12 predicted questions spread across different units, sorted by probability descending.
4. PREDICTED PAPER: Generate a realistic full exam paper with 3-4 sections (Short Answer, Long Answer, etc.) with 8-10 questions per section covering multiple units.
5. YEAR-WISE ANALYSIS: Analyze each uploaded paper separately (use filenames if visible, else "Paper 1", "Paper 2", etc.).
6. Be data-driven. Count actual frequencies from the provided papers. Do not guess.

Output STRICTLY as a single JSON object (no markdown, no extra text). Replace ALL placeholder values with real data from the analysis:
{
  "meta": {
    "totalPapers": ${pyqCount},
    "subject": "${subject}",
    "branch": "${branch}",
    "semester": ${semester},
    "overallDifficulty": "FILL: Easy/Medium/Hard/Medium-Hard based on actual paper analysis",
    "confidenceScore": 0,
    "estimatedStudyHours": 0,
    "theoryVsNumerical": { "theory": 0, "numerical": 0 }
  },
  "aiSummary": "FILL: 2-3 sentence summary mentioning which units dominate, the question pattern, and the best preparation strategy.",
  "quickStats": {
    "totalQuestions": 0,
    "uniqueQuestions": 0,
    "repeatedQuestions": 0,
    "totalUnits": 0,
    "totalTopics": 0,
    "expectedMarksCoverage": 0,
    "questionPatterns": ["FILL pattern 1", "FILL pattern 2", "FILL pattern 3"]
  },
  "units": [
    {
      "name": "FILL: Exact unit name from syllabus (e.g. Unit 1: Introduction to OS)",
      "weightage": 0,
      "importanceScore": 0,
      "difficulty": "FILL: Easy/Medium/Hard",
      "preparationHours": 0,
      "riskLevel": "FILL: High/Medium/Low",
      "priority": "FILL: Must Study/High Priority/Medium Priority/Low Priority/Can Skip",
      "description": "FILL: What this unit covers",
      "importantConcepts": ["FILL concept 1", "FILL concept 2", "FILL concept 3"],
      "trend": "FILL: Increasing/Stable/Declining",
      "expectedMarks": 0,
      "repeatedTopics": ["FILL topic 1", "FILL topic 2"],
      "mostAskedQuestions": [
        {
          "question": "FILL: Actual question text that appeared in the papers",
          "timesAsked": 0,
          "marks": 0,
          "difficulty": "FILL: Easy/Medium/Hard",
          "lastAskedYear": "FILL: Year"
        }
      ],
      "canSkip": false,
      "skipReason": ""
    }
  ],
  "topRepeatedTopics": [
    {
      "rank": 1,
      "topic": "Topic Name",
      "unit": "Unit Name",
      "timesAsked": 5,
      "yearsAppeared": ["2020", "2021", "2022", "2023", "2024"],
      "expectedMarks": 10,
      "probability": 92,
      "difficulty": "Medium",
      "trend": "Stable"
    }
  ],
  "predictedQuestions": [
    {
      "question": "Full predicted question text",
      "unit": "Unit Name",
      "marks": 10,
      "probability": 88,
      "confidence": "Very High",
      "reason": "Asked in 4 out of ${pyqCount} papers with slight variation each time",
      "relatedPastQuestions": ["Similar past question 1", "Similar past question 2"]
    }
  ],
  "predictedPaper": [
    {
      "sectionName": "Section A: Short Answer",
      "instructions": "Attempt all. Each carries 2 marks.",
      "totalMarks": 20,
      "questions": [
        {
          "qNo": "Q1",
          "question": "Full question text",
          "unit": "Unit Name",
          "marks": 2,
          "probability": 85,
          "difficulty": "Easy"
        }
      ]
    }
  ],
  "marksDistribution": [
    { "unit": "Unit Name", "marks": 20, "percentage": 30 }
  ],
  "yearwiseAnalysis": [
    {
      "year": "2024",
      "dominantUnit": "Unit Name",
      "totalQuestions": 15,
      "difficulty": "Medium",
      "highlights": ["Key observation about this year's paper"]
    }
  ],
  "trendAnalysis": {
    "increasing": ["Topic gaining importance"],
    "stable": ["Consistently asked topic"],
    "declining": ["Topic appearing less"],
    "neverAsked": ["Topic in syllabus but never appeared"],
    "recentlyIntroduced": ["New topic in last 1-2 years"]
  },
  "smartInsights": [
    {
      "badge": "High ROI",
      "title": "Insight title",
      "description": "Actionable insight for the student",
      "unit": "Unit Name",
      "icon": "trending-up"
    }
  ],
  "studyPlan": {
    "totalDays": 7,
    "dailySchedule": [
      {
        "day": 1,
        "focus": "Unit 1",
        "hours": 4,
        "tasks": ["Task 1", "Task 2"],
        "priority": "High"
      }
    ],
    "oneNightStrategy": {
      "fourHours": "Focus on Units with highest weightage: prioritize repeated questions and key definitions",
      "twoHours": "Solve the top 5 most repeated questions from each unit",
      "oneHour": "Revise formula sheet and definition bank",
      "thirtyMinutes": "Read AI summary and smart insights one final time"
    }
  },
  "studyStrategy": [
    {
      "step": 1,
      "title": "Strategy Step Title",
      "description": "Actionable description of this step"
    }
  ],
  "importantTopics": ["Topic 1", "Topic 2", "Topic 3"]
}
`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI Exam Intelligence Engine. You always return COMPLETE, VALID JSON. You MUST include ALL units from the syllabus — never truncate or combine them into one. Every array must contain multiple real entries based on the data provided. Never return placeholder text like "FILL" in the final output — replace all placeholders with real analyzed values.`
          },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.15,
        max_tokens: 8000,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response from Groq");
      }

      const parsedJSON = JSON.parse(responseContent);

      return res.status(200).json(parsedJSON);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      // Surface Groq API errors properly
      const groqMsg = error?.error?.message || error?.message || "Unknown error";
      const statusCode = error?.status === 413 || groqMsg.includes("too large") ? 413 : 500;
      return res.status(statusCode).json({
        message: statusCode === 413
          ? "Your uploaded files contain too much text. Try using shorter or fewer PDFs."
          : "AI Analysis failed: " + groqMsg
      });
    }
  });
});

