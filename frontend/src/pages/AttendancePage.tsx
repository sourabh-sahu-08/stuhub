import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Plus,
  RotateCcw,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  UserCheck
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
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

  // Search/Sort/Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"lowest" | "highest" | "none">("none");
  const [filterCritical, setFilterCritical] = useState(false);

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

    const total = sub.baselineTotal + attendedLogs + bunkedLogs;
    const attended = sub.baselineAttended + attendedLogs;
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

  // Smart Recommendations
  const getSmartRecommendations = () => {
    const recs: string[] = [];
    if (subjects.length === 0) {
      return ["Add your course subjects below to start logging and tracking attendance!"];
    }

    if (overallPercentage < 75) {
      recs.push(`Warning: Your overall attendance is ${overallPercentage.toFixed(1)}% (below criteria). Try to mark upcoming classes as Attended.`);
    }

    computedSubjects.forEach(sub => {
      if (sub.status === "critical" && sub.attend > 0) {
        recs.push(`DBMS Priority: Attend the next ${sub.attend} classes of "${sub.name}" to satisfy your ${sub.required}% target.`);
      } else if (sub.status === "warning" && sub.attend > 0) {
        recs.push(`Standing Warning: You are near the border in "${sub.name}". Attend ${sub.attend} upcoming classes to secure safety.`);
      } else if (sub.status === "safe" && sub.skip === 0) {
        recs.push(`Border alert: Skipping even 1 session of "${sub.name}" will pull you below criteria.`);
      } else if (sub.status === "safe" && sub.skip > 0) {
        recs.push(`Buffer: You have a safe cushion of ${sub.skip} classes in "${sub.name}".`);
      }
    });

    if (criticalSubjectsCount === 0 && warningSubjectsCount === 0) {
      recs.unshift("Excellent standing! All subjects currently meet your requirements. Keep it up!");
    }

    return recs.slice(0, 5);
  };

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
  };

  // Edit Mode Trigger
  const startEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setBaselineAttended(sub.baselineAttended);
    setBaselineTotal(sub.baselineTotal);
    setRequired(sub.required);
  };

  // Delete Subject & associated logs
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

  // Add / Modify Calendar Log
  const toggleLogStatus = (dateStr: string, subjectId: string, status: "attended" | "bunked" | "leave") => {
    setLogs(prev => {
      // Filter out existing log for this date and subject
      const filtered = prev.filter(l => !(l.date === dateStr && l.subjectId === subjectId));
      
      // Check if clicked the same active status (means user wants to clear it)
      const existing = prev.find(l => l.date === dateStr && l.subjectId === subjectId);
      if (existing && existing.status === status) {
        return filtered; // cleared
      }

      // Add updated status log
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

  // Filter/Sort logic
  const processedSubjects = computedSubjects
    .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(sub => !filterCritical || sub.status === "critical")
    .sort((a, b) => {
      if (sortBy === "lowest") return a.percentage - b.percentage;
      if (sortBy === "highest") return b.percentage - a.percentage;
      return 0;
    });

  // Calendar Day Rendering Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarGrid = [];

  // Previous Month Days (Padding)
  for (let i = firstDayIndex; i > 0; i--) {
    calendarGrid.push({
      day: prevMonthDays - i + 1,
      isCurrentMonth: false,
      dateString: ""
    });
  }

  // Current Month Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarGrid.push({
      day: d,
      isCurrentMonth: true,
      dateString: dateStr
    });
  }

  // Next Month Days (Padding)
  const totalCells = 42; // 6 rows of 7 days
  const nextMonthPadding = totalCells - calendarGrid.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarGrid.push({
      day: i,
      isCurrentMonth: false,
      dateString: ""
    });
  }

  // Check logs for specific date
  const getLogsForDate = (dateStr: string) => {
    return logs.filter(l => l.date === dateStr);
  };

  // Recharts Chart Formats
  const barChartData = computedSubjects.map(sub => ({
    name: sub.name.length > 15 ? `${sub.name.slice(0, 15)}...` : sub.name,
    "Current Attendance": parseFloat(sub.percentage.toFixed(1)),
    "Required Attendance": sub.required
  }));

  const pieChartData = [
    { name: "Safe", value: safeSubjectsCount, color: "#10b981" },
    { name: "Warning", value: warningSubjectsCount, color: "#f59e0b" },
    { name: "Critical", value: criticalSubjectsCount, color: "#ef4444" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, footer, button, form, .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 shadow-sm"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
              Workspace Dashboard
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Attendance Command Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold shadow-sm transition"
          >
            <Printer size={16} /> Print Audit
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-semibold shadow-sm transition"
          >
            <RotateCcw size={16} /> Reset Data
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Stuhub Student Portal</h1>
        <p className="text-sm text-slate-600 mt-1">Official Student Attendance Audit Report</p>
        <div className="mt-4 border-b border-slate-300 pb-3 flex justify-between text-xs text-slate-500">
          <span>Student: {user?.name} ({user?.email})</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 print-full-width">
        <div className="panel p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Attendance</p>
            <h2 className={`text-4xl font-extrabold tracking-tight mt-2 ${overallPercentage >= 75 ? "text-emerald-500" : "text-red-500"}`}>
              {overallPercentage.toFixed(1)}%
            </h2>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-550 ${overallPercentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Standard criteria: 75.0%</p>
          </div>
        </div>

        <div className="panel p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course Standings</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-emerald-500">{safeSubjectsCount}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Safe</span>
              </div>
              <div className="h-8 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-amber-500">{warningSubjectsCount}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Warning</span>
              </div>
              <div className="h-8 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-red-500">{criticalSubjectsCount}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Critical</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Total Subjects: {subjects.length}</p>
        </div>

        <div className="panel p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Logged Classes</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-slate-850 dark:text-white">{totalAttended}</span>
              <span className="text-sm font-semibold text-slate-400">/ {totalConducted}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Attended vs conducted (including calendar counts).</p>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>

        <div className="panel p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Attendance</p>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white mt-2">
              {subjects.length > 0
                ? (computedSubjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length).toFixed(1)
                : "0.0"
              }%
            </h2>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Mathematical average of individual subjects.</p>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* 3. Interactive Calendar & Logs Panel (Crucial Add) */}
      <div className="grid gap-6 md:grid-cols-3 no-print">
        {/* Calendar Grid (Spans 2 cols) */}
        <div className="panel p-4 sm:p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-brand-500" size={20} /> Attendance Logger Calendar
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="h-8 w-8 rounded border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-250 min-w-[100px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="h-8 w-8 rounded border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
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
                  className={`relative min-h-[38px] sm:min-h-[50px] p-1 sm:p-1.5 rounded-lg border flex flex-col items-center justify-between text-[10px] sm:text-xs transition-all ${
                    !cell.isCurrentMonth
                      ? "border-transparent bg-transparent text-slate-300 dark:text-slate-800"
                      : isSelected
                      ? "border-brand-500 bg-brand-500/10 text-brand-500 shadow-sm"
                      : "border-slate-100 dark:border-slate-900 bg-white/5 text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold self-start">{cell.day}</span>
                  
                  {/* Status dots */}
                  {hasLogs.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 w-full max-w-[28px] sm:max-w-[36px] overflow-hidden">
                      {hasLogs.slice(0, 3).map((log, index) => (
                        <span
                          key={index}
                          className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${
                            log.status === "attended"
                              ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                              : log.status === "bunked"
                              ? "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                              : "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]"
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

        {/* Selected date log manager */}
        <div className="panel p-4 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Day Logger Panel</span>
            <h3 className="text-base font-extrabold text-slate-855 dark:text-white mt-1">
              Classes on {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Select a date"}
            </h3>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {computedSubjects.map(sub => {
              const dayLog = logs.find(l => l.date === selectedDateStr && l.subjectId === sub.id);
              
              return (
                <div key={sub.id} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 space-y-2 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-200 truncate">{sub.name}</p>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "attended")}
                      className={`flex-1 h-7 rounded text-[10px] font-bold uppercase transition ${
                        dayLog?.status === "attended"
                          ? "bg-emerald-500 text-white shadow-soft"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Attended
                    </button>
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "bunked")}
                      className={`flex-1 h-7 rounded text-[10px] font-bold uppercase transition ${
                        dayLog?.status === "bunked"
                          ? "bg-red-500 text-white shadow-soft"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Bunked
                    </button>
                    <button
                      onClick={() => toggleLogStatus(selectedDateStr, sub.id, "leave")}
                      className={`flex-1 h-7 rounded text-[10px] font-bold uppercase transition ${
                        dayLog?.status === "leave"
                          ? "bg-amber-500 text-white shadow-soft"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Leave
                    </button>
                    {dayLog && (
                      <button
                        onClick={() => clearLog(selectedDateStr, sub.id)}
                        className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition"
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

          <div className="rounded-lg bg-brand-500/5 border border-brand-500/10 p-3 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info size={14} className="shrink-0 text-brand-500 mt-0.5" />
            <span>Marking a subject Attended adds 1 to present & conducted. Bunked adds 1 to conducted only. Leave has no calculation impact.</span>
          </div>
        </div>
      </div>

      {/* 4. Smart Suggestions Box */}
      <div className="panel p-6 bg-slate-900/5 dark:bg-slate-900/30 border-dashed border-slate-350 dark:border-slate-850">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="text-brand-500" size={18} /> Attendance Insights
        </h3>
        <div className="mt-4 space-y-2">
          {getSmartRecommendations().map((rec, idx) => (
            <div key={idx} className="flex gap-2.5 items-start text-sm text-slate-600 dark:text-slate-300">
              {rec.includes("Action Required") || rec.includes("Warning") ? (
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              ) : rec.includes("Alert") || rec.includes("Caution") ? (
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              ) : (
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              )}
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Subjects Panel: Input Form & Subject Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3 print-full-width">
        {/* Form Container */}
        <div className="lg:col-span-1 no-print">
          <div className="panel p-4 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Course Subject" : "Add Course Subject"}
            </h3>
            
            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Database Systems"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    Baseline Att. *
                    <span className="group relative">
                      <HelpCircle size={12} className="text-slate-400 cursor-help" />
                      <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 p-2 rounded bg-slate-900 text-[10px] text-slate-200 hidden group-hover:block z-55">
                        Past classes you attended before logging them on this calendar.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={baselineAttended}
                    onChange={(e) => setBaselineAttended(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 12"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    Baseline Cond. *
                    <span className="group relative">
                      <HelpCircle size={12} className="text-slate-400 cursor-help" />
                      <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 p-2 rounded bg-slate-900 text-[10px] text-slate-200 hidden group-hover:block z-55">
                        Past conducted classes before logging them on this calendar.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={baselineTotal}
                    onChange={(e) => setBaselineTotal(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 16"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Attendance *</label>
                  <span className="text-xs font-bold text-brand-500">{required}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={required}
                  onChange={(e) => setRequired(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5 mt-0.5">
                  <span>50%</span>
                  <span>75% (Standard)</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-brand-500 text-sm font-bold text-white flex items-center justify-center gap-1.5 transition hover:bg-brand-600 shadow-sm"
                >
                  <Plus size={16} /> {editingId ? "Save Changes" : "Add Subject"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName("");
                      setBaselineAttended("");
                      setBaselineTotal("");
                      setRequired(75);
                    }}
                    className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Subjects Grid & Filter Options */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtering */}
          <div className="panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350"
              >
                <option value="none">Sort: None</option>
                <option value="lowest">Sort: Lowest Attendance</option>
                <option value="highest">Sort: Highest Attendance</option>
              </select>

              <button
                onClick={() => setFilterCritical(prev => !prev)}
                className={`h-9 px-4 rounded-lg text-xs font-bold border transition ${
                  filterCritical
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                {filterCritical ? "Show All Subjects" : "Filter Critical"}
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <AnimatePresence>
              {processedSubjects.map(sub => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={sub.id}
                  className="panel p-4 sm:p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-855 dark:text-white text-base leading-snug line-clamp-1">
                        {sub.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        sub.status === "safe"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : sub.status === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs text-slate-400">
                      <span>Attendance:</span>
                      <span className={`font-bold ${
                        sub.status === "safe"
                          ? "text-emerald-500"
                          : sub.status === "warning"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}>{sub.percentage.toFixed(1)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          sub.status === "safe"
                            ? "bg-emerald-500"
                            : sub.status === "warning"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wide">
                      <span>Total Classes: {sub.total}</span>
                      <span>Attended: {sub.attended}</span>
                      {sub.leaveCount > 0 && <span className="text-amber-500">Leaves: {sub.leaveCount}</span>}
                    </div>

                    {/* Calculations Display */}
                    <div className="text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                      {sub.impossible ? (
                        <p className="text-red-500 font-medium flex items-center gap-1">
                          <AlertTriangle size={12} /> Impossible to achieve 100% attendance.
                        </p>
                      ) : sub.attend > 0 ? (
                        <p className="text-red-500 dark:text-red-400 font-semibold flex items-center gap-1.5">
                          <AlertTriangle size={13} className="shrink-0" />
                          <span>Must attend next <strong className="underline">{sub.attend}</strong> classes consecutively.</span>
                        </p>
                      ) : sub.skip > 0 ? (
                        <p className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle size={13} className="shrink-0" />
                          <span>Can safely skip <strong className="underline">{sub.skip}</strong> upcoming classes.</span>
                        </p>
                      ) : (
                        <p className="text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                          <AlertTriangle size={13} className="shrink-0" />
                          <span>Cannot skip any more classes. Attendance is at limit!</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 no-print">
                    <button
                      onClick={() => startEdit(sub)}
                      className="h-8 w-8 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-500 flex items-center justify-center transition"
                      aria-label="Edit subject details"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteSubject(sub.id)}
                      className="h-8 w-8 rounded bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-500 flex items-center justify-center transition"
                      aria-label="Delete subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {processedSubjects.length === 0 && (
              <p className="text-sm text-slate-450 dark:text-slate-500 py-8 text-center col-span-full">
                No subjects matches your settings.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* 6. Charts Panel */}
      <div className="grid gap-6 md:grid-cols-2 print-full-width">
        <div className="panel p-4 sm:p-6 min-w-0 w-full">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" /> Subject-wise Audit Chart
          </h3>
          <div className="h-64 w-full">
            {subjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Add subjects to view charts</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="Current Attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Required Attendance" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="panel p-4 sm:p-6 min-w-0 w-full">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-500" /> Standing Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {subjects.length === 0 ? (
              <div className="text-xs text-slate-400">Add subjects to view charts</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
