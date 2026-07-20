import { useState, FormEvent, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Folder,
  FileText,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  History,
  MoreVertical,
  Terminal,
  Shield,
  Key,
  Bell,
  Network,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Sliders,
  CheckCircle,
  FolderPlus,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Award,
  BookOpen,
  User,
  Settings as SettingsIcon,
  Laptop
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { navItems } from "../components/layout/navigation";
import { api } from "../lib/api";

const DEFAULT_SUBJECTS = [
  { id: "1", name: "Database Management Systems", baselineAttended: 12, baselineTotal: 16 },
  { id: "2", name: "Operating Systems", baselineAttended: 15, baselineTotal: 18 },
  { id: "3", name: "Applied AI", baselineAttended: 9, baselineTotal: 15 },
  { id: "4", name: "Computer Networks", baselineAttended: 19, baselineTotal: 22 }
];

export function ModulePage() {
  const { module } = useParams();
  const { user } = useAuth();

  // Local storage loaded states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [streakDays, setStreakDays] = useState(0);

  // API states
  const [notices, setNotices] = useState<any[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<any[]>([]);
  const [loadingApis, setLoadingApis] = useState(true);

  // Folder state for Library notes
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  // Local State for settings tabs
  const [settingsTab, setSettingsTab] = useState<"general" | "security" | "notifications" | "integration">("general");

  // Local state for stealth/public toggles
  const [stealthMode, setStealthMode] = useState(false);
  const [publicDiscovery, setPublicDiscovery] = useState(true);

  // Local state for event registration clicks
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  useEffect(() => {
    // Load local storage values
    const savedSubjects = localStorage.getItem("stuhub-attendance-subjects-v2");
    const savedLogs = localStorage.getItem("stuhub-attendance-logs-v2");

    const subs = savedSubjects ? JSON.parse(savedSubjects) : DEFAULT_SUBJECTS;
    const lgs = savedLogs ? JSON.parse(savedLogs) : [];

    setSubjects(subs);
    setLogs(lgs);

    // Populate notes folders from subjects
    setFolders(subs.map((s: any) => ({
      name: s.name,
      count: lgs.filter((l: any) => l.subjectId === s.id).length,
      modified: "Recently"
    })));

    // Calculate real study streak from logs
    if (lgs.length > 0) {
      const uniqueDates = Array.from(new Set(lgs.map((l: any) => l.date))).sort((a: any, b: any) => b.localeCompare(a)) as string[];
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
      api.get("/notes/recent").then(res => setLibraryFiles(res.data)).catch(() => {})
    ]).finally(() => {
      setLoadingApis(false);
      setNotices([]);
    });
  }, [module]);

  const handleRegisterEvent = (eventName: string) => {
    if (registeredEvents.includes(eventName)) {
      setRegisteredEvents(prev => prev.filter(e => e !== eventName));
    } else {
      setRegisteredEvents(prev => [...prev, eventName]);
      alert(`Success! You have registered for "${eventName}".`);
    }
  };

  const handleAddFolder = (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders(prev => [
      ...prev,
      { name: newFolderName, count: 0, modified: "Just now" }
    ]);
    setNewFolderName("");
    setIsNewFolderOpen(false);
  };

  // Compute aggregate attendance percentage from local state
  const getOverallAttendance = () => {
    let totalAttended = 0;
    let totalConducted = 0;

    subjects.forEach((sub: any) => {
      const subLogs = logs.filter((l: any) => l.subjectId === sub.id);
      const attendedLogs = subLogs.filter((l: any) => l.status === "attended").length;
      const bunkedLogs = subLogs.filter((l: any) => l.status === "bunked").length;

      const attended = (sub.baselineAttended ?? 0) + attendedLogs;
      const total = (sub.baselineTotal ?? 0) + attendedLogs + bunkedLogs;

      totalAttended += attended;
      totalConducted += total;
    });

    return totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
  };

  const overallAttPct = getOverallAttendance();

  // Switch display views based on URL param
  const renderContent = () => {
    switch (module) {
      case "library":
        return (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface-container border border-outline p-5 rounded">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider font-mono">Folders Count</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">{folders.length}</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">Subjects</span>
                </div>
              </div>
              <div className="bg-surface-container border border-outline p-5 rounded">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider font-mono">Storage Used</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">0.0 GB</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">of 10 GB</span>
                </div>
                <div className="w-full h-1 bg-background border border-outline mt-2 rounded overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "0%" }}></div>
                </div>
              </div>
              <div className="bg-surface-container border border-outline p-5 rounded">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider font-mono">Real-time Streak</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Flame size={14} className="text-primary animate-pulse" />
                  <span className="text-xs text-white">{streakDays} Days</span>
                </div>
              </div>
              <div className="bg-surface-container border border-outline p-5 rounded">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider font-mono">AI Summaries</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">0</span>
                  <span className="text-[10px] font-bold text-on-surface-variant font-mono">Pending</span>
                </div>
              </div>
            </div>

            {/* Folder Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Subject Folders</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewFolderOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline text-xs font-bold text-zinc-200 hover:border-primary/50 transition-all cursor-pointer font-mono"
                  >
                    <FolderPlus size={14} /> NEW FOLDER
                  </button>
                </div>
              </div>
              
              {folders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {folders.map((fold, idx) => (
                    <div key={idx} className="bg-surface border border-outline hover:border-[#808080] p-5 rounded transition-all cursor-pointer group flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <Folder className="text-[#FFA31A]" size={36} fill="#FFA31A" />
                          <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-white">{fold.name}</h4>
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                          <span>Logs Count</span>
                          <span className="text-white font-semibold font-mono">{fold.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                          <span>Modified</span>
                          <span className="text-white font-semibold font-mono">{fold.modified}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-outline rounded text-center text-on-surface-variant text-xs">
                  No subject folders found. Configure modules in the Attendance page to generate them.
                </div>
              )}
            </div>

            {/* Library list table */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recently Modified Files</h3>
              {libraryFiles.length > 0 ? (
                <div className="border border-outline bg-surface rounded overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
                        <th className="px-5 py-3 font-bold">Name</th>
                        <th className="px-5 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272D] text-zinc-200">
                      {libraryFiles.map((file, idx) => (
                        <tr key={idx} className="hover:bg-surface-container/30">
                          <td className="px-5 py-3 flex items-center gap-2">
                            <FileText className="text-primary" size={14} />
                            <span className="font-semibold">{file.title}</span>
                          </td>
                          <td className="px-5 py-3 font-mono">No Actions</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-outline rounded text-center text-on-surface-variant text-xs">
                  No materials uploaded. (Library API Offline)
                </div>
              )}
            </div>

            {/* Folder creation overlay */}
            <AnimatePresence>
              {isNewFolderOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm select-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm p-6 rounded border border-outline bg-surface text-zinc-200 space-y-5"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-outline">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Configure New Folder</h3>
                      <button onClick={() => setIsNewFolderOpen(false)} className="text-on-surface-variant hover:text-white cursor-pointer">✖</button>
                    </div>
                    <form onSubmit={handleAddFolder} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-mono">Folder Name</label>
                        <input
                          type="text"
                          required
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="e.g. Computer Networks"
                          className="w-full h-10 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                        />
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsNewFolderOpen(false)}
                          className="flex-1 h-9 rounded border border-outline text-zinc-50 text-xs font-semibold uppercase tracking-wider font-mono hover:bg-surface-container cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 h-9 rounded bg-primary text-black text-xs font-bold uppercase tracking-wider font-mono hover:opacity-90 cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );

      case "events":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Widget */}
            <div className="lg:col-span-8 panel p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">September 2024</h3>
                <div className="flex gap-1.5">
                  <button className="h-7 w-7 rounded border border-outline bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white">
                    <ChevronLeft size={14} />
                  </button>
                  <button className="h-7 w-7 rounded border border-outline bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-1 font-mono">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-primary">Sat</span>
                <span className="text-primary">Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-1 border-t border-l border-outline mt-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === 12;

                  return (
                    <div
                      key={day}
                      className={`h-16 sm:h-24 border-r border-b border-outline p-1.5 text-xs text-on-surface-variant font-mono hover:bg-surface-container/40 transition-colors flex flex-col justify-between ${
                        isToday ? "bg-surface-container border-t-2 border-t-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={isToday ? "font-bold text-white" : ""}>{day}</span>
                        {isToday && <span className="text-[8px] font-bold text-primary font-mono">TODAY</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming List */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <h3 className="text-sm font-bold text-white flex items-center justify-between font-mono uppercase tracking-wider">
                Upcoming Events
                <span className="font-mono text-[9px] bg-surface-container px-2 py-0.5 rounded border border-outline text-zinc-400">0 Active</span>
              </h3>

              <div className="p-8 border border-dashed border-outline rounded text-center text-on-surface-variant text-xs">
                No official campus events scheduled. (API Offline)
              </div>
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Notification Logs</h3>
              <span className="font-mono text-[9px] bg-surface-container border border-outline text-on-surface-variant px-2 py-0.5 rounded uppercase">
                {notices.length} Alerts
              </span>
            </div>
            
            <div className="space-y-4">
              {overallAttPct < 75 && (
                <div className="p-5 bg-red-500/5 rounded border border-red-500/20 flex gap-4 items-start">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Attendance Warning</h4>
                      <span className="text-[8px] font-mono text-red-500 uppercase font-bold px-1 bg-red-500/10 rounded">Urgent</span>
                    </div>
                    <p className="text-xs text-zinc-200 mt-1.5">
                      Your overall attendance aggregate is currently {overallAttPct.toFixed(1)}%, which is below the mandatory 75% baseline requirement. Review your attendance matrix to log future sessions.
                    </p>
                    <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-2">Source: Client-Side Attendance Engine</p>
                  </div>
                </div>
              )}

              {notices.length > 0 ? (
                notices.map((notice: any, idx: number) => (
                  <div key={idx} className="p-5 bg-surface-container rounded border border-outline flex gap-4 items-start">
                    <span className="material-symbols-outlined text-primary mt-0.5">campaign</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{notice.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-200 mt-1.5">{notice.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 border border-dashed border-outline rounded text-center text-on-surface-variant text-xs">
                  No active system announcements. (Dashboard API Offline)
                </div>
              )}
            </div>
          </div>
        );

      case "saved":
        return (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Bookmarked Resources</h3>
            <div className="p-8 border border-dashed border-outline rounded text-center text-on-surface-variant text-xs">
              No saved bookmarks. (Saved Resources API Offline)
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-8">
            {/* Profile Overview Card */}
            <div className="panel p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
                <p className="text-xs text-on-surface-variant font-mono uppercase mt-0.5">
                  {user?.role || "Student"} Workspace
                </p>
              </div>
            </div>

            {/* Academic & Stats Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Academic Credentials */}
              <div className="panel p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-outline pb-2">
                  Academic Profile
                </h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Full Name</span>
                    <span className="font-bold text-white">{user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Email Address</span>
                    <span className="font-bold text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Roll Number</span>
                    <span className="font-bold text-white">{user?.rollNumber || "Not Set"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Department / Branch</span>
                    <span className="font-bold text-white text-right max-w-[200px] truncate" title={user?.department?.name}>
                      {user?.department?.name || "Not Set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Academic Semester</span>
                    <span className="font-bold text-white">
                      {user?.semester ? `Semester ${user.semester}` : "Not Set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Class Section</span>
                    <span className="font-bold text-white">{user?.section || "Not Set"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Statistics & Highlights */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container border border-outline p-5 rounded flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Study Streak</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="text-primary animate-pulse" size={20} fill="#F5A524" />
                      <span className="text-2xl font-extrabold text-white">{streakDays} Days</span>
                    </div>
                  </div>
                  <div className="bg-surface-container border border-outline p-5 rounded flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Avg Attendance</p>
                    <div>
                      <span className="text-2xl font-extrabold text-white">{overallAttPct > 0 ? `${overallAttPct.toFixed(1)}%` : "0%"}</span>
                      <p className={`text-[9px] font-mono mt-0.5 ${overallAttPct >= 75 ? "text-emerald-500" : "text-red-500"}`}>
                        {overallAttPct >= 75 ? "SATISFIED" : "WARNING"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Courses section from actual localStorage */}
                <div className="panel p-5 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono border-b border-outline pb-2">
                    Subject Presence Overview
                  </h4>
                  {subjects.length > 0 ? (
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {subjects.map((sub: any) => {
                        const subLogs = logs.filter((l: any) => l.subjectId === sub.id);
                        const attendedLogs = subLogs.filter((l: any) => l.status === "attended").length;
                        const bunkedLogs = subLogs.filter((l: any) => l.status === "bunked").length;

                        const attended = (sub.baselineAttended ?? 0) + attendedLogs;
                        const total = (sub.baselineTotal ?? 0) + attendedLogs + bunkedLogs;
                        const pct = total > 0 ? (attended / total) * 100 : 0;

                        return (
                          <div key={sub.id} className="flex items-center justify-between text-xs py-1 border-b border-outline/50 last:border-0 last:pb-0">
                            <span className="text-white truncate max-w-[180px] font-medium">{sub.name}</span>
                            <span className={`font-mono font-bold ${pct >= 75 ? "text-primary" : "text-red-500"}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      No subject folders configured.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="max-w-2xl space-y-8">

            {/* Account */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4">Account</h2>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#FF9000]">person</span>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name ?? "Student"}</p>
                      <p className="text-xs text-zinc-500">{user?.email ?? ""}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#FF9000] bg-[#FF9000]/10 px-2 py-0.5 rounded">
                    {user?.role ?? "student"}
                  </span>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4">Privacy</h2>
              <div className="divide-y divide-[#1f1f1f] rounded-xl border border-[#2a2a2a] overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-[#111]">
                  <div>
                    <p className="text-sm font-medium text-white">Stealth Mode</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Hide your activity from peers in study groups</p>
                  </div>
                  <button
                    onClick={() => setStealthMode(!stealthMode)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${stealthMode ? "bg-[#FF9000]" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${stealthMode ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#111]">
                  <div>
                    <p className="text-sm font-medium text-white">Public Profile</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Let other students with similar courses find you</p>
                  </div>
                  <button
                    onClick={() => setPublicDiscovery(!publicDiscovery)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${publicDiscovery ? "bg-[#FF9000]" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${publicDiscovery ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4">Notifications</h2>
              <div className="divide-y divide-[#1f1f1f] rounded-xl border border-[#2a2a2a] overflow-hidden">
                {[
                  { label: "Upcoming deadlines", desc: "Reminders before assignment due dates" },
                  { label: "AI analysis complete", desc: "When your PYQ paper scan finishes" },
                  { label: "Peer activity", desc: "When someone shares a note with you" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-[#111]">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button className="relative w-11 h-6 rounded-full bg-[#FF9000] focus:outline-none">
                      <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4">Security</h2>
              <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-[#111]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-zinc-400">lock</span>
                    <div>
                      <p className="text-sm font-medium text-white">Password</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Last changed: never</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#FF9000] font-semibold hover:underline">Change</button>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="text-base font-semibold text-red-400 mb-4">Danger Zone</h2>
              <div className="rounded-xl border border-red-500/20 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-red-500/5">
                  <div>
                    <p className="text-sm font-medium text-white">Delete Account</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all data</p>
                  </div>
                  <button className="text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </section>

          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Module Construction Complete</h2>
            <p className="text-sm text-on-surface-variant max-w-sm">Use the navigation bar to visit library, events, announcements, profile, or settings.</p>
          </div>
        );
    }
  };

  const currentItem = navItems.find((item) => item.path === `/${module}` || item.path === `/dashboard/${module}`);

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Module Not Found</h2>
        <Link to="/dashboard" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Return to Command Center
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-outline pb-6 no-print">
        <Link
          to="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded border border-outline bg-surface-container text-zinc-50 transition hover:bg-surface-container-high"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
            {user?.role || "Student"} Workspace
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            {currentItem.label}
          </h1>
        </div>
      </div>

      {/* Main content viewport */}
      <div className="print-full-width">
        {renderContent()}
      </div>
    </div>
  );
}
export default ModulePage;
