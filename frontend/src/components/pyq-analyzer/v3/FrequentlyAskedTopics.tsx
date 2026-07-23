import React, { useState } from "react";
import { Pyq3DashboardJSON } from "../../../../types/pyq3";
import { ChevronDown, ChevronRight, Hash } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["frequentlyAskedTopics"];
}

export const FrequentlyAskedTopics: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-100 mb-6">Frequently Asked Topics</h3>
      <div className="space-y-4">
        {data.map((unit, index) => (
          <TopicUnitGroup key={index} unitData={unit} />
        ))}
      </div>
    </div>
  );
};

const TopicUnitGroup = ({ unitData }: { unitData: Pyq3DashboardJSON["frequentlyAskedTopics"][0] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#222]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#2A2A2A] transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          <span className="font-semibold text-gray-200">{unitData.unit}</span>
        </div>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
          {unitData.topics.length} topics
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {unitData.topics.map((topic, i) => (
              <div key={i} className="flex justify-between items-center bg-[#181818] p-3 rounded-lg border border-gray-800/50">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300 font-medium">{topic.topicName}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-blue-400">{topic.timesAsked}x</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Asked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
