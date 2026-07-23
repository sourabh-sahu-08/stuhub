import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface UnitCardsProps {
  units: Array<{
    name: string;
    weightage: number;
    importanceScore: number;
    difficulty: string;
    preparationHours: number;
    riskLevel: string;
    priority: string;
    description: string;
    importantConcepts: string[];
    trend: string;
    expectedMarks: number;
    repeatedTopics: string[];
    mostAskedQuestions: Array<{ question: string; timesAsked: number; marks: number; difficulty: string; lastAskedYear: string }>;
    canSkip: boolean;
    skipReason: string;
  }>;
}

const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
  "Must Study": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  "High Priority": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  "Medium Priority": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  "Low Priority": { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30" },
  "Can Skip": { bg: "bg-zinc-800/50", text: "text-zinc-600", border: "border-zinc-700/30" },
};

const difficultyColor = (d: string) => {
  const l = d?.toLowerCase() ?? "";
  if (l.includes("easy")) return "text-emerald-400";
  if (l.includes("hard")) return "text-red-400";
  return "text-amber-400";
};

const TrendIcon = ({ trend }: { trend: string }) => {
  const t = trend?.toLowerCase() ?? "";
  if (t === "increasing") return <TrendingUp size={12} className="text-emerald-400" />;
  if (t === "declining") return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-zinc-400" />;
};

export function UnitCards({ units }: UnitCardsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Unit Intelligence</h2>
      <div className="grid grid-cols-1 gap-4">
        {units?.map((unit, i) => {
          const pc = priorityConfig[unit.priority] ?? priorityConfig["Medium Priority"];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative bg-[#0d0d12] border border-white/8 rounded-2xl overflow-hidden group hover:border-[#FF9000]/30 transition-all duration-300"
            >
              {/* Top weightage bar */}
              <div className="h-1 bg-[#1a1a22]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unit.weightage}%` }}
                  transition={{ duration: 1, delay: i * 0.07 + 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#FF9000] to-amber-500"
                />
              </div>

              <div className="p-5">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base">{unit.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${pc.bg} ${pc.text} ${pc.border}`}>
                        {unit.priority}
                      </span>
                      {unit.canSkip && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
                          Skippable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">{unit.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#FF9000]">{unit.weightage}%</div>
                      <div className="text-[9px] text-zinc-600 font-mono uppercase">Weightage</div>
                    </div>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Importance</div>
                    <div className="text-base font-bold text-white">{unit.importanceScore}<span className="text-zinc-600 text-xs">/10</span></div>
                  </div>
                  <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Difficulty</div>
                    <div className={`text-sm font-bold ${difficultyColor(unit.difficulty)}`}>{unit.difficulty}</div>
                  </div>
                  <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Est. Marks</div>
                    <div className="text-base font-bold text-white">{unit.expectedMarks}</div>
                  </div>
                  <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Prep Hours</div>
                    <div className="text-base font-bold text-white">{unit.preparationHours}h</div>
                  </div>
                </div>

                {/* Trend + concepts row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={unit.trend} />
                    <span className="text-xs text-zinc-400 font-mono">{unit.trend} Trend</span>
                  </div>
                  {unit.importantConcepts?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {unit.importantConcepts.map((c, ci) => (
                        <span key={ci} className="text-[9px] px-2 py-0.5 rounded bg-[#FF9000]/8 border border-[#FF9000]/15 text-[#FF9000] font-mono uppercase tracking-wider">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Most Asked Questions */}
                {unit.mostAskedQuestions?.length > 0 && (
                  <div className="border-t border-white/6 pt-4 space-y-2">
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono mb-3">🔥 Most Asked Questions in This Unit</div>
                    {unit.mostAskedQuestions.map((mq, qi) => (
                      <div key={qi} className="flex gap-3 items-start bg-white/2 rounded-lg p-3 border border-white/5 hover:border-[#FF9000]/20 transition-colors">
                        <span className="bg-[#FF9000]/15 text-[#FF9000] text-[9px] px-2 py-1 rounded font-mono whitespace-nowrap shrink-0 border border-[#FF9000]/20 font-bold">
                          {mq.timesAsked}× ASKED
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200 leading-relaxed">"{mq.question}"</p>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-[9px] text-zinc-600 font-mono">[{mq.marks} marks]</span>
                            <span className={`text-[9px] font-mono ${difficultyColor(mq.difficulty)}`}>{mq.difficulty}</span>
                            {mq.lastAskedYear && <span className="text-[9px] text-zinc-600 font-mono">Last: {mq.lastAskedYear}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
