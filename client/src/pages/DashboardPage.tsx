import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Section } from "../components/ui/Section";
import { StatCard } from "../components/ui/StatCard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.get(`/dashboard/${user.role}`).then((response) => setData(response.data)).catch(() => setError("Dashboard data is unavailable. Seed the database or check the API server."));
  }, [user]);

  const metrics = useMemo(() => {
    if (!user) return [];
    if (user.role === "student") {
      return [
        { label: "Attendance", value: `${data?.metrics?.attendanceRate ?? 0}%`, hint: "Current semester", icon: CalendarDays },
        { label: "CGPA", value: data?.metrics?.cgpa ?? "8.42", hint: "Academic record", icon: GraduationCap },
        { label: "Assignments", value: data?.assignments?.length ?? 0, hint: "Open tasks", icon: ClipboardCheck },
        { label: "Resources", value: data?.resources?.length ?? 0, hint: "Recommended files", icon: BookOpen }
      ];
    }
    if (user.role === "teacher") {
      return [
        { label: "Classes", value: data?.metrics?.classes ?? 0, hint: "Assigned subjects", icon: BookOpen },
        { label: "Pending Leaves", value: data?.metrics?.pendingLeaves ?? 0, hint: "Need review", icon: ClipboardCheck },
        { label: "Marked", value: data?.metrics?.attendanceMarked ?? 0, hint: "Attendance records", icon: CalendarDays },
        { label: "Materials", value: data?.resources?.length ?? 0, hint: "Uploaded recently", icon: TrendingUp }
      ];
    }
    return [
      { label: "Students", value: data?.metrics?.students ?? 0, hint: "Active profiles", icon: Users },
      { label: "Teachers", value: data?.metrics?.teachers ?? 0, hint: "Faculty profiles", icon: GraduationCap },
      { label: "Departments", value: data?.metrics?.departments ?? 0, hint: "Academic units", icon: BookOpen },
      { label: "Events", value: data?.metrics?.events ?? 0, hint: "Campus activity", icon: CalendarDays }
    ];
  }, [data, user]);

  const attendanceTrend = [
    { day: "Mon", value: 86 },
    { day: "Tue", value: 92 },
    { day: "Wed", value: 78 },
    { day: "Thu", value: 88 },
    { day: "Fri", value: 94 }
  ];

  const adminTrend = [
    { label: "Students", value: data?.metrics?.students ?? 1 },
    { label: "Teachers", value: data?.metrics?.teachers ?? 1 },
    { label: "Courses", value: data?.metrics?.courses ?? 1 },
    { label: "Clubs", value: data?.metrics?.clubs ?? 1 }
  ];

  if (error) return <div className="panel p-6 text-sm font-semibold text-red-600 dark:text-red-300">{error}</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-100">{user?.role} dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">Good to see you, {user?.name.split(" ")[0]}</h1>
          </div>
          <button className="focus-ring h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Create update</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Section title={user?.role === "admin" ? "College Statistics" : "Performance Trend"}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {user?.role === "admin" ? (
                  <BarChart data={adminTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3478f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3478f6" fill="#d9ebff" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Priority Queue">
            <div className="space-y-3">
              {(data?.notices ?? data?.recentNotices ?? []).slice(0, 5).map((item: any) => (
                <div key={item._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.body}</p>
                </div>
              ))}
              {!data && <p className="text-sm text-slate-500">Loading dashboard intelligence...</p>}
            </div>
          </Section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
