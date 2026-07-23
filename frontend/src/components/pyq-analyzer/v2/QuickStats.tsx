import { motion } from "framer-motion";
import { FileText, Copy, Layers, Repeat, Hash, BookOpen, TrendingUp, Clock } from "lucide-react";

interface QuickStatsProps {
  stats: {
    totalQuestions: number;
    uniqueQuestions: number;
    repeatedQuestions: number;
    totalUnits: number;
    totalTopics: number;
    expectedMarksCoverage: number;
    questionPatterns: string[];
  };
}

const statCards = (s: QuickStatsProps["stats"]) => [
  { label: "Total Questions", value: s.totalQuestions, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "Unique Questions", value: s.uniqueQuestions, icon: Hash, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { label: "Repeated Questions", value: s.repeatedQuestions, icon: Repeat, color: "text-[#FF9000]", bg: "bg-[#FF9000]/10", border: "border-[#FF9000]/20" },
  { label: "Units Covered", value: s.totalUnits, icon: Layers, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { label: "Topics Found", value: s.totalTopics, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "Marks Coverage", value: `${s.expectedMarksCoverage}%`, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { label: "Pattern Types", value: s.questionPatterns?.length ?? 0, icon: Copy, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { label: "Study Efficiency", value: "High", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

export function QuickStats({ stats }: QuickStatsProps) {
  const cards = statCards(stats);
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Quick Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative rounded-xl border ${card.border} ${card.bg} p-4 cursor-default group overflow-hidden`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/3 to-transparent pointer-events-none`} />
            <div className={`${card.color} mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-black text-white">{card.value}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wide">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {stats.questionPatterns && stats.questionPatterns.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider self-center">Patterns:</span>
          {stats.questionPatterns.map((p, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-mono">
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
