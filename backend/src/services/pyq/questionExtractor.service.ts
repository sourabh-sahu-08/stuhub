import Groq from "groq-sdk";
import { RawQuestion } from "./types.js";
import { env } from "../../config/env.js";

let groq: Groq | null = null;
if (env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: env.GROQ_API_KEY });
}

export interface PaperInput {
  paperName: string;
  text: string;
}

export class QuestionExtractorService {
  static async extractMultiple(papers: PaperInput[]): Promise<RawQuestion[]> {
    if (!groq) {
      throw new Error("AI_CONFIGURATION_ERROR: Groq is not configured.");
    }
    
    // Process papers one-by-one or chunked because Qwen context/TPM might reject 6 full PDFs at once
    console.log(`[PYQ ANALYZER] Extracting PDF text...`);
    console.log(`[AI] Provider: ${env.AI_PROVIDER}`);
    console.log(`[AI] Model: ${env.GROQ_MODEL}`);

    let allQuestions: RawQuestion[] = [];
    
    for (const p of papers) {
      const prompt = `
You are an expert academic data extractor.
Extract EVERY question from this Previous Year Question Paper text.
Paper Name: ${p.paperName}

Text:
${p.text}

Output ONLY a JSON object with a single key "questions" containing an array of objects.
Do not miss any questions. Look for question numbers, marks, and typical exam formatting.
{
  "questions": [
    {
      "paperName": "${p.paperName}",
      "paperYear": "2024", 
      "exam": "End Semester", 
      "questionNumber": "Q1(a)", 
      "rawQuestion": "The exact wording of the question", 
      "marks": 5, 
      "questionType": "Theory" 
    }
  ]
}
`;

      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`[AI] Sending extraction request for ${p.paperName}`);
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: "You output only strictly valid JSON. You never invent data." },
              { role: "user", content: prompt }
            ],
            model: env.GROQ_MODEL,
            temperature: 0.1,
            max_tokens: 8000,
          });

          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error("No content from Groq");
          }
          
          let jsonStr = content;
          const thinkEnd = jsonStr.lastIndexOf("</think>");
          if (thinkEnd !== -1) {
            jsonStr = jsonStr.substring(thinkEnd + 8);
          }
          const start = jsonStr.indexOf("{");
          const end = jsonStr.lastIndexOf("}");
          if (start !== -1 && end !== -1) {
            jsonStr = jsonStr.substring(start, end + 1);
          }
          
          const parsed = JSON.parse(jsonStr);
          const extracted = parsed.questions || [];
          allQuestions = [...allQuestions, ...extracted.map((q: any) => ({ ...q, paperName: p.paperName }))];
          console.log(`[AI] Response received for ${p.paperName}`);
          break; // break retry loop
        } catch (e: any) {
          console.error(`[AI ERROR]
Provider: ${env.AI_PROVIDER}
Model: ${env.GROQ_MODEL}
Error Type: Extraction failure
Details: ${e.message}`);
          
          const errMsg = e.message || "";
          const isRetryable = errMsg.includes("429") || errMsg.includes("500") || errMsg.includes("503") || errMsg.includes("timeout") || errMsg.includes("Rate limit");
          
          if (!isRetryable) {
            throw new Error(`AI_ANALYSIS_FAILED: Fatal extraction error - ${errMsg}`);
          }
          
          retries--;
          if (retries === 0) {
            throw new Error("AI_ANALYSIS_FAILED: Extraction failed after retries.");
          }
          console.log(`[AI] Temporary failure. Retrying in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    return allQuestions;
  }
}
