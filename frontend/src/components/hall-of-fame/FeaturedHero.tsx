import { motion } from "framer-motion";
import { Crown, BookOpen, Star, Sparkles } from "lucide-react";
import type { Contributor } from "./HallOfFameSection";

export function FeaturedHero({ contributor, onClick }: { contributor: Contributor; onClick: () => void }) {
  if (!contributor) return null;

  const level = contributor.gamification?.level || 1;
  const xp = contributor.gamification?.xp || 0;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=111&color=fff&size=200`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, type: "spring", stiffness: 80, damping: 20 }}
      className="w-full max-w-4xl mx-auto mb-16 z-20"
      onClick={onClick}
    >
      <motion.div 
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full rounded-[32px] cursor-pointer bg-[#0c0c0c] border border-amber-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 group transition-all duration-300 hover:border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.05)] hover:shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden"
      >

        {/* Badge */}
        <div className="static md:absolute md:top-6 md:right-6 z-10 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm font-bold flex items-center justify-center gap-2 mb-6 md:mb-0 w-max mx-auto md:mx-0">
          🥇 #1 Contributor
        </div>

        {/* Left Column: Avatar */}
        <div className="relative shrink-0 z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
              <motion.circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="2" 
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 300" }}
                whileInView={{ strokeDasharray: "300 300" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-[4px] rounded-full overflow-hidden border border-[#111111]">
              <img src={contributor.avatar || fallbackAvatar} alt={contributor.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 mt-6 md:mt-0">
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 mb-3">
            <Sparkles size={12} /> Hall of Fame MVP
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight group-hover:text-amber-500 transition-colors">
            {contributor.name}
          </h3>
          <p className="text-sm md:text-base text-zinc-400 mb-6">
            {contributor.department?.name} {contributor.branch ? `• ${contributor.branch}` : ''}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <Star className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xl font-bold text-white leading-none mb-1">Lv {level}</div>
                <div className="text-xs text-zinc-500 font-medium tracking-wide">{xp.toLocaleString()} XP</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xl font-bold text-white leading-none mb-1">{contributor.totalContributions || 0}</div>
                <div className="text-xs text-zinc-500 font-medium tracking-wide">UPLOADS</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
