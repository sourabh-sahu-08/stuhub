import React, { useState } from "react";
import { Pyq3DashboardJSON } from "../../../types/pyq3";
import { Search, Filter, BookOpen } from "lucide-react";

interface Props {
  data: Pyq3DashboardJSON["allQuestions"];
}

export const SearchAndFilter: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");

  const units = ["All", ...Array.from(new Set(data.map(q => q.unit))).sort()];
  const years = ["All", ...Array.from(new Set(data.map(q => q.paperYear || "Unknown"))).sort()];

  const filteredData = data.filter(q => {
    const matchesSearch = q.rawQuestion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === "All" || q.unit === selectedUnit;
    const matchesYear = selectedYear === "All" || q.paperYear === selectedYear;
    return matchesSearch && matchesUnit && matchesYear;
  });

  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <DatabaseIcon /> Question Database
        </h3>
        <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
          {filteredData.length} Results
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <select 
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="bg-[#111] border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 appearance-none min-w-[150px]"
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-[#111] border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 appearance-none min-w-[120px]"
        >
          {years.map(y => <option key={y} value={y}>{y === "Unknown" ? "Unknown Year" : y}</option>)}
        </select>
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#111] sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">Question</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">Topic</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">Unit</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 text-center">Marks</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 text-center">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredData.length > 0 ? filteredData.map((q, i) => (
                <tr key={i} className="hover:bg-[#222] transition-colors">
                  <td className="p-4 text-sm text-gray-200 font-medium">{q.rawQuestion}</td>
                  <td className="p-4 text-sm text-gray-400">
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs">{q.topic}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      {q.unit}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300 text-center">{q.marks || "-"}</td>
                  <td className="p-4 text-sm text-gray-400 text-center font-mono">{q.paperYear || "N/A"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No questions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);
