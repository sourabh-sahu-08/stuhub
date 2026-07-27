import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Users, Folder, FileText, Bot } from "lucide-react";

interface Stats { totalUsers: number; totalNotes: number; totalPyqs: number; }
interface User  { _id: string; name: string; email: string; role: string; }

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl border border-[#222] bg-[#111] flex items-center gap-5 hover:border-[#FF9000]/50 transition-colors shadow-lg">
      <div className="w-14 h-14 rounded-xl bg-[#FF9000]/10 flex items-center justify-center shrink-0">
        <Icon className="text-[#FF9000]" size={24} />
      </div>
      <div>
        <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-extrabold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "co-owner";
  
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalNotes: 0, totalPyqs: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [s, u, set] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/settings"),
      ]);
      setStats(s.data);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setAiEnabled(set.data?.isAiChatbotEnabled ?? true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAiChatbot = async () => {
    try {
      const newStatus = !aiEnabled;
      await api.put("/settings/ai-chatbot", { isAiChatbotEnabled: newStatus });
      setAiEnabled(newStatus);
      alert(`AI Chatbot is now ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update AI settings");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#1f1f1f] rounded w-1/4"></div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1f1f1f] rounded-xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-zinc-400 mt-1">High-level statistics and settings for StuHub.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={Folder} label="Notes" value={stats.totalNotes} />
        <StatCard icon={FileText} label="PYQs" value={stats.totalPyqs} />
      </div>

      {isOwner && (
        <>
          {/* System Settings */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">System Settings</h2>
            <div className="rounded-2xl border border-[#222] overflow-hidden bg-[#111] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9000] to-[#E58100] flex items-center justify-center text-black shadow-lg shadow-[#FF9000]/20">
                  <Bot size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Global AI Chatbot</p>
                  <p className="text-xs text-zinc-500">Enable or disable the floating AI assistant site-wide.</p>
                </div>
              </div>
              <button
                onClick={toggleAiChatbot}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aiEnabled ? 'bg-[#FF9000]' : 'bg-[#333]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Recent Signups</h2>
            <div className="rounded-2xl border border-[#222] overflow-hidden shadow-lg bg-[#111]">
              {users.slice(0, 5).map((u, i) => (
                <div key={u._id} className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 ${i !== 0 ? "border-t border-[#222]" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] font-bold text-sm shadow-inner">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider border ${
                    u.role === "owner" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    u.role === "co-owner" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    u.role === "admin" ? "bg-[#FF9000]/10 text-[#FF9000] border-[#FF9000]/20" : 
                    "bg-[#222] text-zinc-400 border-[#333]"
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
