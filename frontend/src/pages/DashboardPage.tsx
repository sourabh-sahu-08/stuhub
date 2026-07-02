import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Search, Calendar, Clipboard, Library, Bot, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { navItems } from "../components/layout/navigation";
import { useState, useEffect, FormEvent } from "react";

const DEFAULT_SUBJECTS = [
  { id: "1", name: "Database Management Systems", baselineAttended: 12, baselineTotal: 16 },
  { id: "2", name: "Operating Systems", baselineAttended: 15, baselineTotal: 18 },
  { id: "3", name: "Applied AI", baselineAttended: 9, baselineTotal: 15 },
  { id: "4", name: "Computer Networks", baselineAttended: 19, baselineTotal: 22 }
];

export function DashboardPage() {
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState("");
  const [overallAttendance, setOverallAttendance] = useState(78.5);
  const [criticalCount, setCriticalCount] = useState(0);

  // Load live statistics from Local Storage
  useEffect(() => {
    try {
      const savedSubjects = localStorage.getItem("college-os-attendance-subjects-v2");
      const savedLogs = localStorage.getItem("college-os-attendance-logs-v2");
      
      const subjects = savedSubjects ? JSON.parse(savedSubjects) : DEFAULT_SUBJECTS;
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      
      let totalAttended = 0;
      let totalConducted = 0;
      let criticals = 0;
      
      subjects.forEach((sub: any) => {
        const subLogs = logs.filter((l: any) => l.subjectId === sub.id);
        const attendedLogs = subLogs.filter((l: any) => l.status === "attended").length;
        const bunkedLogs = subLogs.filter((l: any) => l.status === "bunked").length;
        
        const attended = (sub.baselineAttended ?? sub.attended) + attendedLogs;
        const total = (sub.baselineTotal ?? sub.total) + attendedLogs + bunkedLogs;
        const pct = total > 0 ? (attended / total) * 100 : 0;
        
        totalAttended += attended;
        totalConducted += total;
        
        if (pct < (sub.required ?? 75)) {
          criticals++;
        }
      });
      
      if (totalConducted > 0) {
        setOverallAttendance((totalAttended / totalConducted) * 100);
      }
      setCriticalCount(criticals);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const allowedModules = navItems.filter(
    (item) => item.path !== "/dashboard" &&
    (filterQuery === "" || item.label.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* 1. JobLuxe Welcome Hero Banner with Gradient & Glows */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-black p-8 sm:p-10 text-white shadow-[0_15px_30px_rgba(0,0,0,0.3)] border border-white/5"
        >
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-bold text-brand-500 select-none shadow-[0_0_15px_rgba(0,184,83,0.15)]">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              STUDENT WORKSPACE ACTIVE
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Scale Your Academic Goals <br />
              <span className="text-brand-500 drop-shadow-[0_0_20px_rgba(0,184,83,0.2)]">Build Your Future</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Welcome back, {user?.name}. Your college portal dashboard is synchronized. Check your live metrics below or filter modules to enter your workspace.
            </p>

            {/* Filter Search Input */}
            <form onSubmit={handleSearchSubmit} className="max-w-md bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/10 flex items-center gap-2 focus-within:border-brand-500/40 transition-all duration-300">
              <div className="flex items-center gap-2 flex-1 px-3 text-slate-400">
                <Search size={16} />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter workspace modules..."
                  className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-slate-450 focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-brand-500 text-xs font-bold text-white flex items-center gap-1.5 transition hover:bg-brand-600 hover:shadow-[0_0_10px_rgba(0,184,83,0.3)] active:scale-95"
              >
                Search <ArrowRight size={12} />
              </button>
            </form>

            {/* highlights */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-350 font-semibold select-none pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                Realtime Sync
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                Clean Student Workspace
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                AI Studio Planners
              </div>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-500/10 blur-[80px]" />
        </motion.div>

        {/* 2. Interactive Analytics / Quick Metrics Widgets */}
        <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-3">
          {/* Live Attendance widget */}
          <div className="panel p-6 flex flex-col justify-between hover:border-brand-500/20 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Attendance</p>
              <h2 className={`text-3xl font-extrabold tracking-tight mt-2 ${overallAttendance >= 75 ? "text-emerald-500" : "text-red-500"}`}>
                {overallAttendance.toFixed(1)}%
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Goal target: 75.0%</p>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-550 ${overallAttendance >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, overallAttendance)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Standing</span>
                <Link to="/dashboard/attendance" className="text-[10px] font-bold text-brand-500 hover:underline flex items-center gap-0.5">
                  Open logger <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          </div>

          {/* Academic progress widget */}
          <div className="panel p-6 flex flex-col justify-between hover:border-brand-500/20 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Workspace Checklist</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">
                25%
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Profile completion indicator</p>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Account setup verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Profile credentials complete</span>
              </div>
            </div>
          </div>

          {/* Detention risk widget */}
          <div className="panel p-6 flex flex-col justify-between hover:border-brand-500/20 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Detention Standings</p>
              <h2 className={`text-3xl font-extrabold tracking-tight mt-2 ${criticalCount > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                {criticalCount} Critical
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Subjects below attendance target</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Level</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                criticalCount > 0
                  ? "bg-red-500/10 text-red-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}>
                {criticalCount > 0 ? "At Risk" : "Safe"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3. Modules Grid Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Workspace Modules</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Explore modules and configure your student dashboards.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allowedModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_10px_30px_rgba(0,184,83,0.08)] bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-brand-500"
                >
                  <div>
                    {/* Icon container */}
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:border-brand-500/20 group-hover:bg-brand-500/10 group-hover:text-brand-500 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:group-hover:bg-brand-950/30 dark:group-hover:border-brand-500/30 transition-all duration-300">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-500 transition-colors">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      Manage, customize, and analyze your {item.label.toLowerCase()} tasks within this premium workspace panel.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-[-5px] group-hover:translate-x-0">
                    Enter Workspace <ArrowRight size={12} />
                  </div>
                </Link>
              );
            })}
            {allowedModules.length === 0 && (
              <p className="text-sm text-slate-450 dark:text-slate-500 col-span-full py-8 text-center">
                No active modules matches your query.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
