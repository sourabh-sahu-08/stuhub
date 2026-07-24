import { TopicGroup } from "./types.js";

export class TimelineGeneratorService {
  /**
   * Generates a matrix for top topics indicating their presence across all known years.
   */
  static generate(groups: TopicGroup[], allYears: string[], limit: number = 10) {
    // Sort years chronologically
    const sortedYears = [...allYears].sort((a, b) => a.localeCompare(b));
    
    // Pick top topics
    const topGroups = groups.slice(0, limit);
    
    const result: { topic: string; timeline: Record<string, boolean> }[] = [];

    for (const g of topGroups) {
      const timeline: Record<string, boolean> = {};
      
      for (const year of sortedYears) {
        timeline[year] = g.yearsAppeared.includes(year);
      }

      result.push({
        topic: g.topic,
        timeline
      });
    }

    return result;
  }
}
