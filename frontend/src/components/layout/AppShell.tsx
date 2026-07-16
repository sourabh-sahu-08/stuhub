import {
  ChevronDown,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { io } from "socket.io-client";

import { CompleteProfileModal } from "../auth/CompleteProfileModal";
import { useAuth } from "../../context/AuthContext";
import { navGroups } from "./navigation";

export function AppShell() {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Close menus when route changes */
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* Close overlays with Escape */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* Lock body scroll only while mobile drawer is open */
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* Existing socket notification logic */
  useEffect(() => {
    if (!user) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000"
    );

    socket.emit("join", user.id);
    socket.on("notification", setToast);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const NavigationContent = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <>
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 select-none"
            onClick={() => {
              if (mobile) setMobileMenuOpen(false);
            }}
          >
            <img 
              src="/fvicon.png" 
              alt="Stuhub Logo" 
              className="h-12 w-12 object-contain shrink-0 bg-black rounded-lg p-1"
            />
          </Link>

          {mobile && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-surface-container-high hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524]"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-6" aria-label="Primary navigation">
          {[
            ...navGroups,
            ...(user?.role === 'admin' ? [{
              groupName: "ADMINISTRATION",
              items: [{ label: "Admin Panel", path: "/dashboard/admin", materialIcon: "admin_panel_settings", icon: undefined }]
            }] : [])
          ].map((group) => (
            <div key={group.groupName}>
              <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {group.groupName}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    onClick={() => {
                      if (mobile) setMobileMenuOpen(false);
                    }}
                    className={({ isActive }) =>
                      [
                        "relative flex min-w-0 items-center gap-3 rounded-md px-2 py-2",
                        "transition-colors duration-150",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524]",
                        isActive
                          ? "font-semibold text-zinc-50"
                          : "text-zinc-500 hover:bg-surface-container hover:text-zinc-50",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute -left-3 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#F5A524]" />
                        )}

                        <span
                          className={[
                            "material-symbols-outlined shrink-0 text-[20px]",
                            isActive
                              ? "text-[#F5A524]"
                              : "text-zinc-500",
                          ].join(" ")}
                        >
                          {item.materialIcon}
                        </span>

                        <span className="truncate text-sm">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-2 border-t border-outline pt-4">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E]" />

        <span className="truncate text-[10px] uppercase tracking-wider text-zinc-400">
          Connected as {user?.role}
        </span>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-background text-zinc-200">
      <div className="flex min-h-[100dvh] w-full">
        {/* =====================================================
            DESKTOP SIDEBAR
            Completely removed below md breakpoint
        ====================================================== */}
        <aside className="hidden h-[100dvh] w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-outline bg-surface p-6 md:sticky md:top-0 md:flex">
          <NavigationContent />
        </aside>

        {/* =====================================================
            MOBILE DRAWER
            Fixed overlay — never reserves layout width
        ====================================================== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(82vw,300px)] flex-col justify-between overflow-y-auto border-r border-outline bg-surface p-6 md:hidden"
              >
                <NavigationContent mobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* =====================================================
            MAIN APPLICATION REGION
        ====================================================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline bg-black/85 px-4 backdrop-blur-md sm:px-6">
            {/* Left side */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="shrink-0 rounded-md p-2 text-zinc-400 transition-colors hover:bg-surface-container hover:text-[#F5A524] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              {/* Mobile logo */}
              <Link
                to="/"
                className="flex min-w-0 items-center gap-2 md:hidden"
              >
                <img 
                  src="/fvicon.png" 
                  alt="Stuhub Logo" 
                  className="h-10 w-10 object-contain shrink-0 bg-black rounded-lg p-1"
                />
              </Link>

              {/* Desktop search */}
              <div className="relative hidden w-full max-w-sm md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-zinc-500">
                  search
                </span>

                <input
                  type="text"
                  placeholder="Search Workspace..."
                  className="w-full rounded-md border border-outline bg-surface-container py-2 pl-10 pr-3 text-xs text-zinc-200 outline-none transition-colors placeholder:text-zinc-500 focus:border-[#F5A524]"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3">


              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setProfileDropdownOpen((current) => !current)
                  }
                  className="flex items-center gap-2 rounded-md border border-outline bg-surface-container p-1.5 transition-colors hover:border-[#52525B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] md:px-3"
                  aria-expanded={profileDropdownOpen}
                  aria-label="Open profile menu"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-[#292929] text-xs font-bold uppercase text-[#F5A524]">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name ?? "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.slice(0, 1) ?? "U"
                    )}
                  </div>

                  <div className="hidden min-w-0 flex-col text-left md:flex">
                    <span className="max-w-[110px] truncate text-xs font-semibold text-zinc-50">
                      {user?.name}
                    </span>

                    <span className="text-[9px] uppercase tracking-wider text-zinc-400">
                      {user?.role}
                    </span>
                  </div>

                  <ChevronDown
                    size={13}
                    className="hidden shrink-0 text-zinc-500 md:block"
                  />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] rounded-md border border-outline bg-surface p-2.5 shadow-2xl"
                    >
                      <div className="border-b border-outline px-2 pb-2 pt-1">
                        <p className="truncate text-xs font-bold text-white">
                          {user?.name}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-500">
                          {user?.email}
                        </p>
                      </div>

                      <div className="mt-2 space-y-1">
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md p-2 text-xs text-zinc-200 transition-colors hover:bg-surface-container"
                        >
                          <UserIcon
                            size={14}
                            className="text-[#F5A524]"
                          />
                          My Profile
                        </Link>

                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-md p-2 text-left text-xs text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut size={14} />
                          Exit Portal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-[60] rounded-md border border-outline bg-surface-container p-4 shadow-lg sm:left-auto sm:right-6 sm:max-w-sm">
          <p className="text-sm font-bold text-[#F5A524]">
            {toast.title}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {toast.body}
          </p>
        </div>
      )}

      <CompleteProfileModal />
    </div>
  );
}

export default AppShell;