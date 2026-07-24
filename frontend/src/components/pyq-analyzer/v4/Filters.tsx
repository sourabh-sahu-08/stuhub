import React from "react";
import { Search, Filter, ArrowDownWideNarrow } from "lucide-react";

export type SortOption = "highest" | "alphabetical" | "recent";
export type MinRepetitions = "all" | "2" | "3" | "5";

interface Props {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  minRepetitions: MinRepetitions;
  setMinRepetitions: (v: MinRepetitions) => void;
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

export const Filters: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  minRepetitions,
  setMinRepetitions,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search extracted questions or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#292929] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#F5A524] transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={minRepetitions}
            onChange={(e) => setMinRepetitions(e.target.value as MinRepetitions)}
            className="appearance-none bg-[#292929] border border-gray-700 rounded-lg py-2 pl-9 pr-8 text-sm text-gray-200 focus:outline-none focus:border-[#F5A524] cursor-pointer"
          >
            <option value="all">All Repetitions</option>
            <option value="2">2+ Times</option>
            <option value="3">3+ Times</option>
            <option value="5">5+ Times</option>
          </select>
        </div>

        <div className="relative shrink-0">
          <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-[#292929] border border-gray-700 rounded-lg py-2 pl-9 pr-8 text-sm text-gray-200 focus:outline-none focus:border-[#F5A524] cursor-pointer"
          >
            <option value="highest">Highest Repeated</option>
            <option value="recent">Recent First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>
  );
};
