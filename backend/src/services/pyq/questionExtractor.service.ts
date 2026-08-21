import Groq from "groq-sdk";
import { RawQuestion } from "./types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class QuestionExtractorService {
  static async extract(paperName: string, text: string): Promise<RawQuestion[]> {
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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You output only strictly valid JSON. You never invent data. You extract perfectly." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("No content from Groq in QuestionExtractorService");
      return [];
    }

    try {
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
