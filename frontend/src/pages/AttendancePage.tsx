import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Edit3,
  RotateCcw,
  Printer,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";

interface Subject {
  id: string;
  name: string;
  baselineAttended: number;
  baselineTotal: number;
  required: number;
}

interface AttendanceLog {
  id: string; // format: "YYYY-MM-DD_subjectId"
  date: string; // YYYY-MM-DD
  subjectId: string;
  status: "attended" | "bunked" | "leave";
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "1", name: "Database Management Systems", baselineAttended: 12, baselineTotal: 16, required: 75 },
  { id: "2", name: "Operating Systems", baselineAttended: 15, baselineTotal: 18, required: 75 },
  { id: "3", name: "Applied AI", baselineAttended: 9, baselineTotal: 15, required: 75 },
  { id: "4", name: "Computer Networks", baselineAttended: 19, baselineTotal: 22, required: 75 }
];

const DEFAULT_LOGS: AttendanceLog[] = [
  { id: "log_1", date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), subjectId: "1", status: "attended" },
  { id: "log_2", date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), subjectId: "2", status: "attended" },
  { id: "log_3", date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10), subjectId: "1", status: "bunked" },
  { id: "log_4", date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10), subjectId: "3", status: "leave" },
  { id: "log_5", date: new Date().toISOString().slice(0, 10), subjectId: "2", status: "attended" },
  { id: "log_6", date: new Date().toISOString().slice(0, 10), subjectId: "4", status: "attended" }
];

export function AttendancePage() {
  const { user } = useAuth();
  
  // Data States
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("stuhub-attendance-subjects-v2");
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [logs, setLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem("stuhub-attendance-logs-v2");
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  // Calendar Navigation States
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Subject Form States
  const [name, setName] = useState("");
  const [baselineAttended, setBaselineAttended] = useState<number | "">("");
  const [baselineTotal, setBaselineTotal] = useState<number | "">("");
  const [required, setRequired] = useState(75);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Simulation State
  const [whatIfActive, setWhatIfActive] = useState(false);

  // Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem("stuhub-attendance-subjects-v2", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("stuhub-attendance-logs-v2", JSON.stringify(logs));
  }, [logs]);

  // Compute computed subjects (baselines + logs)
  const computedSubjects = subjects.map(sub => {
    const subLogs = logs.filter(l => l.subjectId === sub.id);
    const attendedLogs = subLogs.filter(l => l.status === "attended").length;
    const bunkedLogs = subLogs.filter(l => l.status === "bunked").length;
    const leaveLogs = subLogs.filter(l => l.status === "leave").length;

    // What-If Simulation adds 5 classes (attended or bunked depending on current standings)
    const simulatedHeld = whatIfActive ? 5 : 0;
    // Assume simulated classes are attended to check peak potential
    const simulatedAttended = whatIfActive ? 5 : 0;

    const total = sub.baselineTotal + attendedLogs + bunkedLogs + simulatedHeld;
    const attended = sub.baselineAttended + attendedLogs + simulatedAttended;
    const percentage = total > 0 ? (attended / total) * 100 : 0;

    const reqFraction = sub.required / 100;
    let status: "safe" | "warning" | "critical" = "safe";
    if (percentage < sub.required - 5) {
      status = "critical";
    } else if (percentage < sub.required) {
      status = "warning";
    }

    let skip = 0;
    let attend = 0;
    let impossible = false;

    if (reqFraction >= 1) {
      if (attended === total) {
        skip = 0;
        attend = 0;
      } else {
        impossible = true;
      }
    } else {
      if (percentage >= sub.required) {
        skip = Math.floor(attended / reqFraction - total);
      } else {
        attend = Math.ceil((reqFraction * total - attended) / (1 - reqFraction));
      }
    }

    return {
      ...sub,
      attended,
      total,
      percentage,
      status,
      skip,
      attend,
      impossible,
      leaveCount: leaveLogs
    };
  });

  // Calculate Overall Dashboard Metrics
  const totalAttended = computedSubjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = computedSubjects.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;

  const safeSubjectsCount = computedSubjects.filter(s => s.status === "safe").length;
  const criticalSubjectsCount = computedSubjects.filter(s => s.status === "critical").length;
  const warningSubjectsCount = computedSubjects.filter(s => s.status === "warning").length;

  // Bunk Engine metrics
  const totalBuffer = computedSubjects.reduce((sum, s) => sum + (s.status === "safe" ? s.skip : 0), 0);
  const consecutiveSkip = Math.max(0, Math.floor((overallPercentage - 75) / 2));

  // Save Subject
  const handleSaveSubject = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const attVal = baselineAttended === "" ? 0 : Number(baselineAttended);
    const totVal = baselineTotal === "" ? 0 : Number(baselineTotal);

    if (attVal < 0 || totVal < 0) {
      alert("Baseline classes count cannot be negative.");
      return;
    }
    if (totVal < attVal) {
      alert("Baseline total conducted cannot be less than attended classes.");
      return;
    }

    if (editingId) {
      setSubjects(prev =>
        prev.map(sub => (sub.id === editingId ? { ...sub, name, baselineAttended: attVal, baselineTotal: totVal, required } : sub))
      );
      setEditingId(null);
    } else {
      const newSub: Subject = {
        id: Date.now().toString(),
        name,
        baselineAttended: attVal,
        baselineTotal: totVal,
        required
      };
      setSubjects(prev => [...prev, newSub]);
    }

    setName("");
    setBaselineAttended("");
    setBaselineTotal("");
    setIsFormOpen(false);
  };

  // Edit Mode Trigger
  const startEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setBaselineAttended(sub.baselineAttended);
    setBaselineTotal(sub.baselineTotal);
    setRequired(sub.required);
    setIsFormOpen(true);
  };

  // Delete Subject
  const deleteSubject = (id: string) => {
    if (confirm("Delete this subject? This will also remove all its calendar logs.")) {
      setSubjects(prev => prev.filter(sub => sub.id !== id));
      setLogs(prev => prev.filter(log => log.subjectId !== id));
      if (editingId === id) {
        setEditingId(null);
        setName("");
        setBaselineAttended("");
        setBaselineTotal("");
      }
    }
  };

  // Log Bunk Action from card
  const logQuickBunk = (subjectId: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    toggleLogStatus(todayStr, subjectId, "bunked");
  };

  // Add / Modify Calendar Log
  const toggleLogStatus = (dateStr: string, subjectId: string, status: "attended" | "bunked" | "leave") => {
    setLogs(prev => {
      const filtered = prev.filter(l => !(l.date === dateStr && l.subjectId === subjectId));
      const existing = prev.find(l => l.date === dateStr && l.subjectId === subjectId);
      if (existing && existing.status === status) {
        return filtered; // cleared
      }
      const newLog: AttendanceLog = {
        id: `${dateStr}_${subjectId}`,
        date: dateStr,
        subjectId,
        status
      };
      return [...filtered, newLog];
    });
  };

  // Clear log cell
  const clearLog = (dateStr: string, subjectId: string) => {
    setLogs(prev => prev.filter(l => !(l.date === dateStr && l.subjectId === subjectId)));
  };

  // Reset all
  const handleResetData = () => {
    if (confirm("Reset attendance command center? This will restore all baseline subjects and initial calendar logs.")) {
      setSubjects(DEFAULT_SUBJECTS);
      setLogs(DEFAULT_LOGS);
      setEditingId(null);
      setName("");
      setBaselineAttended("");
      setBaselineTotal("");
      setRequired(75);
      setSelectedDateStr(new Date().toISOString().slice(0, 10));
    }
  };

  // Calendar rendering math
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarGrid = [];
  for (let i = firstDayIndex; i > 0; i--) {
    calendarGrid.push({ day: prevMonthDays - i + 1, isCurrentMonth: false, dateString: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarGrid.push({ day: d, isCurrentMonth: true, dateString: dateStr });
  }
  const totalCells = 42;
  const nextMonthPadding = totalCells - calendarGrid.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarGrid.push({ day: i, isCurrentMonth: false, dateString: "" });
  }

  const getLogsForDate = (dateStr: string) => {
    return logs.filter(l => l.date === dateStr);
  };

  // Recharts formats
  const chartData = computedSubjects.map(sub => ({
    name: sub.name.length > 12 ? `${sub.name.slice(0, 12)}...` : sub.name,
    Presence: parseFloat(sub.percentage.toFixed(1))
  }));

  // Circ Gauge properties (283 circumference)
  const offset = 283 - (overallPercentage / 100) * 283;
  let standingColor = "#22C55E";
  let standingLabel = "OPTIMAL";
  if (overallPercentage < 75) {
    standingColor = "#EF4444";
    standingLabel = "CRITICAL";
  } else if (overallPercentage < 80) {
    standingColor = "#F5A524";
    standingLabel = "CAUTION";
  }

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, footer, button, form, .no-print, .actions-cell {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 no-print border-b border-outline pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded border border-outline bg-surface-container text-zinc-50 transition hover:bg-surface-container-high"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display-lg text-2xl sm:text-3xl font-extrabold text-white">Smart Attendance Matrix</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Simulation Toggle Switch */}
          <div className="flex items-center gap-2 bg-surface-container border border-outline px-3 py-1.5 rounded">
            <Sliders size={14} className="text-primary" />
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase">Simulation (+5 classes)</span>
            <input
              type="checkbox"
              id="whatIfToggle"
              checked={whatIfActive}
              onChange={(e) => setWhatIfActive(e.target.checked)}
              className="w-8 h-4 rounded-full bg-[#27272D] border-none text-primary cursor-pointer focus:ring-0 focus:outline-none"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-9 px-4 rounded bg-surface-container border border-outline text-zinc-50 hover:bg-surface-container-high text-xs font-semibold font-mono"
          >
            <Printer size={14} /> PDF AUDIT
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 h-9 px-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-semibold font-mono"
          >
            <RotateCcw size={14} /> RESET
          </button>
        </div>
      </div>

      {/* Attendance logger calendars section */}
      <div className="grid gap-6 md:grid-cols-3 no-print">
        {/* Calendar picker matrix */}
        <div className="panel p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <CalendarIcon className="text-primary" size={16} /> Attendance logger calendar
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="h-7 w-7 rounded border border-outline bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-white min-w-[100px] text-center font-mono">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="h-7 w-7 rounded border border-outline bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-1 font-mono">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarGrid.map((cell, idx) => {
              const hasLogs = cell.dateString ? getLogsForDate(cell.dateString) : [];
              const isSelected = cell.dateString === selectedDateStr;
              
              return (
                <button
                  key={idx}
                  disabled={!cell.isCurrentMonth}
                  onClick={() => cell.dateString && setSelectedDateStr(cell.dateString)}
                  className={`relative min-h-[38px] sm:min-h-[48px] p-1 rounded border flex flex-col items-center justify-between text-[10px] transition-all cursor-pointer ${
                    !cell.isCurrentMonth
                      ? "border-transparent bg-transparent text-zinc-800"
                      : isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-outline bg-surface-container/40 text-on-surface hover:border-[#808080]"
                  }`}
                >
                  <span className="font-bold font-mono self-start">{cell.day}</span>
                  
                  {/* Status dots */}
                  {hasLogs.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 w-full max-w-[28px] overflow-hidden">
                      {hasLogs.slice(0, 3).map((log, index) => (
                        <span
                          key={index}
                          className={`h-1 w-1 rounded-full ${
                            log.status === "attended"
                              ? "bg-emerald-500"
                              : log.status === "bunked"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Log Selector */}
        <div className="panel p-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Day Logger Panel</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-1">
              {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Select date"}
            </h3>
          </div>

          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
            {computedSubjects.map(sub => {
              const dayLog = logs.find(l => l.date === selectedDateStr && l.subjectId === sub.id);
              
              return (
                <div key={sub.id} className="border-b border-outline pb-3 space-y-2 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{sub.name}</p>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "attended")}
                      className={`flex-1 h-7 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                        dayLog?.status === "attended"
                          ? "bg-emerald-500 text-black"
                          : "bg-surface-container border border-outline text-zinc-400 hover:text-white"
                      }`}
                    >
                      Attended
                    </button>
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "bunked")}
                      className={`flex-1 h-7 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                        dayLog?.status === "bunked"
                          ? "bg-red-500 text-white"
                          : "bg-surface-container border border-outline text-zinc-400 hover:text-white"
                      }`}
                    >
                      Bunked
                    </button>
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "leave")}
                      className={`flex-1 h-7 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                        dayLog?.status === "leave"
                          ? "bg-amber-500 text-black"
                          : "bg-surface-container border border-outline text-zinc-400 hover:text-white"
                      }`}
                    >
                      Leave
                    </button>
                    {dayLog && (
                      <button
                        onClick={() => clearLog(selectedDateStr, sub.id)}
                        className="h-7 w-7 rounded bg-surface-container border border-outline flex items-center justify-center text-xs text-zinc-400 hover:text-red-500 transition cursor-pointer"
                        title="Clear log"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded bg-surface-container border border-outline p-3 text-[10px] text-on-surface-variant flex items-start gap-2">
            <Info size={14} className="shrink-0 text-primary mt-0.5" />
            <span className="leading-relaxed">Attended increments present & held. Bunked increments held only. Leave has no math impact.</span>
          </div>
        </div>
      </div>

      {/* Overview Cards (Gauge + Bunk engine + Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-full-width">
        {/* Gauge circle card */}
        <div className="col-span-12 lg:col-span-4 panel p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="#16161A" strokeWidth="8"></circle>
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="45"
                stroke={standingColor}
                strokeDasharray="283"
                strokeDashoffset={offset}
                strokeLinecap="square"
                strokeWidth="8"
                className="transition-all duration-700"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white leading-none">{overallPercentage.toFixed(1)}%</span>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider mt-1">Aggregate</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Academic Status: <span style={{ color: standingColor }} className="font-bold">{standingLabel}</span>
            </p>
            <p className="text-xs text-on-surface-variant max-w-[240px]">
              You are {Math.abs(overallPercentage - 75).toFixed(1)}% {overallPercentage >= 75 ? "above" : "below"} the mandatory criteria.
            </p>
          </div>
        </div>

        {/* Bunk engine cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="panel p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">calculate</span>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Bunk Probability Engine</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-[#0d0d0d] rounded border border-outline">
                <p className="text-[10px] text-on-surface-variant font-mono uppercase">Safe to Skip</p>
                <p className="text-3xl font-extrabold text-primary mt-1 font-mono">{String(consecutiveSkip).padStart(2, "0")}</p>
                <p className="text-[9px] text-zinc-400 mt-1 leading-snug">Consecutive classes possible before criteria check</p>
              </div>
              <div className="p-3 bg-[#0d0d0d] rounded border border-outline">
                <p className="text-[10px] text-on-surface-variant font-mono uppercase">Buffer Count</p>
                <p className="text-3xl font-extrabold text-white mt-1 font-mono">{String(totalBuffer).padStart(2, "0")}</p>
                <p className="text-[9px] text-zinc-400 mt-1 leading-snug">Total leeway buffer remaining across modules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Temporal bar chart */}
        <div className="col-span-12 lg:col-span-4 panel p-5 flex flex-col h-[260px] no-print">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Subject Presence Check</h4>
            </div>
            <span className="px-2 py-0.5 bg-surface-container border border-outline rounded font-mono text-[9px] text-on-surface-variant">CSE</span>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid stroke="#27272D" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#A1A1AA" tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis stroke="#A1A1AA" tickLine={false} tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#16161A", borderColor: "#27272D", color: "#e2e2e2" }}
                  itemStyle={{ color: "#FFA31A" }}
                />
                <Bar dataKey="Presence" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.Presence >= 75 ? "#F5A524" : "#EF4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Module breakdown title */}
      <div className="pt-2 flex items-center gap-md">
        <div className="h-[1px] flex-1 bg-[#27272D]"></div>
        <h4 className="font-label-md text-xs text-zinc-400 uppercase tracking-[0.3em] font-mono">Module-Specific Breakdown</h4>
        <div className="h-[1px] flex-1 bg-[#27272D]"></div>
      </div>

      {/* Subject cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {computedSubjects.map(sub => {
          const isDanger = sub.percentage < sub.required;
          const statusBg = isDanger ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
          const barColor = isDanger ? "bg-red-500" : "bg-primary";

          return (
            <div key={sub.id} className="panel p-5 flex flex-col justify-between transform transition-all hover:border-[#808080]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h5 className="font-headline-md text-base font-bold text-white truncate">{sub.name}</h5>
                    <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">ID: SUB-{sub.id.slice(-4)}</p>
                  </div>
                  <div className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${statusBg}`}>
                    {isDanger ? "Warning" : "Safe"}
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-extrabold text-white">{Math.round(sub.percentage)}%</span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {sub.attended}/{sub.total} Held
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-background border border-outline overflow-hidden mb-4">
                  <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, sub.percentage)}%` }} />
                </div>

                {isDanger && (
                  <p className="text-[10px] text-red-500 mb-4 flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-xs">priority_high</span>
                    Attendance below {sub.required}% target
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-3 pt-3 border-t border-outline no-print">
                <button
                  onClick={() => logQuickBunk(sub.id)}
                  className="flex-1 py-1.5 bg-surface-container border border-outline text-white font-mono text-[10px] font-bold hover:bg-primary hover:text-black transition-all cursor-pointer"
                >
                  LOG BUNK
                </button>
                <button
                  onClick={() => startEdit(sub)}
                  className="p-1.5 bg-surface-container border border-outline text-zinc-400 hover:text-white rounded cursor-pointer"
                  title="Configure"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  className="p-1.5 bg-surface-container border border-outline text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Configure module card */}
        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setBaselineAttended("");
            setBaselineTotal("");
            setIsFormOpen(true);
          }}
          className="panel border-dashed border-2 p-6 flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container/50 transition-all cursor-pointer min-h-[180px] no-print"
        >
          <span className="material-symbols-outlined text-[40px] mb-2 text-primary">add_circle</span>
          <span className="text-xs uppercase font-bold tracking-wider font-mono">Configure New Module</span>
        </button>
      </div>



      {/* Dynamic subject creation / editing form modal overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm select-none no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded border border-outline bg-surface text-zinc-200 space-y-5 shadow-lg"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  {editingId ? "Configure Subject Details" : "Add Course Subject"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-on-surface-variant hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-mono">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Database Systems"
                    className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-mono">Baseline Attended *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={baselineAttended}
                      onChange={(e) => setBaselineAttended(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 12"
                      className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-mono">Baseline Conducted *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={baselineTotal}
                      onChange={(e) => setBaselineTotal(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 16"
                      className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">Required Attendance *</label>
                    <span className="text-xs font-bold text-primary font-mono">{required}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={5}
                    value={required}
                    onChange={(e) => setRequired(Number(e.target.value))}
                    className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 h-10 rounded border border-outline text-zinc-50 text-xs font-bold uppercase tracking-wider font-mono hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded bg-primary text-black text-xs font-bold uppercase tracking-wider font-mono hover:opacity-90 cursor-pointer"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
