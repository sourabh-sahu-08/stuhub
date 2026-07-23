import { motion } from "framer-motion";
import { Sparkles, Brain, Clock, Shield, FileStack, TrendingUp } from "lucide-react";

interface AnalysisHeroProps {
  meta: {
    subject: string;
    branch: string;
    semester: number;
    totalPapers: number;
    overallDifficulty: string;
    confidenceScore: number;
    estimatedStudyHours: number;
    theoryVsNumerical: { theory: number; numerical: number };
  };
  generatedAt: string;
}

const difficultyColor = (d: string) => {
  if (d?.toLowerCase().includes("easy")) return "text-emerald-400";
  if (d?.toLowerCase().includes("hard")) return "text-red-400";
  return "text-amber-400";
};

export function AnalysisHero({ meta, generatedAt }: AnalysisHeroProps) {
  const score = meta.confidenceScore ?? 87;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0f14] via-[#111118] to-[#0a0a0f] p-6 sm:p-8 overflow-hidden"
    >
      {/* Animated background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF9000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-purple-500/8 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        {/* Left: Text info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FF9000]/10 border border-[#FF9000]/20 text-[#FF9000] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              <Sparkles size={10} className="animate-pulse" /> AI Exam Intelligence V2
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{meta.subject}</h1>
            <p className="text-sm text-zinc-400 mt-1 font-mono">
              {meta.branch} &nbsp;•&nbsp; Semester {meta.semester} &nbsp;•&nbsp; Generated {generatedAt}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
              <FileStack size={16} className="text-[#FF9000] shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 font-mono">Papers</div>
                <div className="text-lg font-bold text-white">{meta.totalPapers}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
              <Brain size={16} className="text-purple-400 shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 font-mono">Difficulty</div>
                <div className={`text-sm font-bold ${difficultyColor(meta.overallDifficulty)}`}>{meta.overallDifficulty}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
              <Clock size={16} className="text-blue-400 shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 font-mono">Study Hrs</div>
                <div className="text-lg font-bold text-white">{meta.estimatedStudyHours}h</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
              <TrendingUp size={16} className="text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 font-mono">Theory</div>
                <div className="text-lg font-bold text-white">{meta.theoryVsNumerical?.theory ?? 65}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
              <Shield size={16} className="text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 font-mono">Numerical</div>
                <div className="text-lg font-bold text-white">{meta.theoryVsNumerical?.numerical ?? 35}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Confidence gauge */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1f1f27" strokeWidth="10" />
            <motion.circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke="#FF9000"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
              transform="rotate(-90 64 64)"
            />
            <text x="64" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="monospace">{score}%</text>
            <text x="64" y="78" textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">CONFIDENCE</text>
          </svg>
          <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">AI Confidence Score</span>
        </div>
      </div>
    </motion.div>
  );
}
