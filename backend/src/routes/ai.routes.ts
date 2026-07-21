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
- Provide SMALL, CRISP, and EASY TO UNDERSTAND answers. Keep it brief and to the point.
- Use simple language.
- Use markdown for formatting, including bolding, lists, and code blocks.
- If asked about StuHub, you know it's a premium academic platform with AI capabilities, PYQ (Previous Year Questions) analysis, and assignment tracking.
- Be encouraging and supportive.`
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...messages] as any,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1,
      stream: false,
      stop: null
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});
