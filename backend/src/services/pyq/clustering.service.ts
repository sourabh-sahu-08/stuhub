import Groq from "groq-sdk";
import { RawQuestion } from "./types.js";
import { env } from "../../config/env.js";

let groq: Groq | null = null;
if (env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: env.GROQ_API_KEY });
}

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
    if (!groq) {
      throw new Error("AI_CONFIGURATION_ERROR: Groq is not configured.");
    }

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

    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`[AI] Sending clustering request...`);
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You output only strictly valid JSON. You never invent data." },
            { role: "user", content: prompt }
          ],
          model: env.GROQ_MODEL,
          temperature: 0.2,
          max_tokens: 2000,
        });
        
        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No content from Groq in ClusteringService");
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
        console.log(`[AI] Clustering complete`);
        return parsed.clusters || [];
      } catch (e: any) {
        console.error(`[AI ERROR]
Provider: ${env.AI_PROVIDER}
Model: ${env.GROQ_MODEL}
Error Type: Clustering failure
Details: ${e.message}`);
        
        const errMsg = e.message || "";
        const isRetryable = errMsg.includes("429") || errMsg.includes("500") || errMsg.includes("503") || errMsg.includes("timeout") || errMsg.includes("Rate limit");
        
        if (!isRetryable) {
          throw new Error(`AI_ANALYSIS_FAILED: Fatal clustering error - ${errMsg}`);
        }
        
        retries--;
        if (retries === 0) {
          throw new Error("AI_ANALYSIS_FAILED: Clustering failed after retries.");
        }
        console.log(`[AI] Temporary failure. Retrying in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    return [];
  }
}
