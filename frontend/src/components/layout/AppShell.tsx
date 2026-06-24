import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { navItems } from "./navigation";

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
    <div className="min-h-screen bg-mist text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 p-4 shadow-soft transition dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="group block select-none">
            <p className="text-lg font-extrabold tracking-normal text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">College OS</p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-600 dark:text-brand-100 transition-colors group-hover:text-indigo-500">{user?.role} portal</p>
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
              className={({ isActive }) => `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-mist/85 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="focus-ring rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <div className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 sm:flex">
              <Search size={16} />
              Search classes, people, resources
            </div>
            <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">{user?.name.slice(0, 1)}</div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <button className="text-xs text-slate-500 hover:text-brand-600" onClick={logout}>Sign out</button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.body}</p>
        </div>
      )}
    </div>
  );
}
