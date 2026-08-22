import { GoogleGenerativeAI } from "@google/generative-ai";
import { RawQuestion } from "./types.js";

import { env } from "../../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

export interface PaperInput {
  paperName: string;
  text: string;
}

export class QuestionExtractorService {
  static async extractMultiple(papers: PaperInput[]): Promise<RawQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    // Combine all papers into one massive prompt to save API requests!
    const combinedText = papers.map(p => `--- START OF PAPER: ${p.paperName} ---\n${p.text}\n--- END OF PAPER: ${p.paperName} ---`).join("\n\n");

    const prompt = `
You are an expert academic data extractor.
Extract EVERY question from the following Previous Year Question Papers.

${combinedText}

Output ONLY a JSON object with a single key "questions" containing an array of objects.
Do not miss any questions. Look for question numbers, marks, and typical exam formatting.
Make sure to correctly identify the "paperName" for each question based on the delimiters.
{
  "questions": [
    {
      "paperName": "Filename.pdf", // The exact name of the paper this question was found in
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

    let retries = 5; // More retries since it's a huge request
    while (retries > 0) {
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
        return parsed.questions || [];
      } catch (e: any) {
        retries--;
        console.error(`Extractor failed. Retries left: ${retries}. Error:`, e.message);
        if (retries === 0) {
          throw new Error("AI Extraction failed after retries: " + (e.message || "Unknown error"));
        }
        
        // Dynamic wait based on error message or fallback to 10 seconds
        let waitTime = 10000;
        const match = e.message.match(/retryDelay["']?\s*:\s*["']?(\d+)s/);
        if (match && match[1]) {
          waitTime = (parseInt(match[1], 10) + 2) * 1000; // wait given seconds + 2 buffer
        }
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    return [];
  }
}
