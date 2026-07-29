import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Trash2, 
  ChevronRight,
  LogOut,
  Moon,
  Laptop
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

type Tab = "account" | "preferences" | "notifications" | "security";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // State for Preferences
  const [stealthMode, setStealthMode] = useState(false);
  const [publicDiscovery, setPublicDiscovery] = useState(true);

  // State for Notifications
  const [notifications, setNotifications] = useState({
    upcomingDeadlines: true,
    aiAnalysisComplete: true,
    peerActivity: false
  });

  useEffect(() => {
    // Fetch user settings when component mounts
    const fetchSettings = async () => {
      try {
        const response = await api.get("/auth/settings");
        if (response.data) {
          setStealthMode(response.data.stealthMode || false);
          setPublicDiscovery(response.data.publicDiscovery ?? true);
          if (response.data.notifications) {
            setNotifications({
              upcomingDeadlines: response.data.notifications.upcomingDeadlines ?? true,
              aiAnalysisComplete: response.data.notifications.aiAnalysisComplete ?? true,
              peerActivity: response.data.notifications.peerActivity ?? false,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (updates: any) => {
    setLoading(true);
    setSuccessMsg("");
    try {
      await api.put("/auth/settings", updates);
      setSuccessMsg("Settings updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "preferences", label: "Preferences", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Danger", icon: Lock },
  ] as const;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? "bg-[#FF9000]/10 text-[#FF9000] font-medium" 
                    : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#FF9000]" : "text-zinc-500"} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute left-0 w-1 h-8 bg-[#FF9000] rounded-r-full md:hidden"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 md:p-8 shadow-xl">
          
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center justify-center"
            >
              {successMsg}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                    <p className="text-sm text-zinc-500 mt-1">Your basic account details.</p>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111] border border-[#222]">
                    <div className="w-16 h-16 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] text-2xl font-bold">
                      {user?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{user?.name ?? "Student"}</h3>
                      <p className="text-sm text-zinc-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Role</p>
                      <p className="text-white capitalize font-medium">{user?.role ?? "student"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Branch</p>
                      <p className="text-white font-medium">{user?.branch ?? "Not set"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Semester</p>
                      <p className="text-white font-medium">{user?.semester ?? "Not set"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Roll Number</p>
                      <p className="text-white font-medium">{user?.rollNumber ?? "Not set"}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Privacy & Preferences</h2>
                    <p className="text-sm text-zinc-500 mt-1">Manage your visibility and UI settings.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#222]">
                      <div>
                        <p className="text-sm font-medium text-white">Stealth Mode</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Hide your activity from peers in study groups</p>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => {
                          const val = !stealthMode;
                          setStealthMode(val);
                          handleSaveSettings({ stealthMode: val });
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${stealthMode ? "bg-[#FF9000]" : "bg-[#333]"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${stealthMode ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#222]">
                      <div>
                        <p className="text-sm font-medium text-white">Public Profile</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Let other students with similar courses find you</p>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => {
                          const val = !publicDiscovery;
                          setPublicDiscovery(val);
                          handleSaveSettings({ publicDiscovery: val });
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${publicDiscovery ? "bg-[#FF9000]" : "bg-[#333]"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${publicDiscovery ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                    <p className="text-sm text-zinc-500 mt-1">Choose what we notify you about.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#222]">
                      <div>
                        <p className="text-sm font-medium text-white">Upcoming Deadlines</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Reminders before assignment due dates</p>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => {
                          const val = !notifications.upcomingDeadlines;
                          const newNotifs = { ...notifications, upcomingDeadlines: val };
                          setNotifications(newNotifs);
                          handleSaveSettings({ notifications: newNotifs });
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications.upcomingDeadlines ? "bg-[#FF9000]" : "bg-[#333]"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications.upcomingDeadlines ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#222]">
                      <div>
                        <p className="text-sm font-medium text-white">AI Analysis Complete</p>
                        <p className="text-xs text-zinc-500 mt-0.5">When your PYQ paper scan finishes</p>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => {
                          const val = !notifications.aiAnalysisComplete;
                          const newNotifs = { ...notifications, aiAnalysisComplete: val };
                          setNotifications(newNotifs);
                          handleSaveSettings({ notifications: newNotifs });
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications.aiAnalysisComplete ? "bg-[#FF9000]" : "bg-[#333]"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications.aiAnalysisComplete ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-[#222]">
                      <div>
                        <p className="text-sm font-medium text-white">Peer Activity</p>
                        <p className="text-xs text-zinc-500 mt-0.5">When someone shares a note with you</p>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => {
                          const val = !notifications.peerActivity;
                          const newNotifs = { ...notifications, peerActivity: val };
                          setNotifications(newNotifs);
                          handleSaveSettings({ notifications: newNotifs });
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications.peerActivity ? "bg-[#FF9000]" : "bg-[#333]"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications.peerActivity ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Security & Password</h2>
                    <p className="text-sm text-zinc-500 mt-1">Keep your account secure.</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#111] border border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#333] flex items-center justify-center">
                        <Lock size={18} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Password</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Change your password</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-[#222] hover:bg-[#333] rounded-lg transition-colors border border-[#333]">
                      Update Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-[#222]">
                    <h2 className="text-xl font-semibold text-red-500 mb-4 flex items-center gap-2">
                      <Trash2 size={20} />
                      Danger Zone
                    </h2>
                    
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Delete Account</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-red-500 hover:text-white bg-transparent hover:bg-red-500 border border-red-500/30 hover:border-red-500 rounded-lg transition-colors shrink-0">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
