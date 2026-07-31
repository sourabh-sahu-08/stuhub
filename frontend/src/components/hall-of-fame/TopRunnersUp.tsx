import { motion } from "framer-motion";
import { BookOpen, Star } from "lucide-react";
import type { Contributor } from "./HallOfFameSection";

export function TopRunnersUp({ rank2, rank3, onClick }: { rank2?: Contributor; rank3?: Contributor; onClick: (user: Contributor) => void }) {
  if (!rank2 && !rank3) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16 z-20 relative">
      {rank2 && <RunnerUpCard contributor={rank2} rank={2} onClick={() => onClick(rank2)} />}
      {rank3 && <RunnerUpCard contributor={rank3} rank={3} onClick={() => onClick(rank3)} />}
    </div>
  );
}

function RunnerUpCard({ contributor, rank, onClick }: { contributor: Contributor; rank: number; onClick: () => void }) {
  const level = contributor.gamification?.level || 1;
  const xp = contributor.gamification?.xp || 0;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=111&color=fff&size=150`;

  const isRank2 = rank === 2;
  const badgeColor = isRank2 ? "text-zinc-300 bg-zinc-300/10 border-zinc-300/20" : "text-orange-500 bg-orange-500/10 border-orange-500/20";
  const glowHover = isRank2 ? "hover:shadow-[0_0_40px_rgba(212,212,216,0.15)] hover:border-zinc-300/30" : "hover:shadow-[0_0_40px_rgba(234,88,12,0.15)] hover:border-orange-500/30";
  const ringColor = isRank2 ? "#D4D4D8" : "#EA580C";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: rank * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className={`relative rounded-[24px] cursor-pointer bg-[#111111] border border-white/[0.08] p-6 sm:p-8 flex items-center gap-6 group transition-all duration-300 ${glowHover}`}
    >
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-xs font-bold ${badgeColor}`}>
        {isRank2 ? "🥈 #2" : "🥉 #3"}
      </div>

      <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke={ringColor} 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-[3px] rounded-full overflow-hidden border border-[#111111]">
          <img src={contributor.avatar || fallbackAvatar} alt={contributor.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#111111] text-zinc-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-white/[0.08] z-10">
          Lvl {level}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate group-hover:text-zinc-200 transition-colors">
          {contributor.name}
        </h3>
        <p className="text-xs text-zinc-500 mb-4 truncate">
          {contributor.department?.name}
        </p>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Star className={`w-3.5 h-3.5 ${isRank2 ? 'text-zinc-300' : 'text-orange-500'}`} />
            <span className="text-sm font-semibold text-white">{xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <BookOpen className={`w-3.5 h-3.5 ${isRank2 ? 'text-zinc-300' : 'text-orange-500'}`} />
            <span className="text-sm font-semibold text-white">{contributor.totalContributions || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
