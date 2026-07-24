import { TopicGroup, UnitWeightage } from "./types.js";

export class UnitAnalyzerService {
  /**
   * Calculates the percentage weightage of each unit based on total marks asked.
   */
  static calculateWeightage(groups: TopicGroup[]): UnitWeightage[] {
    const unitMap = new Map<string, { totalMarks: number; topics: TopicGroup[] }>();
    let grandTotalMarks = 0;

    for (const g of groups) {
      if (!unitMap.has(g.unit)) {
        unitMap.set(g.unit, { totalMarks: 0, topics: [] });
      }
      const u = unitMap.get(g.unit)!;
      u.topics.push(g);
      u.totalMarks += g.totalMarks;
      grandTotalMarks += g.totalMarks;
    }

    const result: UnitWeightage[] = [];
    
    for (const [unitName, data] of unitMap.entries()) {
      result.push({
        unit: unitName,
        totalMarks: data.totalMarks,
        percentage: grandTotalMarks > 0 ? Math.round((data.totalMarks / grandTotalMarks) * 100) : 0,
        topics: data.topics.sort((a, b) => b.timesAsked - a.timesAsked)
      });
    }

    // Sort by weightage descending
    return result.sort((a, b) => b.percentage - a.percentage);
  }
}
