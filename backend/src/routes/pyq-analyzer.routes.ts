import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";
import { PDFParse } from "pdf-parse";
import { env } from "../config/env.js";
import { QuestionExtractorService, PaperInput } from "../services/pyq/questionExtractor.service.js";
import { ClusteringService } from "../services/pyq/clustering.service.js";
import { SyllabusParserService } from "../services/pyq/syllabusParser.service.js";
import { RawQuestion, V4DashboardJSON, V4UnitGroup } from "../services/pyq/types.js";
import stringSimilarity from "string-similarity";

// Safe startup validation
console.log(`[PYQ ANALYZER] Booting up AI Engine...`);
if (!env.GROQ_API_KEY) {
  console.warn(`[PYQ ANALYZER ERROR] GROQ_API_KEY is missing!`);
} else {
  console.log(`✓ AI_PROVIDER loaded: ${env.AI_PROVIDER}`);
  console.log(`✓ GROQ_API_KEY present`);
  console.log(`✓ GROQ_MODEL loaded: ${env.GROQ_MODEL}`);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
}).fields([
  { name: "syllabus", maxCount: 1 },
  { name: "pyqs", maxCount: 10 },
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
      return res.status(400).json({ success: false, error: { code: "UPLOAD_ERROR", message: "File upload error: " + err.message } });
    }

    if (!env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, error: { code: "AI_CONFIGURATION_ERROR", message: "AI provider is not configured correctly." } });
    }

    console.log(`[PYQ ANALYZER] Analysis request received`);

    const { subject, branch, semester } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const syllabusFiles = files?.["syllabus"];
    const pyqFiles = files?.["pyqs"];

    if (!syllabusFiles || syllabusFiles.length !== 1) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Exactly one syllabus PDF is required." } });
    }
    if (!pyqFiles || pyqFiles.length < 3 || pyqFiles.length > 10) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Between 3 and 10 PYQ PDFs are required." } });
    }

    console.log(`[PYQ ANALYZER] Files received: ${pyqFiles.length} PYQs, 1 Syllabus`);

    try {
      // Adaptive per-paper char limit
      const pyqCount = pyqFiles.length;
      const PER_PAPER_LIMIT = Math.max(800, Math.floor(4000 / pyqCount));
      const SYLLABUS_LIMIT = 2000;

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

      const paperInputs = [];
      for (const file of pyqFiles) {
        const parser = new PDFParse({ data: file.buffer });
        const data = await parser.getText();
        const textToProcess = data.text.slice(0, PER_PAPER_LIMIT);
        paperInputs.push({ paperName: file.originalname, text: textToProcess });
      }

      allRawQuestions = await QuestionExtractorService.extractMultiple(paperInputs);

      // Collect years
      allRawQuestions.forEach(q => {
        if (q.paperYear && q.paperYear !== "Unknown") {
          allYearsSet.add(q.paperYear);
        }
      });

      // If no valid years found, inject some defaults based on count or filenames
      if (allYearsSet.size === 0) {
        allYearsSet.add("Unknown Year");
      }
      const allYears = Array.from(allYearsSet);

      // 3. Multi-Stage Pipeline: V4 Clustering
      let validUnitNames = parsedSyllabusUnits.map(u => u.name);
      if (validUnitNames.length === 0) {
        validUnitNames = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];
      }
      const clusters = await ClusteringService.clusterQuestions(syllabusText, validUnitNames, allRawQuestions);

      let totalUnique = clusters.length;
      const unitsMap = new Map<string, V4UnitGroup>();
      
      let mostRepeatedQuestion = "";
      let highestFreq = 0;

      const unitCounts = new Map<string, number>();
      const topicCounts = new Map<string, { unit: string; frequency: number }>();

      for (const cluster of clusters) {
        if (!cluster) continue;
        const qIds = Array.isArray(cluster.questionIds) ? cluster.questionIds : [];
        const clusterRawQuestions = qIds
          .map(id => allRawQuestions[id])
          .filter(Boolean); 

        if (clusterRawQuestions.length === 0) continue;

        const repQuestion = cluster.representativeQuestion || clusterRawQuestions[0]?.rawQuestion || "Unknown Question";

        let confidence = 100;
        if (clusterRawQuestions.length > 1) {
          const rawTexts = clusterRawQuestions.map(q => q.rawQuestion);
          try {
            const matches = stringSimilarity.findBestMatch(repQuestion, rawTexts);
            const avgRating = matches.ratings.reduce((acc, curr) => acc + curr.rating, 0) / rawTexts.length;
            confidence = Math.round(avgRating * 100);
            confidence = Math.max(70, Math.min(100, confidence));
          } catch(e) {
            confidence = 85; // Fallback if string similarity crashes
          }
        }

        const allTextsMap = new Map<string, string>(); // maps exact question text to its year
        clusterRawQuestions.forEach(q => {
          if (!allTextsMap.has(q.rawQuestion)) {
            allTextsMap.set(q.rawQuestion, q.paperYear || "Unknown");
          }
        });

        const variants = Array.from(allTextsMap.entries())
          .filter(([t]) => t !== repQuestion)
          .map(([text, year]) => ({ text, year }));

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
          mostRepeatedQuestion = repQuestion;
        }

        const unitName = cluster.unit || "Other";
        const topicName = cluster.topic || "General";

        if (!unitsMap.has(unitName)) {
          unitsMap.set(unitName, { unit: unitName, topics: [] });
          unitCounts.set(unitName, 0);
        }

        const unitGroup = unitsMap.get(unitName)!;
        let topicGroup = unitGroup.topics.find(t => t.topic === topicName);
        if (!topicGroup) {
          topicGroup = { topic: topicName, questions: [] };
          unitGroup.topics.push(topicGroup);
        }

        topicGroup.questions.push({
          question: repQuestion,
          topic: topicName,
          frequency: freq,
          confidence,
          papers: uniquePapers,
          variants
        });
        
        unitCounts.set(unitName, (unitCounts.get(unitName) || 0) + freq);
        
        const currentTopic = topicCounts.get(topicName) || { unit: unitName, frequency: 0 };
        currentTopic.frequency += freq;
        topicCounts.set(topicName, currentTopic);
      }

      const mostImportantUnit = Array.from(unitCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

      const unitsArray = Array.from(unitsMap.values());
      unitsArray.forEach(u => {
        // Sort topics by total frequency of questions inside them
        u.topics.sort((a, b) => {
          const freqA = a.questions.reduce((sum, q) => sum + q.frequency, 0);
          const freqB = b.questions.reduce((sum, q) => sum + q.frequency, 0);
          return freqB - freqA;
        });

        // Sort questions within each topic by frequency
        u.topics.forEach(t => {
          t.questions.sort((a, b) => b.frequency - a.frequency);
        });
      });

      const hotTopics = Array.from(topicCounts.entries())
        .map(([topic, data]) => ({ topic, unit: data.unit, frequency: data.frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

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
        hotTopics,
        units: unitsArray
      };

      // --- TEMPORARY DEBUG LOGS (DISABLED) ---
      // console.log("=== PYQ ANALYZER DEBUG: FINAL DASHBOARD JSON ===");
      // console.log(`Units Detected Value Used: ${dashboardJson.overview.unitsDetected}`);
      // --- END TEMPORARY DEBUG LOGS ---

      return res.status(200).json(dashboardJson);
    } catch (error: any) {
      console.error("[PYQ ANALYZER ERROR]", error);
      const errMsg = error?.error?.message || error?.message || "Unknown error";
      
      let statusCode = 500;
      let errorCode = "AI_ANALYSIS_FAILED";
      let displayMessage = "Unable to complete PYQ analysis.";

      if (error?.status === 413 || errMsg.includes("too large") || errMsg.includes("context_length_exceeded")) {
        statusCode = 413;
        errorCode = "PDF_EXTRACTION_FAILED";
        displayMessage = "Your uploaded files contain too much text. Try using shorter or fewer PDFs.";
      } else if (errMsg.includes("Rate limit") || errMsg.includes("429") || errMsg.includes("quota")) {
        statusCode = 429;
        errorCode = "AI_RATE_LIMITED";
        displayMessage = "AI service rate limit reached. Please try again shortly.";
      } else if (errMsg.includes("Authentication") || errMsg.includes("401") || errMsg.includes("API key")) {
        statusCode = 401;
        errorCode = "AI_AUTHENTICATION_ERROR";
        displayMessage = "AI provider authentication failed.";
      } else if (errMsg.includes("model") || errMsg.includes("404")) {
        statusCode = 503;
        errorCode = "AI_MODEL_UNAVAILABLE";
        displayMessage = "The configured AI model is unavailable.";
      }

      return res.status(statusCode).json({
        success: false,
        message: displayMessage,
        error: {
          code: errorCode,
          message: displayMessage
        }
      });
    }
  });
});

export default pyqAnalyzerRouter;

