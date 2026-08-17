import { Router } from "express";
import { Groq } from "groq-sdk";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { z } from "zod";

export const aiRouter = Router();

const groq = new Groq({
  apiKey: env.GROQ_API_KEY || "dummy", // use dummy if not provided so it doesn't crash on init
});

aiRouter.post("/chat", async (req, res, next) => {
  try {
    if (!env.GROQ_API_KEY) {
      return res.status(503).json({ 
        message: "AI capabilities are currently unavailable. Missing GROQ API Key." 
      });
    }

    const { messages } = z.object({
      messages: z.array(z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string()
      }))
    }).parse(req.body);

    // Prepend a system prompt to guide the AI
    const systemPrompt = {
      role: "system",
      content: `You are a highly intelligent, empathetic, and expert academic assistant built for StuHub, an advanced student workspace platform.
Your goal is to help students with their studies, assignments, and understanding of complex topics.
- ALWAYS provide extremely SMALL, CRISP, and CONCISE answers. Get straight to the point.
- Do NOT provide long lists of steps unless explicitly asked.
- Use simple language.
- Use markdown for formatting, including bolding, lists, and code blocks.
- If asked about navigating StuHub (e.g., "where are my notes", "how to find assignments", "previous year questions"), ALWAYS provide a direct markdown link to the relevant page in your short answer. For example, if they ask for notes, respond with: "You can find your notes in the [Library](/dashboard/library)."
  Available routes:
  - Notes / Study Materials: [Library](/dashboard/library)
  - PYQs: [Previous Year Questions](/dashboard/pyq)
  - CT PYQs: [Class Test PYQs](/dashboard/ct-pyq)
  - PYQ Analyzer: [PYQ Analyzer](/dashboard/pyq-analyzer)
  - Assignments: [Assignments](/dashboard/assignments)
  - Attendance: [Attendance](/dashboard/attendance)
  - Chat: [Community Chat](/dashboard/chat)
- Be encouraging and supportive.`
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...messages] as any,
      model: "qwen/qwen3.6-27b",
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1,
      stream: false,
      stop: null
    });

    let reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    // Strip <think>...</think> reasoning blocks if the model includes them
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});
