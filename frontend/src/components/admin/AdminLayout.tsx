import { useState } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Users, Home, LogOut, FileText, MessageSquare, BookOpen, Menu, X, Link as LinkIcon } from "lucide-react";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not admin/owner/co-owner, boot them to dashboard
  if (!["admin", "co-owner", "owner"].includes(user?.role || "")) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const isOwner = user?.role === "owner" || user?.role === "co-owner";
  
  const getPanelTitle = () => {
    if (user?.role === "owner") return "Owner Panel";
    if (user?.role === "co-owner") return "Co-Owner Panel";
    return "Admin CMS";
  };
  
  const getPanelColor = () => {
    if (user?.role === "owner") return "text-red-500";
    if (user?.role === "co-owner") return "text-purple-500";
    return "text-[#FF9000]";
  };

  const navItems = [
    { label: "Overview", path: "/admin", icon: Shield, end: true },
    ...(isOwner ? [{ label: "Users", path: "/admin/users", icon: Users }] : []),
    { label: "Subjects", path: "/admin/subjects", icon: BookOpen },
    { label: "Content", path: "/admin/content", icon: FileText },
    { label: "Resources", path: "/admin/resources", icon: LinkIcon },
    ...(isOwner ? [{ label: "Feedback", path: "/admin/feedback", icon: MessageSquare }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-300">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a] md:hidden">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Shield className={getPanelColor()} size={20} />
          {getPanelTitle()}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 pt-14 md:pt-0`}>
        <div className="p-6">
          <div className="hidden md:flex items-center gap-3 text-white font-bold text-xl mb-8">
            <Shield className={getPanelColor()} />
            <h2>{getPanelTitle()}</h2>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
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
            onClick={() => setSidebarOpen(false)}
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
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
