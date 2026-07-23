import React from "react";
import { Pyq3DashboardJSON } from "../../../types/pyq3";

interface Props {
  data: Pyq3DashboardJSON["unitWeightage"];
}

export const UnitWeightage: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-100 mb-6">Unit Weightage</h3>
      
      <div className="space-y-5">
        {data.map((unit, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-300">{unit.unit}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{unit.percentage}%</span>
                <span className="text-xs text-gray-500 ml-2">({unit.totalMarks} marks)</span>
              </div>
            </div>
            
            <div className="h-3 w-full bg-[#2A2A2A] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: \`\${unit.percentage}%\`,
                  background: \`linear-gradient(90deg, var(--tw-gradient-stops))\`,
                  // using different colors based on rank
                  ...(index === 0 ? { backgroundImage: 'linear-gradient(to right, #ef4444, #f97316)' } : 
                      index === 1 ? { backgroundImage: 'linear-gradient(to right, #f59e0b, #eab308)' } :
                      index === 2 ? { backgroundImage: 'linear-gradient(to right, #10b981, #3b82f6)' } :
                      { backgroundImage: 'linear-gradient(to right, #6366f1, #8b5cf6)' })
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
