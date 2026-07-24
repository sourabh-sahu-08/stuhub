import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";
import { PDFParse } from "pdf-parse";
import { Groq } from "groq-sdk";
import { env } from "../config/env.js";
import { QuestionExtractorService } from "../services/pyq/questionExtractor.service.js";
import { ClusteringService } from "../services/pyq/clustering.service.js";
import { SyllabusParserService } from "../services/pyq/syllabusParser.service.js";
import { RawQuestion, V4DashboardJSON, V4UnitGroup } from "../services/pyq/types.js";
import stringSimilarity from "string-similarity";

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
      // Adaptive per-paper char limit
      const pyqCount = pyqFiles.length;
      const PER_PAPER_LIMIT = Math.max(3000, Math.floor(30000 / pyqCount));
      const SYLLABUS_LIMIT = 5000;

      // 1. Parse Syllabus
      const syllabusParser = new PDFParse({ data: syllabusFiles[0].buffer });
      const syllabusData = await syllabusParser.getText();
      const syllabusText = syllabusData.text.slice(0, SYLLABUS_LIMIT);

      // --- TEMPORARY DEBUG LOGS (DISABLED) ---
      // console.log("=== PYQ ANALYZER DEBUG: SYLLABUS TEXT ===");
      // console.log(syllabusText.substring(0, 500) + "... (truncated)");
      
      const parsedSyllabusUnits = SyllabusParserService.parseUnits(syllabusText);
      const detectedUnitCount = parsedSyllabusUnits.length;
      
      // console.log("=== PYQ ANALYZER DEBUG: PARSED UNITS ===");
      // console.log(`Number of parsed units: ${detectedUnitCount}`);
      // console.log("Unit names:", parsedSyllabusUnits.map(u => u.name));
      // --- END TEMPORARY DEBUG LOGS ---

      // 2. Multi-Stage Pipeline: Extract Questions from each PYQ
      let allRawQuestions: RawQuestion[] = [];
      const allYearsSet = new Set<string>();

      for (const file of pyqFiles) {
        const parser = new PDFParse({ data: file.buffer });
        const data = await parser.getText();
        const textToProcess = data.text.slice(0, PER_PAPER_LIMIT);
        
        const extracted = await QuestionExtractorService.extract(file.originalname, textToProcess);
        allRawQuestions = [...allRawQuestions, ...extracted];
        
        // Collect years
        extracted.forEach(q => {
          if (q.paperYear && q.paperYear !== "Unknown") {
            allYearsSet.add(q.paperYear);
          }
        });
      }

      // If no valid years found, inject some defaults based on count or filenames
      if (allYearsSet.size === 0) {
        allYearsSet.add("Unknown Year");
      }
      const allYears = Array.from(allYearsSet);

      // 3. Multi-Stage Pipeline: V4 Clustering
      const clusters = await ClusteringService.clusterQuestions(syllabusText, allRawQuestions);

      let totalUnique = clusters.length;
      const unitsMap = new Map<string, V4UnitGroup>();
      
      let mostRepeatedQuestion = "";
      let highestFreq = 0;

      const unitCounts = new Map<string, number>();

      for (const cluster of clusters) {
        const clusterRawQuestions = cluster.questionIds
          .map(id => allRawQuestions[id])
          .filter(Boolean); 

        if (clusterRawQuestions.length === 0) continue;

        let confidence = 100;
        if (clusterRawQuestions.length > 1) {
          const rawTexts = clusterRawQuestions.map(q => q.rawQuestion);
          const matches = stringSimilarity.findBestMatch(cluster.representativeQuestion, rawTexts);
          const avgRating = matches.ratings.reduce((acc, curr) => acc + curr.rating, 0) / rawTexts.length;
          confidence = Math.round(avgRating * 100);
          confidence = Math.max(70, Math.min(100, confidence));
        }

        const allTexts = Array.from(new Set(clusterRawQuestions.map(q => q.rawQuestion)));
        const variants = allTexts.filter(t => t !== cluster.representativeQuestion);

        const papersMetadata = clusterRawQuestions.map(q => ({
          year: q.paperYear || "Unknown",
          exam: q.exam || "Unknown"
        }));

        const uniquePapers = Array.from(new Map(
          papersMetadata.map(p => [`${p.year}-${p.exam}`, p])
        ).values());

        const freq = clusterRawQuestions.length;

        if (freq > highestFreq) {
          highestFreq = freq;
          mostRepeatedQuestion = cluster.representativeQuestion;
        }

        const unitName = cluster.unit || "Other";
        if (!unitsMap.has(unitName)) {
          unitsMap.set(unitName, { unit: unitName, questions: [] });
          unitCounts.set(unitName, 0);
        }

        unitsMap.get(unitName)!.questions.push({
          question: cluster.representativeQuestion,
          topic: cluster.topic,
          frequency: freq,
          confidence,
          papers: uniquePapers,
          variants
        });
        
        unitCounts.set(unitName, (unitCounts.get(unitName) || 0) + freq);
      }

      const mostImportantUnit = Array.from(unitCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

      const unitsArray = Array.from(unitsMap.values());
      unitsArray.forEach(u => {
        u.questions.sort((a, b) => b.frequency - a.frequency);
      });

      const dashboardJson: V4DashboardJSON = {
        overview: {
          papersAnalyzed: pyqCount,
          totalQuestions: allRawQuestions.length,
          uniqueQuestions: totalUnique,
          unitsDetected: detectedUnitCount > 0 ? detectedUnitCount : unitsMap.size,
          mostRepeatedQuestion: mostRepeatedQuestion || "N/A",
          mostImportantUnit,
        },
        filters: {},
        units: unitsArray
      };

      // --- TEMPORARY DEBUG LOGS (DISABLED) ---
      // console.log("=== PYQ ANALYZER DEBUG: FINAL DASHBOARD JSON ===");
      // console.log(`Units Detected Value Used: ${dashboardJson.overview.unitsDetected}`);
      // --- END TEMPORARY DEBUG LOGS ---

      return res.status(200).json(dashboardJson);
    } catch (error: any) {
      console.error("AI Analysis Pipeline Error:", error);
      const groqMsg = error?.error?.message || error?.message || "Unknown error";
      const statusCode = error?.status === 413 || groqMsg.includes("too large") ? 413 : 500;
      return res.status(statusCode).json({
        message: statusCode === 413
          ? "Your uploaded files contain too much text. Try using shorter or fewer PDFs."
          : "AI Analysis Pipeline failed: " + groqMsg
      });
    }
  });
});

export default pyqAnalyzerRouter;

