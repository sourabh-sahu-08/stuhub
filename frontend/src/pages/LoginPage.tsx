import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

const demoAccounts = [
  { label: "Student", email: "student@collegeos.edu", role: "student" as Role }
];

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role] = useState<Role>("student");
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
          <div className="panel w-full max-w-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white mb-1">
                {mode === "login" ? "Sign in" : "Create your account"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mode === "login" ? "Access your student workspace" : "Get started with your student command center"}
              </p>
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
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
              <button className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={loading}>
                {loading ? "Please wait" : mode === "login" ? "Enter workspace" : "Create account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {mode === "login" ? (
                <>
                  New to College OS?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setName("");
                      setEmail("");
                      setPassword("");
                      setError("");
                    }}
                    className="font-bold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setName("Riya Sharma");
                      setEmail("student@collegeos.edu");
                      setPassword("password123");
                      setError("");
                    }}
                    className="font-bold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {mode === "login" && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("student@collegeos.edu");
                    setPassword("password123");
                  }}
                  className="w-full h-11 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-600 dark:hover:border-brand-400 text-xs font-bold transition flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  Auto-fill Student Demo Account
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
