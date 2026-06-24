import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

const demoAccounts = [
  { label: "Student", email: "student@collegeos.edu", role: "student" as Role },
  { label: "Teacher", email: "teacher@collegeos.edu", role: "teacher" as Role },
  { label: "Admin", email: "admin@collegeos.edu", role: "admin" as Role }
];

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("Riya Sharma");
  const [email, setEmail] = useState("student@collegeos.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register({ name, email, password, role });
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex min-h-[44rem] items-center overflow-hidden px-6 py-12 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.30),transparent_32%),linear-gradient(140deg,#101827,#0b1020_45%,#172033)]" />
          <div className="relative max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
              <GraduationCap size={18} />
              Unified campus command center
            </div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold tracking-normal sm:text-7xl">
              College OS
            </motion.h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              One responsive platform for academics, attendance, placements, clubs, library resources, AI study workflows, and campus operations.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["JWT and RBAC security", "Live Socket.io notifications", "Role-specific dashboards", "MongoDB domain models"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <CheckCircle2 className="text-emerald-300" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-mist px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
          <div className="panel w-full max-w-md p-5">
            <div className="mb-5 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
              {(["login", "register"] as const).map((item) => (
                <button key={item} className={`focus-ring h-10 flex-1 rounded-md text-sm font-bold capitalize ${mode === item ? "bg-white shadow-sm dark:bg-slate-800" : "text-slate-500"}`} onClick={() => setMode(item)}>
                  {item}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "register" && (
                <label className="block text-sm font-semibold">
                  Full name
                  <input className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" value={name} onChange={(event) => setName(event.target.value)} />
                </label>
              )}
              <label className="block text-sm font-semibold">
                Email
                <input className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Password
                <input className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              {mode === "register" && (
                <div className="grid grid-cols-3 gap-2">
                  {(["student", "teacher", "admin"] as Role[]).map((item) => (
                    <button type="button" key={item} className={`focus-ring h-10 rounded-lg text-sm font-bold capitalize ${role === item ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`} onClick={() => setRole(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
              <button className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={loading}>
                {loading ? "Please wait" : mode === "login" ? "Enter workspace" : "Create account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {demoAccounts.map((account) => (
                <button key={account.email} className="focus-ring rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold dark:border-slate-800" onClick={() => setEmail(account.email)}>
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
