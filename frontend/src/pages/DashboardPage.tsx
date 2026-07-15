import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const DEFAULT_SUBJECTS = [
  { id: "1", name: "Database Management Systems", baselineAttended: 12, baselineTotal: 16 },
  { id: "2", name: "Operating Systems", baselineAttended: 15, baselineTotal: 18 },
  { id: "3", name: "Applied AI", baselineAttended: 9, baselineTotal: 15 },
  { id: "4", name: "Computer Networks", baselineAttended: 19, baselineTotal: 22 },
];

const QUICK_LINKS = [
  { label: "Attendance", icon: "calendar_month", to: "/dashboard/attendance", desc: "Track your class attendance" },
  { label: "Notes", icon: "folder_open", to: "/dashboard/library", desc: "Access your study notes" },
  { label: "PYQs", icon: "description", to: "/dashboard/pyq", desc: "Browse past exam papers" },
  { label: "AI Analyzer", icon: "psychology_alt", to: "/dashboard/pyq-analyzer", desc: "Analyze papers with Groq AI" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem("stuhub-attendance-subjects-v2");
    const savedLogs = localStorage.getItem("stuhub-attendance-logs-v2");
    const subjects = savedSubjects ? JSON.parse(savedSubjects) : DEFAULT_SUBJECTS;
    const logs = savedLogs ? JSON.parse(savedLogs) : [];

    let totalAttended = 0;
    let totalConducted = 0;
    let criticals = 0;

    subjects.forEach((sub: any) => {
      const subLogs = logs.filter((l: any) => l.subjectId === sub.id);
      const attendedLogs = subLogs.filter((l: any) => l.status === "attended").length;
      const bunkedLogs = subLogs.filter((l: any) => l.status === "bunked").length;
      const attended = (sub.baselineAttended ?? 0) + attendedLogs;
      const total = (sub.baselineTotal ?? 0) + attendedLogs + bunkedLogs;
      const pct = total > 0 ? (attended / total) * 100 : 0;
      totalAttended += attended;
      totalConducted += total;
      if (pct < (sub.required ?? 75)) criticals++;
    });

    if (totalConducted > 0) setOverallAttendance((totalAttended / totalConducted) * 100);
    setCriticalCount(criticals);

    Promise.all([
      api.get("/assignments").then(res => setDeadlines(res.data)).catch(() => {}),
      api.get("/notes/recent").then(res => setResources(res.data)).catch(() => {}),
    ]);
  }, []);

  const attendanceOk = overallAttendance >= 75;
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">

      {/* ── Greeting ── */}
      <div>
        <p className="text-sm text-zinc-500">{greeting},</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">
          {user?.name ?? "Student"} 👋
        </h1>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className={`p-5 rounded-xl border ${attendanceOk ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-400 font-medium">Avg. Attendance</p>
            <span className={`material-symbols-outlined text-[18px] ${attendanceOk ? "text-emerald-500" : "text-red-400"}`}>
              {attendanceOk ? "check_circle" : "warning"}
            </span>
          </div>
          <p className={`text-3xl font-extrabold ${attendanceOk ? "text-emerald-400" : "text-red-400"}`}>
            {overallAttendance > 0 ? `${overallAttendance.toFixed(1)}%` : "—"}
          </p>
          <p className={`text-[11px] mt-1 ${attendanceOk ? "text-emerald-500/80" : "text-red-400/80"}`}>
            {attendanceOk ? "All clear" : `${criticalCount} subject${criticalCount !== 1 ? "s" : ""} below 75%`}
          </p>
        </div>

        {/* Deadlines */}
        <div className="p-5 rounded-xl border border-[#333] bg-[#111]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-400 font-medium">Upcoming Tasks</p>
            <span className="material-symbols-outlined text-[18px] text-[#FF9000]">timer</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{deadlines.length}</p>
          <p className="text-[11px] mt-1 text-zinc-500">
            {deadlines.length === 0 ? "Nothing due — you're all set" : "pending assignments"}
          </p>
        </div>

        {/* Notes */}
        <div className="p-5 rounded-xl border border-[#333] bg-[#111]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-400 font-medium">Saved Notes</p>
            <span className="material-symbols-outlined text-[18px] text-[#FF9000]">folder_open</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{resources.length > 0 ? resources.length : "—"}</p>
          <p className="text-[11px] mt-1 text-zinc-500">
            {resources.length > 0 ? "files in your library" : "No files yet"}
          </p>
        </div>
      </div>

      {/* ── Quick Access ── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#FF9000]/40 hover:bg-[#1a1100] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[22px] text-[#FF9000] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Primary Actions ── */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/dashboard/pyq"
          className="inline-flex items-center gap-2 bg-[#FF9000] text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#FFa830] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Analyze Exam Papers
        </Link>
        <Link
          to="/dashboard/pyq-analyzer"
          className="inline-flex items-center gap-2 border border-[#FF9000]/40 text-[#FF9000] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#FF9000]/10 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
          AI PYQ Analyzer
        </Link>
      </div>

      {/* ── Recent Notes ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400">Recent Resources</h2>
          <Link to="/dashboard/library" className="text-xs text-[#FF9000] hover:underline">
            See all →
          </Link>
        </div>
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#444] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-zinc-500">description</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.subject}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-[#2a2a2a] text-center">
            <span className="material-symbols-outlined text-3xl text-zinc-700">folder_open</span>
            <p className="text-sm text-zinc-500 mt-2">No notes uploaded yet</p>
            <Link to="/dashboard/library" className="text-xs text-[#FF9000] mt-1 hover:underline">
              Upload your first note →
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;
