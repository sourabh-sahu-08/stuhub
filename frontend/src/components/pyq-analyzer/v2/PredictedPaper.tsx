import { motion } from "framer-motion";
import { FileText, Flame } from "lucide-react";

interface PredictedPaperProps {
  sections: Array<{
    sectionName: string;
    instructions: string;
    totalMarks?: number;
    questions: Array<{
      qNo?: string;
      question: string;
      unit: string;
      marks: number;
      probability: number;
      difficulty?: string;
    }>;
  }>;
  subject: string;
  branch: string;
  semester: number;
}

const diffColor = (d?: string) => {
  const l = (d ?? "").toLowerCase();
  if (l.includes("easy")) return "text-emerald-400";
  if (l.includes("hard")) return "text-red-400";
  return "text-amber-400";
};

export function PredictedPaper({ sections, subject, branch, semester }: PredictedPaperProps) {
  const totalMarks = sections?.reduce((sum, s) => sum + (s.totalMarks ?? s.questions.reduce((qs, q) => qs + q.marks, 0)), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">AI Predicted Mock Exam Paper</h2>

      {/* Paper header */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] overflow-hidden">
        <div className="bg-gradient-to-r from-[#111118] to-[#0d0d12] border-b border-white/8 p-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#FF9000] mb-2">
            <FileText size={16} />
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest">AI Generated Predicted Paper</span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wide">{subject}</h3>
          <p className="text-xs text-zinc-500 font-mono">{branch} &nbsp;|&nbsp; Semester {semester}</p>
          <p className="text-xs text-zinc-600 font-mono">Total Marks: {totalMarks} &nbsp;|&nbsp; Time: 3 Hours</p>
          <p className="text-[10px] text-zinc-700 font-mono italic">
            Note: This is an AI-predicted paper based on historical PYQ analysis. Actual paper may vary.
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {sections?.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: si * 0.1 }}
              className="space-y-4"
            >
              {/* Section header */}
              <div className="border-b border-white/8 pb-3 text-center">
                <h4 className="font-black text-[#FF9000] text-base uppercase tracking-wider">{section.sectionName}</h4>
                {section.instructions && <p className="text-xs text-zinc-500 italic mt-1">{section.instructions}</p>}
                {section.totalMarks && <p className="text-[10px] text-zinc-600 font-mono mt-1">[{section.totalMarks} Marks]</p>}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {section.questions?.map((q, qi) => (
                  <div key={qi} className="flex gap-4 group hover:bg-white/2 rounded-lg p-2 -mx-2 transition-colors">
                    <div className="shrink-0 pt-0.5">
                      <span className="text-sm font-bold text-zinc-600 font-mono w-8 inline-block text-right">
                        {q.qNo ?? `Q${qi + 1}`}.
                      </span>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium">{q.question}</p>
                        <span className="shrink-0 text-xs font-bold text-zinc-600 font-mono whitespace-nowrap">
                          [{q.marks} Marks]
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/8 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/15 text-[9px] font-bold">
                          <Flame size={9} /> {q.probability}% Probability
                        </span>
                        <span className={`text-[9px] font-mono ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                        <span className="text-[9px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">→ {q.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
