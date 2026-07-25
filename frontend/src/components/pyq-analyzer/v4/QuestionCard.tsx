import React, { useState } from "react";
import { V4QuestionCard } from "../../../types/pyq4";
import { ChevronDown, ChevronUp, Calendar, Repeat, Activity, FileText } from "lucide-react";

interface Props {
  question: V4QuestionCard;
}

export const QuestionCard: React.FC<Props> = ({ question }) => {
  const [variantsExpanded, setVariantsExpanded] = useState(false);

  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-lg p-5">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex-1">
          <span className="inline-block px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded-full mb-3 font-medium">
            {question.topic}
          </span>
          <h4 className="text-lg font-medium text-gray-200 leading-relaxed mb-4">
            {question.question}
          </h4>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
              <Repeat className="w-4 h-4" />
              <span className="font-semibold">{question.frequency}x Repeated</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
              <Activity className="w-4 h-4" />
              <span className="font-semibold">{question.confidence}% Confidence</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-800 px-2 py-1 rounded">
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-xs">
                {question.papers.map(p => p.year).sort().join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {question.variants.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-800">
          <button
            onClick={() => setVariantsExpanded(!variantsExpanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {variantsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="font-medium">
              {variantsExpanded ? "Hide" : "Show"} {question.variants.length} Question Variations
            </span>
          </button>

          {variantsExpanded && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-700">
              {question.variants.map((v, i) => (
                <div key={i} className="flex items-start gap-3 justify-between bg-gray-800/30 p-2 rounded">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">{v.text}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded shrink-0">
                    {v.year}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
