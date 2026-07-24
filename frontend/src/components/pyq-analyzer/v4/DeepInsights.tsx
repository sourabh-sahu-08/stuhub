import React, { useMemo } from 'react';
import { V4DashboardJSON } from '../../../types/pyq4';
import { Target, TrendingUp, AlertTriangle, BookOpen, Award } from 'lucide-react';

interface DeepInsightsProps {
  data: V4DashboardJSON;
}

export const DeepInsights: React.FC<DeepInsightsProps> = ({ data }) => {
  const insights = useMemo(() => {
    let totalQuestions = 0;
    const unitWeights: { unitName: string; weight: number; percentage: number }[] = [];
    const allTopics: { topic: string; unit: string; frequency: number; uniqueYears: Set<string> }[] = [];

    // First pass: gather data
    data.units.forEach(u => {
      let unitTotal = 0;
      u.topics.forEach(t => {
        let topicUniqueYears = new Set<string>();
        let topicCombinedFreq = 0;
        
        t.questions.forEach(q => {
          totalQuestions += q.frequency;
          unitTotal += q.frequency;
          topicCombinedFreq += q.frequency;
          q.papers.forEach(p => {
            if (p.year) topicUniqueYears.add(String(p.year));
          });
        });
        
        if (topicCombinedFreq > 0) {
          allTopics.push({
            topic: t.topic,
            unit: u.unit,
            frequency: topicCombinedFreq,
            uniqueYears: topicUniqueYears
          });
        }
      });
      unitWeights.push({ unitName: u.unit, weight: unitTotal, percentage: 0 });
    });

    // Calculate percentages
    if (totalQuestions > 0) {
      unitWeights.forEach(u => {
        u.percentage = Math.round((u.weight / totalQuestions) * 100);
      });
    }

    // Sort unit weights
    unitWeights.sort((a, b) => b.weight - a.weight);

    // Guaranteed Topics (appeared in the most unique years)
    allTopics.sort((a, b) => b.uniqueYears.size - a.uniqueYears.size || b.frequency - a.frequency);
    const guaranteedTopics = allTopics.slice(0, 3);

    // Top Heavy Units (units that cover > 50% of the exam)
    let cumulative = 0;
    const criticalUnits = [];
    for (const u of unitWeights) {
      cumulative += u.percentage;
      criticalUnits.push(u);
      if (cumulative >= 50) break;
    }

    return {
      totalQuestions,
      unitWeights,
      guaranteedTopics,
      criticalUnits
    };
  }, [data]);

  if (insights.totalQuestions === 0) return null;

  return (
    <div className="bg-[#1C1C1C] border border-[#F5A524]/20 rounded-2xl p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Target className="w-6 h-6 text-[#F5A524]" />
        <h2 className="text-xl font-bold text-gray-100">Deep Research & Strategy</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Strategic Advice Card */}
        <div className="bg-[#262626] border border-gray-800 rounded-xl p-5 hover:border-[#F5A524]/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-gray-200">The 50% Rule</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Mastering just these {insights.criticalUnits.length} unit(s) will secure approximately <strong>{insights.criticalUnits.reduce((acc, u) => acc + u.percentage, 0)}%</strong> of the historical paper weight.
          </p>
          <div className="space-y-2">
            {insights.criticalUnits.map((u, i) => (
              <div key={i} className="flex justify-between items-center bg-[#1C1C1C] px-3 py-2 rounded-lg text-sm">
                <span className="text-gray-300 truncate pr-2">{u.unitName}</span>
                <span className="text-[#F5A524] font-bold">{u.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guaranteed Topics */}
        <div className="bg-[#262626] border border-gray-800 rounded-xl p-5 hover:border-[#F5A524]/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-gray-200">Core Fundamentals</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            These topics have appeared in almost every single year analyzed. Do not skip these under any circumstances.
          </p>
          <ul className="space-y-3">
            {insights.guaranteedTopics.map((t, i) => (
              <li key={i} className="flex flex-col">
                <span className="text-sm font-medium text-gray-200 truncate">{t.topic}</span>
                <span className="text-xs text-gray-500">Appeared in {t.uniqueYears.size} different years</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unit Weightage Distribution */}
        <div className="bg-[#262626] border border-gray-800 rounded-xl p-5 hover:border-[#F5A524]/40 transition-colors md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-gray-200">Unit Weightage</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Historical distribution of questions across all units.
          </p>
          <div className="space-y-3 mt-4">
            {insights.unitWeights.slice(0, 4).map((u, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 truncate pr-2">{u.unitName}</span>
                  <span className="text-gray-400">{u.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${u.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {insights.unitWeights.length > 4 && (
              <div className="text-xs text-center text-gray-500 mt-2">
                + {insights.unitWeights.length - 4} more units
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
