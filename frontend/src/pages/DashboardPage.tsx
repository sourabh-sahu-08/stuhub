import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { navItems } from "../components/layout/navigation";
import { useState, FormEvent } from "react";

export function DashboardPage() {
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState("");

  const allowedModules = navItems.filter(
    (item) => item.path !== "/dashboard" &&
    (filterQuery === "" || item.label.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* JobLuxe Inspired Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-black p-8 text-white shadow-xl dark:from-slate-950 dark:via-black dark:to-slate-950">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-500 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
              CAMPUS WORKSPACE ACTIVE NOW
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Find Your Dream Study <br />
              <span className="text-brand-500">Build Your Future</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Welcome back, {user?.name}. Your student portal is active, authenticated, and fully clean. Filter the workspace modules below to begin building.
            </p>

            {/* Filter Search Input */}
            <form onSubmit={handleSearchSubmit} className="max-w-md bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10 flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 text-slate-400">
                <Search size={16} />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter workspace modules..."
                  className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-brand-500 text-xs font-bold text-white flex items-center gap-1.5 transition hover:bg-brand-600 active:scale-95"
              >
                Search <ArrowRight size={12} />
              </button>
            </form>

            {/* Bottom check highlights */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-semibold select-none pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                1000+ Students
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                95% Success Rate
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-500" size={15} />
                Expert Mentorship
              </div>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
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
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-brand-500"
                >
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950/50 dark:text-brand-500">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-500 transition-colors">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      Ready to build your custom {item.label.toLowerCase()} feature from scratch.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open module <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
            {allowedModules.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">No active modules match your filter query.</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
