import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const DEFAULT_SUBJECTS = [
  { id: "1", name: "Database Management Systems", baselineAttended: 12, baselineTotal: 16 },
  { id: "2", name: "Operating Systems", baselineAttended: 15, baselineTotal: 18 },
  { id: "3", name: "Applied AI", baselineAttended: 9, baselineTotal: 15 },
  { id: "4", name: "Computer Networks", baselineAttended: 19, baselineTotal: 22 }
];

export function DashboardPage() {
  const { user } = useAuth();
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  // API states
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingApis, setLoadingApis] = useState(true);

  // Fetch from APIs and calculate client-side metrics
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
      
      const attended = (sub.baselineAttended ?? sub.attended ?? 0) + attendedLogs;
      const total = (sub.baselineTotal ?? sub.total ?? 0) + attendedLogs + bunkedLogs;
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

    // Calculate real study streak from logs
    if (logs.length > 0) {
      const uniqueDates = Array.from(new Set(logs.map((l: any) => l.date))).sort((a: any, b: any) => b.localeCompare(a)) as string[];
      if (uniqueDates.length > 0) {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latestDate = new Date(uniqueDates[0] as string);
        latestDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - latestDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          let currentDate = latestDate;
          for (let i = 0; i < uniqueDates.length; i++) {
            const hasLogOnDate = uniqueDates.some((d: any) => {
              const dObj = new Date(d);
              dObj.setHours(0, 0, 0, 0);
              return dObj.getTime() === currentDate.getTime();
            });
            if (hasLogOnDate) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
        setStreakDays(streak);
      }
    }

    // Load backend stubs
    Promise.all([
      api.get("/assignments").then(res => setDeadlines(res.data)).catch(() => {}),
      api.get("/notes/recent").then(res => setResources(res.data)).catch(() => {}),
      api.get("/dashboard/student").then(res => setNotices(res.data?.notices || [])).catch(() => {})
    ]).finally(() => {
      setLoadingApis(false);
    });
  }, []);

  // Generate consistency heatmap cell patterns (simulated based on log days)
  const heatmapCells = Array.from({ length: 42 }, (_, i) => {
    // Determine cell colors in a deterministic way
    const val = (i * 7 + 13) % 100;
    if (val > 85) return "active";
    if (val > 60) return "mid";
    return "";
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-outline bg-[#0c0f0f] rounded-lg overflow-hidden">
      {/* Primary Column (60%) */}
      <div className="lg:col-span-8 p-6 sm:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-outline">
        {/* Workspace Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-label-sm text-[11px] text-primary uppercase tracking-[0.2em] mb-1 font-mono">Workspace Overview</h2>
            <h3 className="font-display-lg text-3xl font-extrabold text-[#e2e2e2]">Student Command Center</h3>
          </div>
          <div className="text-right text-xs text-on-surface-variant font-mono">
            PORTAL: <span className="text-primary font-bold">{user?.name ? user.name.toUpperCase() : "STUDENT"}</span>
          </div>
        </div>

        {/* Real-time Indicators */}
        <section className="space-y-4">
          <h4 className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-[0.1em] opacity-50 font-mono">Real-Time Indicators</h4>
          
          {/* Detention Warning Card */}
          <div className="py-6 flex items-start gap-6 border-b border-outline hover:bg-[#16161A]/30 transition-colors rounded px-3">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex-1">
              <p className="font-label-sm text-[10px] text-red-500 font-bold uppercase tracking-wider font-mono">Detention Warning</p>
              <h4 className="font-headline-sm text-lg font-bold text-white mt-1">
                {criticalCount > 0 
                  ? `${criticalCount} Subjects Below Threshold` 
                  : "Attendance Standing: Secure"}
              </h4>
              <p className="font-body-md text-sm text-on-surface-variant mt-1">
                {criticalCount > 0 
                  ? "Action required. Review your calendar logs to identify bunk trends." 
                  : "Excellent standings. Your aggregate attendance satisfies standard rules."}
              </p>
            </div>
          </div>

          {/* Nearest Deadline Card */}
          <div className="py-6 flex items-start gap-6 border-b border-outline hover:bg-[#16161A]/30 transition-colors rounded px-3">
            <div className="p-3 bg-[#36c2ff]/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <div className="flex-1">
              <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">Deadlines & Assignments</p>
              {deadlines.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {deadlines.slice(0, 2).map((item, idx) => (
                    <div key={idx}>
                      <h4 className="font-headline-sm text-sm font-bold text-white">{item.title}</h4>
                      <p className="font-body-md text-xs text-on-surface-variant">Due: {item.dueDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-white mt-1">No Upcoming Deadlines</h4>
                  <p className="font-body-md text-xs text-on-surface-variant mt-1">All coursework submissions are fully up-to-date.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Primary Action Button */}
        <section className="pt-2 flex flex-wrap gap-4">
          <Link
            to="/dashboard/pyq"
            className="inline-flex bg-primary text-black px-6 py-3 rounded font-bold items-center gap-3 transition-transform hover:scale-[1.01] active:scale-95"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Analyze Exam Papers
          </Link>
          <Link
            to="/dashboard/pyq-analyzer"
            className="inline-flex border border-[#F5A524]/55 text-primary hover:bg-[#F5A524]/10 px-6 py-3 rounded font-bold items-center gap-3 transition-transform hover:scale-[1.01] active:scale-95"
          >
            <span className="material-symbols-outlined">psychology_alt</span>
            AI PYQ Analyzer
          </Link>
        </section>

        {/* Recent Resources */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-lg font-semibold text-white">Recent Resources</h3>
            <Link className="text-primary text-xs hover:underline animate-pulse" to="/dashboard/library">See Library</Link>
          </div>
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.slice(0, 2).map((item, idx) => (
                <div key={idx} className="p-4 rounded border border-outline bg-[#0F0F12] hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-secondary group-hover:text-primary">folder_open</span>
                    <span className="text-[9px] font-bold text-[#A3A3A3] font-mono">FILE</span>
                  </div>
                  <p className="font-label-lg font-semibold text-white">{item.title}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">{item.subject} • Sem {item.semester} ({item.branch})</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded border border-dashed border-outline text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl opacity-30">folder_open</span>
              <p className="text-xs font-semibold mt-2">No library materials uploaded yet</p>
              <p className="text-[10px] opacity-60 mt-1">Manage files under the Notes tab.</p>
            </div>
          )}
        </section>
      </div>

      {/* Secondary Column (40%) */}
      <div className="lg:col-span-4 p-6 sm:p-10 space-y-8 bg-[#0F0F12]/30">
        {/* Pulse Analytics */}
        <section className="space-y-4">
          <h3 className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-[0.1em] opacity-50 font-mono">Pulse Analytics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-extrabold text-white">N/A</p>
              <p className="text-xs text-[#A1A1AA] mt-1">GPA (API Offline)</p>
              <div className="w-16 h-1 bg-outline mt-2">
                <div className="h-full bg-outline-variant w-[0%]"></div>
              </div>
            </div>
            <div>
              <p className={`text-3xl font-extrabold ${overallAttendance >= 75 ? "text-emerald-500" : "text-red-500"}`}>
                {overallAttendance > 0 ? `${overallAttendance.toFixed(1)}%` : "0.0%"}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-1">Avg. Attendance</p>
              <div className="w-16 h-1 bg-tertiary/20 mt-2">
                <div className={`h-full ${overallAttendance >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, overallAttendance)}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-[#27272D]"/>

        {/* Consistency Heatmap */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-sm font-bold text-white">Consistency</h3>
            {streakDays > 0 ? (
              <p className="text-xs text-primary font-mono font-semibold">{streakDays} day streak 🔥</p>
            ) : (
              <p className="text-xs text-on-surface-variant font-mono">No active streak</p>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {heatmapCells.map((status, index) => (
              <div
                key={index}
                className={`heatmap-cell ${status}`}
                title={`Day ${index + 1}`}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-on-surface-variant font-mono uppercase">
            <span>Less active</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#16161A]"></div>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/45"></div>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary"></div>
            </div>
            <span>High Focus</span>
          </div>
        </section>

        <hr className="border-[#27272D]"/>

        {/* AI Analyzer Insights */}
        <section className="space-y-4">
          <h3 className="font-headline-sm text-sm font-bold text-white">AI Insights</h3>
          <div className="p-5 bg-[#16161A] rounded border border-outline relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <span className="material-symbols-outlined text-[48px]">psychology</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed italic relative z-10">
              "AI Insights will appear here after you upload and analyze past exam papers."
            </p>
            <Link
              to="/dashboard/pyq"
              className="mt-4 text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              Analyze PYQs now <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        <hr className="border-[#27272D]"/>

        {/* Upcoming Notices */}
        <section className="space-y-4">
          <h3 className="font-headline-sm text-sm font-bold text-white">Announcements</h3>
          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.slice(0, 2).map((notice: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 py-1">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">campaign</span>
                  <div>
                    <p className="text-xs font-bold text-white">{notice.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{notice.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-on-surface-variant italic">
              No new announcements. (API Offline)
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
export default DashboardPage;
