import { Router, Response } from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { requireAuth } from "../middleware/auth.js";
import { PyqAnalysis } from "../models/PyqAnalysis.js";
import { env } from "../config/env.js";
import type { AuthRequest } from "../types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const pyqRouter = Router();

// Helper to interact with Groq API
async function callGroq(messages: any[]) {
  const apiKey = env.GROQ_API_KEY || env.GORQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key is not configured in environment variables (please set GROQ_API_KEY).");
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.2-90b-vision-preview",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API returned error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Invalid or empty response from Groq API");
  }

  return JSON.parse(text);
}

// Prompt template for analysis
const promptText = `You are an expert AI academic analyzer.
Your task is to analyze the question paper content and generate a comprehensive JSON analysis matching this schema exactly.
If analyzing an image, transcribe all text word-for-word and include it in the "extractedText" field. If analyzing text extracted from a PDF, populate the "extractedText" field with that text.

JSON Schema:
{
  "paperName": "Name of the paper (e.g., Database Management Systems Mid Semester 2025)",
  "subject": "The subject name (e.g., Database Management Systems)",
  "semester": 5, // Estimate semester as a number if possible, or omit/leave null
  "difficulty": "Easy" | "Medium" | "Hard",
  "difficultyScore": 75, // Scale 1 to 100
  "estimatedTime": "e.g., 3 hours",
  "totalMarks": 100, // Extract the maximum marks or estimate
  "summary": "AI summary of the paper emphasis, general structure, and overall coverage",
  "importantTopics": [
    { "name": "Topic name", "importance": "High" | "Medium" | "Low" }
  ],
  "marksDistribution": [
    { "name": "Section or category name", "marks": 25 }
  ],
  "frequentlyAskedTopics": [
    { "topic": "Topic name", "frequencyCount": 3 }
  ],
  "chapterWeightage": [
    { "chapter": "Chapter/Module name", "weightage": 30 }
  ],
  "questionTypeDistribution": [
    { "typeName": "Theory" | "Numerical" | "Programming" | "MCQ" | "Design", "percentage": 40 }
  ],
  "mostRepeatedQuestions": [
    { "question": "Question text...", "frequency": 2, "marks": 5 }
  ],
  "predictedQuestions": [
    { "question": "Predicted question text...", "topic": "Topic name", "probability": 85 }
  ],
  "studyPlan": [
    { "phase": "e.g., Phase 1: Core Concepts", "duration": "e.g., 3 days", "tasks": ["Task 1", "Task 2"] }
  ],
  "revisionTips": [
    "Tip 1", "Tip 2"
  ],
  "preparationSuggestions": [
    "Suggestion 1", "Suggestion 2"
  ],
  "extractedText": "Raw transcription text here."
}

Ensure the output is ONLY a valid JSON object matching the schema. Do not output any markdown code blocks, backticks, or trailing commas.`;

// 1. Analyze Paper endpoint
pyqRouter.post("/analyze", requireAuth, upload.single("file"), async (req: AuthRequest, res: Response, next) => {
  try {
    const apiKey = env.GROQ_API_KEY || env.GORQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Groq API key is not configured. Please set GROQ_API_KEY in the environment." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No question paper file was uploaded." });
    }

    const mimeType = req.file.mimetype;
    let extractedText = "";
    let messages: any[] = [];

    if (mimeType === "application/pdf") {
      // 1. PDF Flow - Extract text locally and pass to Groq
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text || "";
      } catch (err) {
        console.error("PDF local text extraction failed:", err);
      }

      if (!extractedText.trim()) {
        extractedText = "Could not parse selected PDF text programmatically (might be scanned). Please re-upload as images if analysis is incomplete.";
      }

      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${promptText}\n\nHere is the question paper text to analyze:\n\n${extractedText}`
            }
          ]
        }
      ];
    } else if (mimeType.startsWith("image/")) {
      // 2. Image Flow - Base64 encode and pass to Groq Vision
      const base64Data = req.file.buffer.toString("base64");
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            }
          ]
        }
      ];
    } else {
      return res.status(400).json({ message: "Unsupported file format. Please upload PDF, PNG, JPG, or JPEG." });
    }

    const analysisJson = await callGroq(messages);

    // Save to database
    const analysis = await PyqAnalysis.create({
      user: req.user?.id,
      fileName: req.file.originalname,
      paperName: analysisJson.paperName || req.file.originalname,
      subject: analysisJson.subject || "Unknown Subject",
      semester: analysisJson.semester || undefined,
      difficulty: analysisJson.difficulty || "Medium",
      difficultyScore: analysisJson.difficultyScore || 50,
      estimatedTime: analysisJson.estimatedTime || "3 hours",
      totalMarks: analysisJson.totalMarks || 100,
      summary: analysisJson.summary || "No summary provided.",
      importantTopics: analysisJson.importantTopics || [],
      marksDistribution: analysisJson.marksDistribution || [],
      frequentlyAskedTopics: analysisJson.frequentlyAskedTopics || [],
      chapterWeightage: analysisJson.chapterWeightage || [],
      questionTypeDistribution: analysisJson.questionTypeDistribution || [],
      mostRepeatedQuestions: analysisJson.mostRepeatedQuestions || [],
      predictedQuestions: analysisJson.predictedQuestions || [],
      studyPlan: analysisJson.studyPlan || [],
      revisionTips: analysisJson.revisionTips || [],
      preparationSuggestions: analysisJson.preparationSuggestions || [],
      extractedText: mimeType === "application/pdf" ? extractedText : (analysisJson.extractedText || "Image scanned successfully.")
    });

    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
});

// 2. Fetch History endpoint
pyqRouter.get("/history", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { q } = req.query;
    let query: any = { user: req.user?.id };

    if (q && typeof q === "string") {
      const searchRegex = new RegExp(q, "i");
      query.$or = [
        { paperName: searchRegex },
        { subject: searchRegex },
        { extractedText: searchRegex }
      ];
    }

    const history = await PyqAnalysis.find(query)
      .select("paperName subject semester difficulty difficultyScore totalMarks createdAt fileName")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// 3. Fetch Single Analysis endpoint
pyqRouter.get("/analysis/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await PyqAnalysis.findOne({ _id: req.params.id, user: req.user?.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// 4. Delete Analysis endpoints
pyqRouter.get("/analysis/:id/delete", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await PyqAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }
    res.json({ message: "Analysis deleted successfully." });
  } catch (error) {
    next(error);
  }
});

pyqRouter.delete("/analysis/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await PyqAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }
    res.json({ message: "Analysis deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// 5. Reanalyze endpoint
pyqRouter.post("/reanalyze/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const apiKey = env.GROQ_API_KEY || env.GORQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Groq API key is not configured. Please set GROQ_API_KEY in the environment." });
    }

    const analysis = await PyqAnalysis.findOne({ _id: req.params.id, user: req.user?.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${promptText}\n\nHere is the question paper text to analyze:\n\n${analysis.extractedText}`
          }
        ]
      }
    ];

    const analysisJson = await callGroq(messages);

    // Update fields
    analysis.paperName = analysisJson.paperName || analysis.paperName;
    analysis.subject = analysisJson.subject || analysis.subject;
    analysis.semester = analysisJson.semester || analysis.semester;
    analysis.difficulty = analysisJson.difficulty || analysis.difficulty;
    analysis.difficultyScore = analysisJson.difficultyScore || analysis.difficultyScore;
    analysis.estimatedTime = analysisJson.estimatedTime || analysis.estimatedTime;
    analysis.totalMarks = analysisJson.totalMarks || analysis.totalMarks;
    analysis.summary = analysisJson.summary || analysis.summary;
    analysis.importantTopics = analysisJson.importantTopics || analysis.importantTopics;
    analysis.marksDistribution = analysisJson.marksDistribution || analysis.marksDistribution;
    analysis.frequentlyAskedTopics = analysisJson.frequentlyAskedTopics || analysis.frequentlyAskedTopics;
    analysis.chapterWeightage = analysisJson.chapterWeightage || analysis.chapterWeightage;
    analysis.questionTypeDistribution = analysisJson.questionTypeDistribution || analysis.questionTypeDistribution;
    analysis.mostRepeatedQuestions = analysisJson.mostRepeatedQuestions || analysis.mostRepeatedQuestions;
    analysis.predictedQuestions = analysisJson.predictedQuestions || analysis.predictedQuestions;
    analysis.studyPlan = analysisJson.studyPlan || analysis.studyPlan;
    analysis.revisionTips = analysisJson.revisionTips || analysis.revisionTips;
    analysis.preparationSuggestions = analysisJson.preparationSuggestions || analysis.preparationSuggestions;

    await analysis.save();
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});
