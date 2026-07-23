import React from "react";
import { Pyq3DashboardJSON } from "../../../types/pyq3";
import { Zap, Target, BookOpen } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["futurePredictions"];
}

export const FuturePredictions: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
        <h3 className="text-xl font-bold text-gray-100">Algorithmic Future Predictions</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((pred, i) => (
          <div key={i} className="bg-[#222] border border-gray-800 p-5 rounded-lg relative overflow-hidden group">
            {/* Probability Ring Background Effect */}
            <div 
              className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity"
              style={{
                backgroundColor: 
                  pred.probability >= 85 ? '#ef4444' : 
                  pred.probability >= 70 ? '#f97316' : 
                  pred.probability >= 55 ? '#eab308' : '#3b82f6'
              }}
            />
            
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold text-gray-100 pr-4">{pred.topic}</h4>
              <div className="text-right shrink-0">
                <span className={`text-xl font-black ${
                  pred.probability >= 85 ? 'text-red-400' : 
                  pred.probability >= 70 ? 'text-orange-400' : 
                  pred.probability >= 55 ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {pred.probability}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4 text-xs font-medium text-gray-400 bg-gray-800/50 w-fit px-2 py-1 rounded">
              <BookOpen className="w-3.5 h-3.5" />
              {pred.unit}
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {pred.reason}
            </p>
            
            {pred.expectedMarks > 0 && (
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-800/50">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-gray-300">Expected: {pred.expectedMarks} Marks</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
