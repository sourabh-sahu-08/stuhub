import { NormalizedQuestion, TopicGroup } from "./types.js";

export class DuplicateDetectorService {
  /**
   * Groups normalized questions by their resolved "topic" and "unit".
   * This is entirely deterministic because the normalizer LLM already 
   * assigned the canonical topic names.
   */
  static detectAndGroup(questions: NormalizedQuestion[]): TopicGroup[] {
    const map = new Map<string, TopicGroup>();

    for (const q of questions) {
      // Create a unique key combining unit and topic
      // We normalize to lowercase to prevent minor casing variations
      const key = `${q.unit.trim().toLowerCase()}::${q.topic.trim().toLowerCase()}`; 

      if (!map.has(key)) {
        map.set(key, {
          topic: q.topic, // keep original casing
          unit: q.unit,   // keep original casing
          appearances: [],
          timesAsked: 0,
          totalMarks: 0,
          yearsAppeared: []
        });
      }

      const group = map.get(key)!;
      group.appearances.push(q);
      group.timesAsked += 1;
      group.totalMarks += (q.marks || 0); // fallback to 0 if null

      const year = q.paperYear || "Unknown";
      if (year !== "Unknown" && !group.yearsAppeared.includes(year)) {
        group.yearsAppeared.push(year);
      }
    }

    // Sort years ascending for each group
    for (const group of map.values()) {
      group.yearsAppeared.sort((a, b) => a.localeCompare(b));
    }

    // Return descending by frequency as default
    return Array.from(map.values()).sort((a, b) => b.timesAsked - a.timesAsked);
  }
}
