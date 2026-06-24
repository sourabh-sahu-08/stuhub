import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { navItems } from "../components/layout/navigation";

export function DashboardPage() {
  const { user } = useAuth();

  const allowedModules = navItems.filter(
    (item) => item.roles.includes(user?.role as any) && item.path !== "/"
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-8 text-white shadow-xl dark:from-slate-950 dark:via-indigo-950 dark:to-black">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <Sparkles size={12} />
              Welcome to College OS
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Good day, {user?.name}
            </h1>
            <p className="mt-2 text-indigo-200/80 text-sm leading-relaxed">
              Your academic workspace is active and authenticated. All modules have been reset to a clean baseline, ready to be rebuilt from scratch.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {/* User Workspace Info */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Role</p>
            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white capitalize">{user?.role}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</p>
            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white truncate">{user?.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Database Status</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected & Seeded
            </span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Modules</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Explore the features and select one to start building from scratch.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allowedModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-400"
                >
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      Ready to build your custom {item.label.toLowerCase()} feature from scratch.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open module <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
