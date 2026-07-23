import { motion } from "framer-motion";
import { BookOpen, Flame } from "lucide-react";

interface DefinitionBankProps {
  definitions: Array<{
    term: string;
    definition: string;
    unit: string;
    probability: number;
    timesAsked: number;
  }>;
}

export function DefinitionBank({ definitions }: DefinitionBankProps) {
  const sorted = [...(definitions ?? [])].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">📚 Definition Bank</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((def, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={13} className="text-[#FF9000] shrink-0" />
                <h4 className="font-bold text-white text-sm">{def.term}</h4>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 rounded shrink-0">
                <Flame size={9} /> {def.probability}%
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-2">"{def.definition}"</p>
            <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-mono">
              <span>{def.unit}</span>
              {def.timesAsked > 0 && <span>• Asked {def.timesAsked}×</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
