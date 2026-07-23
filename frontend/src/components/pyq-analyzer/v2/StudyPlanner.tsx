import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, CheckSquare, Square, Clock, MoonStar, Sun } from "lucide-react";

interface StudyPlannerProps {
  studyPlan: {
    totalDays: number;
    dailySchedule: Array<{
      day: number;
      focus: string;
      hours: number;
      tasks: string[];
      priority: string;
    }>;
    oneNightStrategy: {
      fourHours: string;
      twoHours: string;
      oneHour: string;
      thirtyMinutes: string;
    };
  };
  studyStrategy: Array<{ step: number; title: string; description: string }>;
}

const priorityDot: Record<string, string> = {
  "High": "bg-red-400",
  "Medium": "bg-amber-400",
  "Low": "bg-emerald-400",
};

export function StudyPlanner({ studyPlan, studyStrategy }: StudyPlannerProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setChecked(prev => ({ ...prev, [k]: !prev[k] }));

  const nightSlots = [
    { time: "4 Hours", content: studyPlan?.oneNightStrategy?.fourHours, icon: "🔥" },
    { time: "2 Hours", content: studyPlan?.oneNightStrategy?.twoHours, icon: "⚡" },
    { time: "1 Hour", content: studyPlan?.oneNightStrategy?.oneHour, icon: "📝" },
    { time: "30 Mins", content: studyPlan?.oneNightStrategy?.thirtyMinutes, icon: "⏱️" },
  ];

  return (
    <div className="space-y-8">
      {/* Study Strategy */}
      {studyStrategy?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Optimal Study Strategy</h2>
          <div className="space-y-3">
            {studyStrategy.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#FF9000]/10 border border-[#FF9000]/20 text-[#FF9000] flex items-center justify-center text-sm font-black font-mono">
                    {s.step}
                  </div>
                  {i < studyStrategy.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-[#FF9000]/20 to-transparent mt-1 min-h-[20px]" />}
                </div>
                <div className="pb-4">
                  <h4 className="font-bold text-white text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* One Night Strategy */}
      {studyPlan?.oneNightStrategy && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <MoonStar size={12} /> One Night Strategy
          </h2>
          <div className="space-y-2">
            {nightSlots.map((slot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 items-start bg-[#0d0d12] border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all"
              >
                <div className="shrink-0 text-lg">{slot.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={11} className="text-[#FF9000]" />
                    <span className="text-xs font-bold text-[#FF9000] font-mono">{slot.time}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{slot.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Daily schedule */}
      {studyPlan?.dailySchedule?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <Calendar size={12} /> {studyPlan.totalDays}-Day Study Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studyPlan.dailySchedule.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#FF9000]/10 border border-[#FF9000]/20 rounded-lg flex items-center justify-center text-[#FF9000] text-xs font-black">{day.day}</div>
                    <h4 className="font-bold text-white text-sm">{day.focus}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[day.priority] ?? "bg-zinc-600"}`} />
                    <span className="text-[10px] text-zinc-500 font-mono">{day.hours}h</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {day.tasks?.map((task, ti) => {
                    const k = `d${day.day}-t${ti}`;
                    return (
                      <div
                        key={ti}
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => toggle(k)}
                      >
                        {checked[k]
                          ? <CheckSquare size={13} className="text-emerald-400 shrink-0" />
                          : <Square size={13} className="text-zinc-700 shrink-0 group-hover:text-zinc-400 transition-colors" />
                        }
                        <span className={`text-xs transition-all ${checked[k] ? "line-through text-zinc-600" : "text-zinc-400"}`}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
