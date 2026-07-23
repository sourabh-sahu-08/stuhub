import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, Sigma } from "lucide-react";

interface FormulaSheetProps {
  formulas: Array<{
    formula: string;
    meaning: string;
    usage: string;
    unit: string;
    importance: string;
  }>;
  numericals: Array<{
    topic: string;
    unit: string;
    timesAsked: number;
    difficulty: string;
    probability: number;
    formulaHint: string;
    studyTip: string;
  }>;
}

const importanceColor: Record<string, string> = {
  "Critical": "text-red-400 border-red-500/20 bg-red-500/8",
  "High": "text-[#FF9000] border-[#FF9000]/20 bg-[#FF9000]/8",
  "Medium": "text-yellow-400 border-yellow-500/20 bg-yellow-500/8",
  "Low": "text-zinc-500 border-zinc-700 bg-zinc-800/30",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-600 hover:text-zinc-300 transition-colors" title="Copy formula">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

export function FormulaSheet({ formulas, numericals }: FormulaSheetProps) {
  return (
    <div className="space-y-8">
      {/* Formula Sheet */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">📐 Formula Sheet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formulas?.map((f, i) => {
            const ic = importanceColor[f.importance] ?? importanceColor["Medium"];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${ic}`}>{f.importance}</span>
                  <CopyButton text={f.formula} />
                </div>

                {/* Formula */}
                <div className="bg-black/30 rounded-lg border border-white/5 px-4 py-3 mb-3 font-mono text-[#FF9000] text-sm text-center">
                  {f.formula}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-300 font-medium">{f.meaning}</p>
                  <p className="text-[10px] text-zinc-600">{f.usage}</p>
                  <p className="text-[9px] text-zinc-700 font-mono">→ {f.unit}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Numericals */}
      {numericals?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">🔢 Important Numericals</h2>
          <div className="space-y-3">
            {numericals.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 hover:border-[#FF9000]/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-[#FF9000]/10 border border-[#FF9000]/20 rounded-lg flex items-center justify-center">
                    <Sigma size={14} className="text-[#FF9000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-white text-sm">{n.topic}</h4>
                      <span className="text-xs font-bold text-emerald-400 shrink-0">{n.probability}%</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{n.unit} • Asked {n.timesAsked}× • {n.difficulty}</p>
                    {n.formulaHint && (
                      <div className="mt-2 flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5 border border-white/5">
                        <span className="text-[9px] text-zinc-600 font-mono shrink-0">Hint:</span>
                        <span className="text-xs text-zinc-400 font-mono">{n.formulaHint}</span>
                      </div>
                    )}
                    {n.studyTip && <p className="text-[10px] text-zinc-500 mt-1.5 italic">💡 {n.studyTip}</p>}
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
