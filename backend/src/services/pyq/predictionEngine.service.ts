import Groq from "groq-sdk";
import { TopicGroup, FuturePrediction } from "./types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class PredictionEngineService {
  /**
   * Hybrid prediction:
   * 1. Algorithm picks the top candidates based on frequency and recency.
   * 2. LLM generates a human-readable explanation based strictly on the provided timeline data.
   */
  static async predict(groups: TopicGroup[], allYears: string[], limit: number = 10): Promise<FuturePrediction[]> {
    // 1. Algorithmic Selection
    // Sort years to identify the most recent year
    const sortedYears = [...allYears].sort((a, b) => a.localeCompare(b));
    const mostRecentYear = sortedYears[sortedYears.length - 1];

    // Score topics: high frequency + not asked in most recent year = higher score (rotation pattern)
    // Or very high frequency = high score regardless
    const scored = groups.map(g => {
      let score = g.timesAsked * 10;
      const askedRecently = g.yearsAppeared.includes(mostRecentYear);
      
      // If it's a very frequent topic but was skipped recently, it has high chance of returning
      if (!askedRecently && g.timesAsked > 1) {
        score += 15;
      }

      // Base probability math
      const probability = Math.min(95, Math.max(50, Math.round((g.timesAsked / Math.max(1, allYears.length)) * 100)));
      
      return { ...g, score, probability };
    });

    // Pick top candidates
    const candidates = scored.sort((a, b) => b.score - a.score).slice(0, limit);

    if (candidates.length === 0) return [];

    // 2. LLM Reasoning Generation
    const promptData = candidates.map(c => ({
      topic: c.topic,
      unit: c.unit,
      timesAsked: c.timesAsked,
      yearsAppeared: c.yearsAppeared,
      probability: c.probability
    }));

    const prompt = `
You are an expert exam strategist. I have algorithmically selected the top predicted topics for the upcoming exam.
For each topic, write a short, data-driven "reason" (1-2 sentences) explaining why it is predicted.
You MUST base your reason ONLY on the provided "yearsAppeared" and "timesAsked" data. 
Do not invent facts. Mention skipped years or high frequency.

DATA:
${JSON.stringify(promptData, null, 2)}

Output strictly as a JSON object:
{
  "predictions": [
    {
      "topic": "Exact topic name from data",
      "reason": "Data-driven explanation..."
    }
  ]
}
`;

    let reasonsMap = new Map<string, string>();
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You output only strictly valid JSON. You never invent data." },
          { role: "user", content: prompt }
        ],
        model: "qwen/qwen3.6-27b",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        (parsed.predictions || []).forEach((p: any) => {
          reasonsMap.set(p.topic, p.reason);
        });
      }
    } catch (e) {
      console.error("Prediction LLM failed:", e);
    }

    // 3. Assemble Final Output
    return candidates.map(c => ({
      topic: c.topic,
      unit: c.unit,
      probability: c.probability,
      reason: reasonsMap.get(c.topic) || `Appeared ${c.timesAsked} times in past exams.`,
      expectedMarks: Math.ceil(c.totalMarks / (c.timesAsked || 1)),
      trend: c.probability >= 85 ? "Very High Probability" : 
             c.probability >= 70 ? "High Probability" : 
             c.probability >= 55 ? "Medium Probability" : "Low Probability"
    }));
  }
}
