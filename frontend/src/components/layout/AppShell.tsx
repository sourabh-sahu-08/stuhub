import { Menu, Moon, Search, Sun, X, Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { navGroups } from "./navigation";
import { CompleteProfileModal } from "../auth/CompleteProfileModal";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key listener to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock scroll on body when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <div className="min-h-screen w-full bg-[#09090B] text-[#e2e2e2] font-sans flex overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      {/* 
        On Mobile (< 768px): position: fixed, width: min(82vw, 300px), off-screen default, z-50 overlay.
        On Desktop (>= 768px): position: static, width: 256px (w-64), visible, flex sibling.
      */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-0 h-[100dvh] md:h-auto w-[min(82vw,300px)] md:w-64 flex-shrink-0 bg-[#0F0F12] border-r border-[#27272D] flex flex-col justify-between p-6 transition-transform duration-300 md:transition-none md:transform-none ${
          open ? "translate-x-0 flex" : "-translate-x-full hidden md:flex"
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="flex items-center justify-between md:justify-start gap-md mb-2xl">
            <Link to="/dashboard" className="flex items-center gap-md select-none">
              <span className="material-symbols-outlined text-[#F5A524] text-[28px]">terminal</span>
              <h1 className="font-display-lg text-headline-md font-bold tracking-tight text-on-surface">
                StuHub <span className="text-primary font-mono text-xs">OS_V1</span>
              </h1>
            </Link>
            <button
              className="md:hidden p-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-xl" aria-label="Primary">
            {navGroups.map((group) => (
              <div key={group.groupName}>
                <p className="font-label-sm text-[10px] text-on-surface-variant mb-md tracking-[0.2em] opacity-40 uppercase">
                  {group.groupName}
                </p>
                <div className="space-y-xs">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center gap-md py-sm px-md transition-colors duration-200 relative outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded ${
                          isActive
                            ? "text-[#FAFAFA] font-semibold"
                            : "text-[#71717A] hover:text-on-surface"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <div className="active-indicator" />}
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              isActive ? "text-[#F5A524]" : "text-[#71717A]"
                            }`}
                          >
                            {item.materialIcon}
                          </span>
                          <span className="font-label-md text-label-md">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="pt-md border-t border-[#27272D] flex items-center gap-sm">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span className="font-label-sm text-[10px] text-[#A1A1AA] uppercase tracking-wider">
            Connected as {user?.role}
          </span>
        </div>
      </aside>

      {/* Sidebar Backdrop Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content Layout Container */}
      <div className="flex-grow flex flex-col min-w-0 max-w-full relative w-full">
        
        {/* Header - Sticky, acts as mobile header and desktop header */}
        <header className="sticky top-0 z-30 h-16 bg-[#000000]/85 backdrop-blur-md border-b border-[#27272D] flex items-center justify-between px-4 sm:px-6 w-full">
          <div className="flex items-center gap-md max-w-[60%] flex-1">
            {/* Hamburger / Menu button (visible on mobile only) */}
            <button
              className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            {/* Mobile StuHub Logo (visible on mobile only) */}
            <Link to="/dashboard" className="flex items-center gap-1.5 md:hidden select-none mr-2">
              <span className="material-symbols-outlined text-[#F5A524] text-[20px]">terminal</span>
              <span className="font-bold text-sm text-white font-mono">StuHub</span>
            </Link>
            
            {/* Search bar (visible on desktop and tablet, hidden on mobile) */}
            <div className="relative w-full max-w-sm hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                search
              </span>
              <input
                className="w-full bg-[#16161A] border border-[#27272D] rounded pl-10 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-colors text-[#e2e2e2] placeholder-on-surface-variant/40"
                placeholder="Search Workspace..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications Button */}
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all relative cursor-pointer" aria-label="Notifications">
              notifications
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                9
              </span>
            </button>
            
            {/* Performance Mode */}
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all cursor-pointer" aria-label="Performance Mode">
              bolt
            </button>

            {/* Profile Avatar Control (Compact on mobile) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-[#16161A] border border-[#27272D] p-1 sm:px-3 sm:py-1.5 rounded hover:border-[#808080] transition-colors cursor-pointer select-none"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-surface-container-highest overflow-hidden border border-outline flex items-center justify-center font-bold text-xs uppercase text-primary">
                  {user?.avatar ? (
                    <img className="w-full h-full object-cover" src={user.avatar} alt={user.name} />
                  ) : (
                    user?.name.slice(0, 1)
                  )}
                </div>
                {/* Username label hidden on mobile */}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-on-surface truncate max-w-[90px]">
                    {user?.name}
                  </span>
                  <span className="text-[9px] text-[#A1A1AA] uppercase tracking-wider font-mono">
                    {user?.role}
                  </span>
                </div>
                <ChevronDown size={12} className="text-on-surface-variant hidden md:block" />
              </button>

              {/* Profile Dropdown Panel */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded border border-outline bg-[#0F0F12] shadow-2xl p-2.5 z-50 text-xs space-y-2.5"
                  >
                    <div className="pb-2 border-b border-[#27272D] px-2 pt-1">
                      <p className="font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate font-mono mt-0.5">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-2 p-2 rounded hover:bg-[#16161A] text-on-surface transition-colors"
                      >
                        <UserIcon size={14} className="text-primary" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-red-500/10 text-red-500 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Exit Portal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Viewport Canvas */}
        <main className="flex-grow p-4 sm:p-8 min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Toast alert system notifications */}
      {toast && (
        <div className="fixed bottom-4 right-6 z-50 max-w-sm rounded border border-[#27272D] bg-[#16161A] p-md shadow-lg">
          <p className="text-sm font-bold text-primary">{toast.title}</p>
          <p className="mt-1 text-xs text-[#A3A3A3]">{toast.body}</p>
        </div>
      )}

      {/* Complete Profile Guardianship */}
      <CompleteProfileModal />
    </div>
  );
}
export default AppShell;
