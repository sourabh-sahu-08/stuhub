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
  PlusCircle,
  MinusCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { useAuth } from "../context/AuthContext";

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
  required: number;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "1", name: "Database Management Systems", attended: 15, total: 20, required: 75 },
  { id: "2", name: "Operating Systems", attended: 18, total: 22, required: 75 },
  { id: "3", name: "Applied AI", attended: 11, total: 18, required: 75 },
  { id: "4", name: "Computer Networks", attended: 21, total: 25, required: 75 }
];

export function AttendancePage() {
  const { user } = useAuth();
  
  // Data State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("college-os-attendance-subjects");
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  // Form State
  const [name, setName] = useState("");
  const [attended, setAttended] = useState<number | "">("");
  const [total, setTotal] = useState<number | "">("");
  const [required, setRequired] = useState(75);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search/Sort/Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"lowest" | "highest" | "none">("none");
  const [filterCritical, setFilterCritical] = useState(false);

  // Persist State
  useEffect(() => {
    localStorage.setItem("college-os-attendance-subjects", JSON.stringify(subjects));
  }, [subjects]);

  // Calculations Helper
  const getSubjectMetrics = (sub: Subject) => {
    const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
    const reqFraction = sub.required / 100;
    
    let status: "safe" | "warning" | "critical" = "safe";
    if (pct < sub.required - 5) {
      status = "critical";
    } else if (pct < sub.required) {
      status = "warning";
    }

    let skip = 0;
    let attend = 0;
    let impossible = false;

    if (reqFraction >= 1) {
      if (sub.attended === sub.total) {
        skip = 0;
        attend = 0;
      } else {
        impossible = true;
      }
    } else {
      if (pct >= sub.required) {
        skip = Math.floor(sub.attended / reqFraction - sub.total);
      } else {
        attend = Math.ceil((reqFraction * sub.total - sub.attended) / (1 - reqFraction));
      }
    }

    return {
      percentage: pct,
      status,
      skip,
      attend,
      impossible
    };
  };

  // Overall Dashboard Calculations
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;

  const subjectMetrics = subjects.map(s => ({ ...s, ...getSubjectMetrics(s) }));
  
  const safeSubjects = subjectMetrics.filter(s => s.status === "safe").length;
  const criticalSubjects = subjectMetrics.filter(s => s.status === "critical").length;
  const warningSubjects = subjectMetrics.filter(s => s.status === "warning").length;

  // Recommendations Logic
  const getSmartRecommendations = () => {
    const recs: string[] = [];
    
    if (subjects.length === 0) {
      return ["Add your course subjects below to calculate your target attendance plans!"];
    }

    if (overallPercentage < 75) {
      recs.push(`Warning: Your overall attendance of ${overallPercentage.toFixed(1)}% is below standard criteria. Focus on attending upcoming classes.`);
    }

    subjectMetrics.forEach(sub => {
      if (sub.status === "critical" && sub.attend > 0) {
        recs.push(`Action Required: Attend the next ${sub.attend} consecutive classes of "${sub.name}" to restore it to ${sub.required}%.`);
      } else if (sub.status === "warning" && sub.attend > 0) {
        recs.push(`Alert: You are very close to the limit in "${sub.name}". Attend the next ${sub.attend} classes to secure your standing.`);
      } else if (sub.status === "safe" && sub.skip === 0) {
        recs.push(`Caution: Skipping even one more class of "${sub.name}" will drop your attendance below ${sub.required}%.`);
      } else if (sub.status === "safe" && sub.skip > 0) {
        recs.push(`Safe status: You have a buffer in "${sub.name}" and can safely skip up to ${sub.skip} upcoming classes.`);
      }
    });

    if (criticalSubjects === 0 && warningSubjects === 0) {
      recs.unshift("Excellent! All your subjects meet your required attendance percentages. Keep up the consistent presence!");
    }

    return recs.slice(0, 5); // Limit to top 5 most critical items
  };

  // Form Submit Handler
  const handleSaveSubject = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const attVal = attended === "" ? 0 : Number(attended);
    const totVal = total === "" ? 0 : Number(total);

    if (attVal < 0 || totVal < 0) {
      alert("Classes count cannot be negative.");
      return;
    }
    if (totVal < attVal) {
      alert("Total conducted classes cannot be less than attended classes.");
      return;
    }

    if (editingId) {
      setSubjects(prev =>
        prev.map(sub => (sub.id === editingId ? { ...sub, name, attended: attVal, total: totVal, required } : sub))
      );
      setEditingId(null);
    } else {
      const newSub: Subject = {
        id: Date.now().toString(),
        name,
        attended: attVal,
        total: totVal,
        required
      };
      setSubjects(prev => [...prev, newSub]);
    }

    // Reset Form
    setName("");
    setAttended("");
    setTotal("");
  };

  // Start Edit Mode
  const startEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setAttended(sub.attended);
    setTotal(sub.total);
    setRequired(sub.required);
  };

  // Delete Subject
  const deleteSubject = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(prev => prev.filter(sub => sub.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setName("");
        setAttended("");
        setTotal("");
      }
    }
  };

  // Increment/Decrement helper for quick updates
  const updateClassCount = (id: string, type: "attended" | "conducted", delta: number) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== id) return sub;
        
        let newAttended = sub.attended;
        let newTotal = sub.total;

        if (type === "attended") {
          newAttended = Math.max(0, sub.attended + delta);
          // Auto-increment total conducted if attended increases beyond total
          if (newAttended > newTotal) {
            newTotal = newAttended;
          }
        } else {
          newTotal = Math.max(0, sub.total + delta);
          // Auto-decrement attended if total decreases below attended
          if (newTotal < newAttended) {
            newAttended = newTotal;
          }
        }

        return { ...sub, attended: newAttended, total: newTotal };
      })
    );
  };

  // Reset all data
  const handleResetData = () => {
    if (confirm("Reset attendance calculator? All your customized subjects and classes history will be reverted to default values.")) {
      setSubjects(DEFAULT_SUBJECTS);
      setEditingId(null);
      setName("");
      setAttended("");
      setTotal("");
      setRequired(75);
    }
  };

  // Print Page
  const handlePrint = () => {
    window.print();
  };

  // Filter/Sort logic
  const processedSubjects = subjectMetrics
    .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(sub => !filterCritical || sub.status === "critical")
    .sort((a, b) => {
      if (sortBy === "lowest") return a.percentage - b.percentage;
      if (sortBy === "highest") return b.percentage - a.percentage;
      return 0;
    });

  // Recharts Chart Data Formatting
  const barChartData = subjectMetrics.map(sub => ({
    name: sub.name.length > 15 ? `${sub.name.slice(0, 15)}...` : sub.name,
    "Current Attendance": parseFloat(sub.percentage.toFixed(1)),
    "Required Attendance": sub.required
  }));

  const pieChartData = [
    { name: "Safe", value: safeSubjects, color: "#10b981" },
    { name: "Warning", value: warningSubjects, color: "#f59e0b" },
    { name: "Critical", value: criticalSubjects, color: "#ef4444" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Print Styles Injection */}
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

      {/* 1. Header Bar */}
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
              Student Workspace
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Attendance Command Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold shadow-sm transition"
          >
            <Printer size={16} /> Print Report
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-semibold shadow-sm transition"
          >
            <RotateCcw size={16} /> Reset All
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Stuhub College Portal</h1>
        <p className="text-sm text-slate-600 mt-1">Official Student Attendance Audit Report</p>
        <div className="mt-4 border-b border-slate-300 pb-3 flex justify-between text-xs text-slate-500">
          <span>Student: {user?.name} ({user?.email})</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* 2. Overview Dashboard Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 print-full-width">
        {/* Overall Percentage Card */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Attendance</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className={`text-4xl font-extrabold tracking-tight ${overallPercentage >= 75 ? "text-emerald-500" : "text-red-500"}`}>
                {overallPercentage.toFixed(1)}%
              </h2>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${overallPercentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Goal Criteria: 75.0%</p>
          </div>
        </div>

        {/* Safe/Critical subjects tracker */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Safe / Critical Subjects</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-emerald-500">{safeSubjects}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safe</span>
              </div>
              <div className="h-8 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-amber-500">{warningSubjects}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Warning</span>
              </div>
              <div className="h-8 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-red-500">{criticalSubjects}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Critical</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Total subjects logged: {subjects.length}</p>
        </div>

        {/* Total Classes */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Class Load</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{totalAttended}</span>
              <span className="text-sm font-semibold text-slate-400">/ {totalConducted}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Total classes attended vs total sessions conducted.</p>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Average Target buffer */}
        <div className="panel p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Attendance</p>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
              {subjects.length > 0
                ? (subjects.reduce((sum, s) => sum + (s.total > 0 ? (s.attended / s.total) * 100 : 0), 0) / subjects.length).toFixed(1)
                : "0.0"
              }%
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Direct average of all subject percentages logged.</p>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* 3. Smart Recommendations Box */}
      <div className="panel p-6 bg-slate-900/5 dark:bg-slate-900/30 border-dashed border-slate-350 dark:border-slate-850">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="text-brand-500" size={18} /> Smart Target Recommendations
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

      {/* Main Grid: Subject Form & Table list */}
      <div className="grid gap-6 lg:grid-cols-3 print-full-width">
        {/* 4. Subject Input Form (Left Col) */}
        <div className="lg:col-span-1 no-print">
          <div className="panel p-6 space-y-4">
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
                  placeholder="e.g. Applied Cryptography"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Attended *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={attended}
                    onChange={(e) => setAttended(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Conducted *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={total}
                    onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 20"
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
                      setAttended("");
                      setTotal("");
                      setRequired(75);
                    }}
                    className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* 5. Subject Cards & Filtering Grid (Right Col, spans 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Panel */}
          <div className="panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            {/* Search */}
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

            {/* Sorting and Filtering Toggles */}
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
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {filterCritical ? "Show All Subjects" : "Filter Critical"}
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <AnimatePresence>
              {processedSubjects.map(sub => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={sub.id}
                  className="panel p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header: Name and Status */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-base leading-snug line-clamp-1">
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

                    {/* Progress details */}
                    <div className="flex justify-between items-baseline text-xs text-slate-400">
                      <span>Attendance Pct:</span>
                      <span className={`font-bold ${
                        sub.status === "safe"
                          ? "text-emerald-500"
                          : sub.status === "warning"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}>{sub.percentage.toFixed(1)}%</span>
                    </div>

                    {/* Subject Progress bar */}
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

                    {/* Class Stats Controls */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg no-print">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Attended:</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.attended}</span>
                        <div className="flex items-center ml-1">
                          <button onClick={() => updateClassCount(sub.id, "attended", 1)} className="text-slate-400 hover:text-emerald-500 transition">
                            <PlusCircle size={14} />
                          </button>
                          <button onClick={() => updateClassCount(sub.id, "attended", -1)} className="text-slate-400 hover:text-red-500 transition">
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="h-4 border-r border-slate-200 dark:border-slate-800" />

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Total:</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.total}</span>
                        <div className="flex items-center ml-1">
                          <button onClick={() => updateClassCount(sub.id, "conducted", 1)} className="text-slate-400 hover:text-emerald-500 transition">
                            <PlusCircle size={14} />
                          </button>
                          <button onClick={() => updateClassCount(sub.id, "conducted", -1)} className="text-slate-400 hover:text-red-500 transition">
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Print-only Stats */}
                    <div className="hidden print:block text-xs text-slate-600 space-y-1">
                      <p>Classes: {sub.attended} attended out of {sub.total} total sessions.</p>
                      <p>Required target: {sub.required}%</p>
                    </div>

                    {/* Smart calculations display */}
                    <div className="text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2.5 space-y-1">
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

                  {/* Actions (Edit / Delete) */}
                  <div className="flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 no-print">
                    <button
                      onClick={() => startEdit(sub)}
                      className="h-8 w-8 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-500 flex items-center justify-center transition"
                      aria-label="Edit subject"
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
                No subjects found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6. Animated Charts section */}
      <div className="grid gap-6 md:grid-cols-2 print-full-width">
        {/* Subject-wise Bar Chart */}
        <div className="panel p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" /> Subject-wise Audit Chart
          </h3>
          <div className="h-64 w-full">
            {subjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Add subjects to visualize chart</div>
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
                  <Bar dataKey="Current Attendance" fill="#00b853" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Required Attendance" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subjects status Pie Chart */}
        <div className="panel p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-500" /> Standing Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {subjects.length === 0 ? (
              <div className="text-xs text-slate-400">Add subjects to visualize chart</div>
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
