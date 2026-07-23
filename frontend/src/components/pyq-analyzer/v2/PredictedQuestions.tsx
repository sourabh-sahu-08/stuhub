import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Target, Flame, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface PredictedQuestionsProps {
  questions: Array<{
    question: string;
    unit: string;
    marks: number;
    probability: number;
    confidence: string;
    reason: string;
    relatedPastQuestions: string[];
  }>;
}

const confidenceConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Very High": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  "High": { bg: "bg-[#FF9000]/10", text: "text-[#FF9000]", border: "border-[#FF9000]/20", dot: "bg-[#FF9000]" },
  "Medium": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  "Low": { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-700", dot: "bg-zinc-500" },
};

export function PredictedQuestions({ questions }: PredictedQuestionsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  // Sort by probability desc
  const sorted = [...(questions ?? [])].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">AI Predicted Questions</h2>
        <span className="text-[9px] px-2 py-0.5 bg-[#FF9000]/10 text-[#FF9000] border border-[#FF9000]/20 rounded-full font-mono">
          {sorted.length} Predictions
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((pq, i) => {
          const cc = confidenceConfig[pq.confidence] ?? confidenceConfig["Medium"];
          const isOpen = expanded === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#0d0d12] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all"
            >
              <div
                className="p-4 cursor-pointer select-none"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <div className="flex items-start gap-3">
                  {/* Probability circle */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="relative w-12 h-12">
                      <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#1f1f27" strokeWidth="4" />
                        <motion.circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke="#FF9000"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - pq.probability / 100) }}
                          transition={{ duration: 0.8, delay: i * 0.06 + 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-black text-white">{pq.probability}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${cc.bg} ${cc.text} ${cc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cc.dot} animate-pulse`} />
                        {pq.confidence}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono">[{pq.marks} marks]</span>
                      <span className="text-[9px] text-zinc-600 font-mono truncate">→ {pq.unit}</span>
                    </div>

                    <p className="text-sm text-zinc-200 leading-relaxed font-medium">"{pq.question}"</p>
                  </div>

                  <div className="shrink-0 text-zinc-600 mt-1">
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/6 pt-3">
                      <div>
                        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono mb-1.5">Why Predicted?</div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{pq.reason}</p>
                      </div>
                      {pq.relatedPastQuestions?.length > 0 && (
                        <div>
                          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono mb-1.5">Related Past Questions</div>
                          <div className="space-y-1">
                            {pq.relatedPastQuestions.map((rpq, ri) => (
                              <div key={ri} className="flex gap-2 items-start text-xs text-zinc-500">
                                <span className="text-[#FF9000] shrink-0 mt-0.5">›</span>
                                <span>"{rpq}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
