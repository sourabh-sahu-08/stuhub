import React from "react";
import { Pyq3DashboardJSON } from "../../../../types/pyq3";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["questionTimeline"];
}

export const QuestionTimeline: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Extract all unique years from the timeline objects, sorted
  const allYears = Array.from(
    new Set(data.flatMap(d => Object.keys(d.timeline)))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-bold text-gray-100">Topic Appearance Timeline</h3>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-gray-800 text-gray-400 font-medium">Topic</th>
              {allYears.map(year => (
                <th key={year} className="text-center p-3 border-b border-gray-800 text-gray-400 font-medium whitespace-nowrap">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#222] transition-colors group">
                <td className="p-3 border-b border-gray-800/50 text-gray-300 font-medium group-hover:text-white transition-colors">
                  {row.topic}
                </td>
                {allYears.map(year => (
                  <td key={year} className="p-3 border-b border-gray-800/50 text-center">
                    {row.timeline[year] ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-700 mx-auto opacity-50" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
