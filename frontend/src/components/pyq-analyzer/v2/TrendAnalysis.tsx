import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles, Ban } from "lucide-react";

interface TrendAnalysisProps {
  trendAnalysis: {
    increasing: string[];
    stable: string[];
    declining: string[];
    neverAsked: string[];
    recentlyIntroduced: string[];
  };
  yearwiseAnalysis: Array<{
    year: string;
    dominantUnit: string;
    totalQuestions: number;
    difficulty: string;
    highlights: string[];
  }>;
}

export function TrendAnalysis({ trendAnalysis, yearwiseAnalysis }: TrendAnalysisProps) {
  const categories = [
    { label: "Increasing", key: "increasing" as const, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15", chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { label: "Stable", key: "stable" as const, icon: Minus, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15", chip: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { label: "Declining", key: "declining" as const, icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-500/8 border-orange-500/15", chip: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { label: "Never Asked", key: "neverAsked" as const, icon: Ban, color: "text-zinc-600", bg: "bg-zinc-800/30 border-zinc-700/30", chip: "bg-zinc-800/50 text-zinc-500 border-zinc-700" },
    { label: "Recently Introduced", key: "recentlyIntroduced" as const, icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/15", chip: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Trend Analysis</h2>

      {/* Trend categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(({ label, key, icon: Icon, color, bg, chip }) => {
          const items = trendAnalysis?.[key] ?? [];
          if (items.length === 0) return null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${bg}`}
            >
              <div className={`flex items-center gap-2 mb-3 ${color}`}>
                <Icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{label}</span>
                <span className="ml-auto text-[10px] text-zinc-600 font-mono">{items.length} topics</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((t, i) => (
                  <span key={i} className={`text-[10px] px-2 py-0.5 rounded border font-mono ${chip}`}>{t}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Year-wise timeline */}
      {yearwiseAnalysis?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">Year-wise Paper Analysis</h3>
          <div className="space-y-2">
            {yearwiseAnalysis.map((y, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 items-start bg-[#0d0d12] border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all"
              >
                <div className="shrink-0 text-center">
                  <div className="text-base font-black text-[#FF9000] font-mono">{y.year}</div>
                  <div className="text-[9px] text-zinc-600 font-mono">{y.totalQuestions} Qs</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 bg-[#FF9000]/10 text-[#FF9000] border border-[#FF9000]/20 rounded font-mono">
                      {y.dominantUnit}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/4 text-zinc-400 border border-white/8 rounded font-mono">
                      {y.difficulty}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {y.highlights?.map((h, hi) => (
                      <div key={hi} className="flex gap-2 text-xs text-zinc-500">
                        <span className="text-zinc-700">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
