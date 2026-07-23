import { motion } from "framer-motion";
import { TrendingUp, Star, Repeat, AlertTriangle, SkipForward, Clock, Zap } from "lucide-react";

interface SmartInsightsProps {
  insights: Array<{
    badge: string;
    title: string;
    description: string;
    unit: string;
    icon: string;
  }>;
}

const badgeConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  "High ROI": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: <TrendingUp size={11} /> },
  "Easy Marks": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <Star size={11} /> },
  "Most Repeated": { bg: "bg-[#FF9000]/10", text: "text-[#FF9000]", border: "border-[#FF9000]/20", icon: <Repeat size={11} /> },
  "Very Important": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: <AlertTriangle size={11} /> },
  "Never Skip": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: <Zap size={11} /> },
  "Rarely Asked": { bg: "bg-zinc-800/50", text: "text-zinc-500", border: "border-zinc-700", icon: <SkipForward size={11} /> },
  "Last Minute Friendly": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", icon: <Clock size={11} /> },
};

const defaultBadge = { bg: "bg-zinc-800/50", text: "text-zinc-400", border: "border-zinc-700", icon: <Star size={11} /> };

export function SmartInsights({ insights }: SmartInsightsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">⚡ Smart Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights?.map((insight, i) => {
          const bc = badgeConfig[insight.badge] ?? defaultBadge;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all cursor-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}>
                  {bc.icon} {insight.badge}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm mb-1">{insight.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{insight.description}</p>
              {insight.unit && <p className="text-[9px] text-zinc-700 font-mono mt-2">→ {insight.unit}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
