import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AISummaryProps {
  summary: string;
  importantTopics: string[];
}

export function AISummary({ summary, importantTopics }: AISummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#111118] via-[#0f0f14] to-[#0d0d12] border border-[#FF9000]/15 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#FF9000]/10 border border-[#FF9000]/20 flex items-center justify-center">
          <Brain size={14} className="text-[#FF9000]" />
        </div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">AI Analysis Summary</h2>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed font-medium border-l-2 border-[#FF9000]/40 pl-4">
        {summary}
      </p>

      {importantTopics?.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono mb-2">Key Topics to Focus On</div>
          <div className="flex flex-wrap gap-2">
            {importantTopics.map((t, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 bg-[#FF9000]/8 border border-[#FF9000]/15 text-[#FF9000] rounded-full font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
