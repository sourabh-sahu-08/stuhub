import { motion } from "framer-motion";
import { Star, Crown, BookOpen } from "lucide-react";
import type { Contributor } from "./HallOfFameSection";

export function TopContributorCard({ contributor, rank }: { contributor: Contributor, rank: number }) {
  const isRank1 = rank === 1;
  const level = contributor.gamification?.level || 1;
  const xp = contributor.gamification?.xp || 0;
  
  // Progress to next level (0-100%)
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const progressPercent = Math.min(100, Math.max(0, ((xp - xpForCurrentLevel) / 100) * 100));

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=111&color=fff`;

  // Rank-specific styling
  const badgeColors = {
    1: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    2: "bg-zinc-300/10 text-zinc-300 border-zinc-300/20",
    3: "bg-orange-600/10 text-orange-500 border-orange-600/20"
  };

  const glowColors = {
    1: "shadow-[0_0_40px_rgba(245,158,11,0.06)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] group-hover:border-amber-500/30",
    2: "group-hover:shadow-[0_0_30px_rgba(212,212,216,0.15)] group-hover:border-zinc-300/30",
    3: "group-hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group-hover:border-orange-500/30"
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative w-full rounded-[24px] cursor-pointer bg-[#111111] border border-white/[0.08] p-6 sm:p-8 flex flex-col items-center group transition-all duration-500 ${glowColors[rank as 1|2|3]}`}
    >
      {/* Animated Sweep effect for Rank 1 */}
      {isRank1 && (
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-20deg] pointer-events-none"
        />
      )}
      {/* Rank Badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 z-10 ${badgeColors[rank as 1|2|3]}`}>
        {rank === 1 && "🥇 #1"}
        {rank === 2 && "🥈 #2"}
        {rank === 3 && "🥉 #3"}
      </div>

      {isRank1 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
            <Crown size={12} /> Top Contributor
          </div>
        </div>
      )}

      {/* Avatar with Animated SVG Ring */}
      <div className={`relative ${isRank1 ? 'w-28 h-28 mt-8 mb-6' : 'w-20 h-20 mb-4'}`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <motion.circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke={rank === 1 ? "#F59E0B" : rank === 2 ? "#D4D4D8" : "#EA580C"} 
            strokeWidth="2" 
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 300" }}
            animate={{ strokeDasharray: `${(progressPercent / 100) * 301.59} 301.59` }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          />
        </svg>
        
        <img 
          src={contributor.avatar || fallbackAvatar} 
          alt={contributor.name}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
          className="absolute inset-0 m-auto rounded-full object-cover"
          style={{ width: isRank1 ? '104px' : '72px', height: isRank1 ? '104px' : '72px' }}
        />
        
        <div className="absolute -bottom-2 -right-2 bg-[#111111] border border-white/10 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-lg">
          Lvl {level}
        </div>
      </div>

      <h3 className={`${isRank1 ? 'text-2xl' : 'text-xl'} font-semibold text-white mb-1.5 truncate w-full text-center tracking-tight`}>
        {contributor.name}
      </h3>
      
      {contributor.department && (
        <div className="px-2.5 py-1 bg-white/5 rounded-md text-xs text-zinc-400 font-medium mb-6">
          {contributor.department.code}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full mt-auto">
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <Star className="w-3.5 h-3.5 text-zinc-400 mb-1" />
          <span className="text-sm font-semibold text-white">{xp}</span>
          <span className="text-[10px] text-zinc-500 font-medium tracking-wide">XP</span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <BookOpen className="w-3.5 h-3.5 text-zinc-400 mb-1" />
          <span className="text-sm font-semibold text-white">{contributor.totalContributions || 0}</span>
          <span className="text-[10px] text-zinc-500 font-medium tracking-wide">UPLOADS</span>
        </div>
      </div>

    </motion.div>
  );
}
