import { motion } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import type { Contributor } from "./HallOfFameSection";

export function ContributorList({ contributors, startRank, onUserClick }: { contributors: Contributor[], startRank: number, onUserClick: (user: Contributor) => void }) {
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contributors.map((contributor, idx) => {
        const rank = startRank + idx;
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=111&color=fff`;
        const level = contributor.gamification?.level || 1;
        const xp = contributor.gamification?.xp || 0;

        return (
          <motion.div
            key={contributor._id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => onUserClick(contributor)}
            className="group relative bg-[#111111] border border-white/[0.08] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] rounded-[22px] p-5 cursor-pointer transition-all duration-300 overflow-hidden"
          >
            {/* Minimal Rank Indicator */}
            <div className="absolute top-5 right-5 text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors pointer-events-none select-none">
              #{rank}
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <img 
                  src={contributor.avatar || fallbackAvatar} 
                  alt={contributor.name} 
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
                  className="w-12 h-12 rounded-full object-cover border border-white/[0.08] group-hover:border-zinc-500 transition-colors"
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#111111] text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/[0.08]">
                  Lvl {level}
                </div>
              </div>

              <div className="min-w-0 flex-1 pr-4">
                <h4 className="text-white font-medium text-base truncate group-hover:text-zinc-100 transition-colors">
                  {contributor.name}
                </h4>
                {contributor.department && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {contributor.department.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/[0.04] relative z-10">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">{xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">{contributor.totalContributions || 0}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
