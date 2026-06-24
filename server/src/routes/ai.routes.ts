import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post("/chat", (req, res) => {
  const question = String(req.body.question ?? "");
  res.json({
    answer: `College OS assistant: I found guidance for "${question || "your question"}". Check notices, timetable, assignments, and library resources first; I can connect this to an LLM provider in production.`
  });
});

aiRouter.post("/study-planner", (req, res) => {
  const subjects = Array.isArray(req.body.subjects) ? req.body.subjects : ["Data Structures", "DBMS", "Operating Systems"];
  res.json({
    plan: subjects.map((subject: string, index: number) => ({
      day: index + 1,
      subject,
      focus: "Revise notes, solve previous papers, and summarize weak topics",
      durationMinutes: 90
    }))
  });
});

aiRouter.post("/summarize", (req, res) => {
  const text = String(req.body.text ?? "");
  res.json({
    summary: text.length > 160 ? `${text.slice(0, 157)}...` : text || "Upload or paste notes to generate a concise summary."
  });
});

aiRouter.get("/recommendations", (_req, res) => {
  res.json({
    resources: ["DBMS normalization guide", "Aptitude sprint set", "Operating systems PYQ bundle"],
    notifications: ["Submit AI assignment by Friday", "Placement bootcamp registration closes soon"],
    performancePrediction: { risk: "moderate", confidence: 0.78, reason: "Attendance trend and recent internal marks" }
  });
});
