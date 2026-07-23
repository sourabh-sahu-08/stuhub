import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Users, Home, LogOut, FileText, MessageSquare } from "lucide-react";

export function AdminLayout() {
  const { user, logout } = useAuth();

  // If not admin, boot them to dashboard
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { label: "Overview", path: "/admin", icon: Shield, end: true },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Content", path: "/admin/content", icon: FileText },
    { label: "Feedback", path: "/admin/feedback", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white font-bold text-xl mb-8">
            <Shield className="text-[#FF9000]" />
            <h2>Admin CMS</h2>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#FF9000]/10 text-[#FF9000] font-medium"
                      : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-white"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[#1a1a1a]">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <Home size={18} />
            Back to App
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left mt-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
