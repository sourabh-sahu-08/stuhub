import React from "react";
import { Pyq3DashboardJSON } from "../../../types/pyq3";
import { Layers, FileText, Repeat, Target, BarChart2 } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["overallAnalysis"];
}

export const OverallAnalysis: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          label="Total Questions Extracted"
          value={data.totalQuestions}
          subtext={`From ${data.totalPapers} papers`}
        />
        <StatCard
          icon={<Layers className="w-5 h-5 text-purple-400" />}
          label="Unique Concepts"
          value={data.uniqueQuestions}
        />
        <StatCard
          icon={<Repeat className="w-5 h-5 text-green-400" />}
          label="Repeated Questions"
          value={data.repeatedQuestions}
          subtext={`${Math.round((data.repeatedQuestions / (data.totalQuestions || 1)) * 100)}% Repetition Rate`}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-orange-400" />}
          label="Most Important Unit"
          value={data.mostImportantUnit}
          valueSize="text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800 flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
            <BarChart2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Most Repeated Topic</p>
            <p className="text-xl font-semibold text-gray-100">{data.mostRepeatedTopic}</p>
          </div>
        </div>
        
        <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800 flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-lg shrink-0">
            <Repeat className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Most Repeated Question</p>
            <p className="text-md font-semibold text-gray-100 leading-snug">{data.mostRepeatedQuestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, valueSize = "text-3xl" }: any) => (
  <div className="bg-[#1C1C1C] p-5 rounded-xl border border-gray-800 flex flex-col">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-[#252525] rounded-lg">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-400">{label}</p>
    </div>
    <div className="mt-auto">
      <h3 className={`${valueSize} font-bold text-gray-100 truncate`} title={String(value)}>{value}</h3>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  </div>
);
