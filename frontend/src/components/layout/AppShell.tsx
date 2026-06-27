import { Menu, Moon, Search, Sun, X, Bell, ChevronDown, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { navItems } from "./navigation";
import { CompleteProfileModal } from "../auth/CompleteProfileModal";

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const location = useLocation();
  const items = useMemo(() => navItems, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000");
    socket.emit("join", user.id);
    socket.on("notification", setToast);
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-mist text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 p-4 shadow-soft transition dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="group flex items-center gap-2 select-none">
            <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-white text-lg">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-950 dark:text-white block group-hover:text-brand-500 transition-colors">Stuhub</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-500 font-bold block -mt-1">{user?.role} Portal</span>
            </div>
          </Link>
          <button className="focus-ring rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6 space-y-1" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Layout */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-mist/85 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 sm:px-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button className="focus-ring rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                <Menu size={20} />
              </button>
              <div className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 sm:flex">
                <Search size={16} />
                Search classes, people, resources
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notification Bell with red bubble */}
              <button className="relative focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Notifications">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  9+
                </span>
              </button>

              {/* JobLuxe User Profile Card */}
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
                <Link to="/dashboard" className="flex items-center gap-2 min-w-0 group select-none">
                  {/* Circular Avatar Progress Ring (25%) */}
                  <div className="relative flex items-center justify-center h-8 w-8">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="13" className="stroke-slate-200 dark:stroke-slate-850 fill-none" strokeWidth="2" />
                      <circle cx="16" cy="16" r="13" className="stroke-brand-500 fill-none" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 13}`} strokeDashoffset={`${2 * Math.PI * 13 * (1 - 0.25)}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute h-6.5 w-6.5 rounded-full bg-slate-950/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold uppercase">
                      {user?.name.slice(0, 1)}
                    </div>
                  </div>
                  <div className="hidden min-w-0 sm:flex items-center gap-1">
                    <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-brand-500 transition-colors">{user?.name}</span>
                    <span className="text-[10px] text-brand-500 font-bold">25%</span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                </Link>
                <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 h-5" />
                <button className="text-xs text-slate-500 hover:text-red-500 font-medium whitespace-nowrap" onClick={logout}>Sign out</button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      {/* Floating Green AI Studio Assistant Button */}
      <Link
        to="/ai"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 hover:bg-brand-600 hover:shadow-brand-500/20"
        aria-label="AI Studio Assistant"
      >
        <MessageSquare size={24} />
      </Link>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-24 z-50 max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.body}</p>
        </div>
      )}

      {/* Mandatory Social Login Profile Completion Modal */}
      <CompleteProfileModal />
    </div>
  );
}
