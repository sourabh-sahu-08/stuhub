import Groq from "groq-sdk";
import { RawQuestion, NormalizedQuestion } from "./types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class QuestionNormalizerService {
  static async normalize(questions: RawQuestion[], syllabusText: string): Promise<NormalizedQuestion[]> {
    // Process in batches of 100 to avoid LLM output truncation (8000 token limit)
    const BATCH_SIZE = 100;
    let allNormalized: NormalizedQuestion[] = [];

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);
      const batchNormalized = await this.normalizeBatch(batch, syllabusText);
      allNormalized = [...allNormalized, ...batchNormalized];
    }

    return allNormalized;
  }

  private static async normalizeBatch(questions: RawQuestion[], syllabusText: string): Promise<NormalizedQuestion[]> {
    const questionsJSON = JSON.stringify(questions.map((q, idx) => ({ id: idx, q: q.rawQuestion })));

    const prompt = `
You are an expert AI syllabus mapper. 
You are given a syllabus and a list of raw exam questions.
Your task is to map each question to the exact syllabus unit, and identify the core "topic" and "normalizedQuestion".

SYLLABUS:
${syllabusText}

QUESTIONS:
${questionsJSON}

RULES:
1. "unit" MUST exactly match the unit name from the syllabus (e.g. "Unit 1: Introduction").
2. "topic" is the core concept being tested (e.g. "Deadlock", "Process Scheduling", "Paging").
3. "normalizedQuestion" is a clean, canonical version of the question. E.g., "Write short notes on Deadlock" -> "Explain Deadlock".

Output strictly as a JSON object:
{
  "mappings": [
    {
      "id": number (matching the input id),
      "topic": string,
      "unit": string,
      "normalizedQuestion": string
    }
  ]
}
`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You output only strictly valid JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 8000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return questions as any; // fallback

      const parsed = JSON.parse(content);
      const mappings = parsed.mappings || [];
      
      const mappingDict = new Map<number, any>();
      mappings.forEach((m: any) => mappingDict.set(m.id, m));

      return questions.map((q, idx) => {
        const mapping = mappingDict.get(idx);
        return {
          ...q,
          normalizedQuestion: mapping?.normalizedQuestion || q.rawQuestion,
          topic: mapping?.topic || "Unknown Topic",
          unit: mapping?.unit || "Unknown Unit"
        };
      });
    } catch (e) {
      console.error("Failed to normalize batch:", e);
      // Fallback: return as-is but cast to NormalizedQuestion format
      return questions.map(q => ({
        ...q,
        normalizedQuestion: q.rawQuestion,
        topic: "Unclassified",
        unit: "Unclassified"
      }));
    }
  }
}
