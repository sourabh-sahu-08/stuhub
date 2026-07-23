import { TopicGroup, NormalizedQuestion } from "./types.js";

export class FrequencyAnalyzerService {
  /**
   * Returns the top most frequently asked topics across all units.
   */
  static getTopTopics(groups: TopicGroup[], limit: number = 20) {
    return groups.slice(0, limit).map(g => ({
      topicName: g.topic,
      unit: g.unit,
      timesAsked: g.timesAsked,
      yearsAppeared: g.yearsAppeared,
      expectedMarks: Math.ceil(g.totalMarks / (g.timesAsked || 1)) // average marks
    }));
  }

  /**
   * Groups questions by their normalized string to find the exact top repeated questions.
   */
  static getTopQuestions(questions: NormalizedQuestion[], limit: number = 5) {
    const map = new Map<string, { 
      question: string; 
      timesAsked: number; 
      yearsAppeared: Set<string>;
      totalMarks: number;
    }>();

    for (const q of questions) {
      const key = q.normalizedQuestion.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          question: q.normalizedQuestion,
          timesAsked: 0,
          yearsAppeared: new Set<string>(),
          totalMarks: 0
        });
      }
      const entry = map.get(key)!;
      entry.timesAsked += 1;
      entry.totalMarks += (q.marks || 0);
      if (q.paperYear) entry.yearsAppeared.add(q.paperYear);
    }

    const sorted = Array.from(map.values()).sort((a, b) => b.timesAsked - a.timesAsked);

    return sorted.slice(0, limit).map(item => ({
      question: item.question,
      timesAsked: item.timesAsked,
      yearsAppeared: Array.from(item.yearsAppeared).sort((a, b) => a.localeCompare(b)),
      expectedMarks: Math.ceil(item.totalMarks / (item.timesAsked || 1)),
      trend: item.timesAsked >= 3 ? "Very High Probability" : item.timesAsked === 2 ? "High Probability" : "Medium Probability"
    }));
  }

  /**
   * Groups topics by Unit for the "Frequently Asked Topics" section.
   */
  static getTopicsByUnit(groups: TopicGroup[]) {
    const unitMap = new Map<string, any[]>();

    for (const g of groups) {
      if (!unitMap.has(g.unit)) unitMap.set(g.unit, []);
      unitMap.get(g.unit)!.push({
        topicName: g.topic,
        timesAsked: g.timesAsked
      });
    }

    return Array.from(unitMap.entries()).map(([unit, topics]) => ({
      unit,
      topics: topics.sort((a, b) => b.timesAsked - a.timesAsked) // sort topics within unit
    }));
  }
}
