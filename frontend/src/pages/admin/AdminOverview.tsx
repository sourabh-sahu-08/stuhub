import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Stats { totalUsers: number; totalNotes: number; totalPyqs: number; }
interface User  { _id: string; name: string; email: string; role: string; }

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`p-5 rounded-xl border bg-[#0f0f0f] flex items-center gap-4 ${color}`}>
      <div className="w-12 h-12 rounded-lg bg-[#FF9000]/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#FF9000] text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <p className="text-3xl font-extrabold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function AdminOverview() {
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
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400 mt-1">High-level statistics and settings for StuHub.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="border-[#2a2a2a]" />
        <StatCard icon="folder_open" label="Notes" value={stats.totalNotes} color="border-[#2a2a2a]" />
        <StatCard icon="description" label="PYQs" value={stats.totalPyqs} color="border-[#2a2a2a]" />
      </div>

      {/* System Settings */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">System Settings</h2>
        <div className="rounded-xl border border-[#1f1f1f] overflow-hidden bg-[#0f0f0f] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9000] to-[#E58100] flex items-center justify-center text-white shadow-lg shadow-[#FF9000]/20">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
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
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Recent Signups</h2>
        <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
          {users.slice(0, 5).map((u, i) => (
            <div key={u._id} className={`flex items-center justify-between px-4 py-3 bg-[#0f0f0f] ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] font-bold text-sm">
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.role === "admin" ? "bg-[#FF9000]/10 text-[#FF9000]" : "bg-[#1a1a1a] text-zinc-500"}`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
