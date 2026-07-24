import React from "react";
import { V4UnitGroup } from "../../../types/pyq4";
import { QuestionCard } from "./QuestionCard";
import { ChevronDown, ChevronRight, Hash } from "lucide-react";

interface Props {
  units: V4UnitGroup[];
  expandedUnit: string | null;
  setExpandedUnit: (unit: string | null) => void;
}

export const UnitAccordion: React.FC<Props> = ({ units, expandedUnit, setExpandedUnit }) => {
  if (units.length === 0) {
    return (
      <div className="text-center py-10 bg-[#141414] border border-gray-800 rounded-xl">
        <p className="text-gray-400">No questions found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {units.map((unitGroup) => {
        const isExpanded = expandedUnit === unitGroup.unit;
        
        return (
          <div 
            key={unitGroup.unit} 
            className={`border rounded-xl transition-colors duration-200 ${
              isExpanded ? "border-[#F5A524] bg-[#1a1a1a]" : "border-gray-800 bg-[#141414] hover:border-gray-700"
            }`}
          >
            <button
              onClick={() => setExpandedUnit(isExpanded ? null : unitGroup.unit)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isExpanded ? "bg-[#F5A524]/10" : "bg-gray-800"}`}>
                  <Hash className={`w-5 h-5 ${isExpanded ? "text-[#F5A524]" : "text-gray-400"}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isExpanded ? "text-gray-100" : "text-gray-300"}`}>
                    {unitGroup.unit}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {unitGroup.topics.reduce((sum, t) => sum + t.questions.length, 0)} unique questions detected across {unitGroup.topics.length} topics
                  </p>
                </div>
              </div>
              <div className="text-gray-400">
                {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 pt-2 border-t border-gray-800/50">
                <div className="space-y-6 mt-4">
                  {unitGroup.topics.map((topicGroup, tIdx) => (
                    <div key={tIdx} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px bg-gray-700 flex-grow"></div>
                        <h4 className="text-md font-bold text-gray-300 px-3 py-1 bg-gray-800/50 rounded-md border border-gray-700">
                          Topic: {topicGroup.topic}
                        </h4>
                        <div className="h-px bg-gray-700 flex-grow"></div>
                      </div>
                      
                      <div className="space-y-4">
                        {topicGroup.questions.map((q, idx) => (
                          <QuestionCard key={idx} question={q} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
