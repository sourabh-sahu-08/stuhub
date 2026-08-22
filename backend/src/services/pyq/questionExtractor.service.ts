import { GoogleGenerativeAI } from "@google/generative-ai";
import { RawQuestion } from "./types.js";

import { env } from "../../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

export class QuestionExtractorService {
  static async extract(paperName: string, text: string): Promise<RawQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `
You are an expert academic data extractor.
Extract EVERY question from this Previous Year Question Paper text.
Paper Name: ${paperName}

Text:
${text}

Output ONLY a JSON object with a single key "questions" containing an array of objects.
Do not miss any questions. Look for question numbers, marks, and typical exam formatting.
{
  "questions": [
    {
      "paperYear": "2024", // Extract from text or filename, string, or null
      "exam": "End Semester", // Extract from text (e.g. End Semester, Mid Semester, Supplementary), string, or null
      "questionNumber": "Q1(a)", // String, or null
      "rawQuestion": "The exact wording of the question", // String, required
      "marks": 5, // Number, or null if not found
      "questionType": "Theory" // One of: Definition, Theory, Numerical, Short Answer, Long Answer, Difference, Diagram, Algorithm, Programming, Case Study
    }
  ]
}
`;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });
      const content = result.response.text();
      if (!content) {
        throw new Error("No content from Gemini");
      }
      
      const parsed = JSON.parse(content);
      return (parsed.questions || []).map((q: any) => ({
        ...q,
        paperName,
      }));
    } catch (e) {
      console.error("Failed to parse extractor JSON:", e);
      return [];
    }
  }
}
