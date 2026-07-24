import React from "react";
import { V4DashboardJSON } from "../../../types/pyq4";
import { Layers, FileText, Repeat, BrainCircuit, BookOpen, Target } from "lucide-react";

interface Props {
  data: V4DashboardJSON["overview"];
}

export const OverviewCards: React.FC<Props> = ({ data }) => {
  const cards = [
    {
      title: "Papers Analyzed",
      value: data.papersAnalyzed,
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Total Questions",
      value: data.totalQuestions,
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Unique Questions",
      value: data.uniqueQuestions,
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Units Detected",
      value: data.unitsDetected,
      icon: <BookOpen className="w-5 h-5 text-pink-400" />,
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`p-4 rounded-xl border ${card.border} ${card.bg} flex items-center gap-4`}>
            <div className="p-3 bg-black/20 rounded-lg">
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.title}</p>
              <h4 className="text-2xl font-bold text-gray-100 mt-1">{card.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Wide cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1C1C1C] border border-gray-800 p-5 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 shrink-0">
            <Repeat className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Most Repeated Question</p>
            <h4 className="text-sm md:text-base font-semibold text-gray-200 line-clamp-2">{data.mostRepeatedQuestion}</h4>
          </div>
        </div>

        <div className="bg-[#1C1C1C] border border-gray-800 p-5 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 shrink-0">
            <BrainCircuit className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Most Important Unit</p>
            <h4 className="text-base md:text-lg font-bold text-gray-200">{data.mostImportantUnit}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
