import React from "react";
import { Pyq3DashboardJSON } from "../../../../types/pyq3";
import { HelpCircle, Clock, CalendarDays, TrendingUp } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["frequentlyAskedQuestions"];
}

export const FrequentlyAskedQuestions: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-100">Top Repeated Questions</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((q, i) => (
          <div key={i} className="bg-[#222] border border-gray-800 p-5 rounded-lg hover:border-gray-700 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-200 mb-3">{q.question}</h4>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded">
                    <Clock className="w-4 h-4" />
                    {q.timesAsked}x Asked
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <CalendarDays className="w-4 h-4" />
                    {q.yearsAppeared.join(", ")}
                  </div>
                  {q.expectedMarks > 0 && (
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <span className="font-medium">~{q.expectedMarks} Marks</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="shrink-0">
                <div className={\`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 \${
                  q.trend === "Very High Probability" ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                  q.trend === "High Probability" ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" :
                  "bg-green-500/20 text-green-400 border border-green-500/20"
                }\`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {q.trend}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
