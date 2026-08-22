import { GoogleGenerativeAI } from "@google/generative-ai";
import { RawQuestion } from "./types.js";
import { env } from "../../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

export interface ClusterOutput {
  representativeQuestion: string;
  unit: string;
  topic: string;
  questionIds: number[];
}

export class ClusteringService {
  static async clusterQuestions(
    syllabusText: string,
    validUnits: string[],
    questions: RawQuestion[]
  ): Promise<ClusterOutput[]> {
    if (questions.length === 0) return [];

    const indexedQuestions = questions.map((q, idx) => ({
      id: idx,
      q: q.rawQuestion
    }));

    const prompt = `
You are an expert academic AI. 
Your task is to cluster semantically similar exam questions and map them to the provided syllabus.

SYLLABUS:
${syllabusText}

QUESTIONS TO CLUSTER:
${JSON.stringify(indexedQuestions, null, 2)}

INSTRUCTIONS:
1. Group semantically identical or very similar questions together (even if wording differs, e.g., "Explain BCNF" and "What is Boyce Codd Normal Form?").
2. Do not rely only on keyword matching. Understand the semantic meaning.
3. For each cluster, select the BEST, cleanest, and most descriptive wording as the "representativeQuestion".
4. Map each cluster to the most appropriate Syllabus Unit and Topic.
CRITICAL: The "unit" MUST perfectly match ONE of the following valid units. DO NOT invent or hallucinate unit names.
VALID UNITS: ${JSON.stringify(validUnits)}
5. Provide the original question IDs that belong to this cluster. Every question ID must be assigned to exactly one cluster.

OUTPUT FORMAT:
Return strictly a JSON object with a "clusters" array.
{
  "clusters": [
    {
      "representativeQuestion": "Explain BCNF with suitable example.",
      "unit": "${validUnits.length > 0 ? validUnits[0] : "Unit 1"}",
      "topic": "Normalization",
      "questionIds": [0, 5, 12, 18]
    }
  ]
}
`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });
      
      const content = result.response.text();
      if (!content) {
        throw new Error("No content from Gemini in ClusteringService");
      }

      const parsed = JSON.parse(content);
      return parsed.clusters || [];
    } catch (e) {
      console.error("Failed to parse clustering JSON:", e);
      return [];
    }
  }
}
