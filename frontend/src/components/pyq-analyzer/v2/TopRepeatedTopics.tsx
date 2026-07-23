import { motion } from "framer-motion";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

interface TopRepeatedTopicsProps {
  topics: Array<{
    rank: number;
    topic: string;
    unit: string;
    timesAsked: number;
    yearsAppeared: string[];
    expectedMarks: number;
    probability: number;
    difficulty: string;
    trend: string;
  }>;
}

const rankColors = ["text-yellow-400", "text-zinc-300", "text-amber-600"];
const rankBg = ["bg-yellow-500/10 border-yellow-500/20", "bg-zinc-500/10 border-zinc-500/20", "bg-amber-700/10 border-amber-700/20"];

const TrendIcon = ({ trend }: { trend: string }) => {
  const t = trend?.toLowerCase() ?? "";
  if (t === "increasing") return <TrendingUp size={11} className="text-emerald-400" />;
  if (t === "declining") return <TrendingDown size={11} className="text-red-400" />;
  return <Minus size={11} className="text-zinc-500" />;
};

export function TopRepeatedTopics({ topics }: TopRepeatedTopicsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">🏆 Top Repeated Topics</h2>
      <div className="space-y-2">
        {topics?.map((topic, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 items-center bg-[#0d0d12] border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all group"
          >
            {/* Rank */}
            <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center font-black text-sm ${i < 3 ? `${rankColors[i]} ${rankBg[i]}` : "text-zinc-600 border-zinc-800"}`}>
              {i < 3 ? <Trophy size={14} /> : topic.rank}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#FF9000] transition-colors">{topic.topic}</h4>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">{topic.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-[#FF9000]">{topic.probability}%</div>
                  <div className="text-[9px] text-zinc-600 font-mono">Probability</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                  <Flame size={10} className="text-[#FF9000]" /> {topic.timesAsked}× asked
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                  <Calendar size={10} /> {topic.yearsAppeared?.join(", ")}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                  <TrendIcon trend={topic.trend} /> {topic.trend}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">[{topic.expectedMarks} marks]</span>
              </div>

              {/* Probability bar */}
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.probability}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 + 0.3 }}
                  className="h-full bg-gradient-to-r from-[#FF9000] to-amber-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
