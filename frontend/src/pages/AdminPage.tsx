import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────
interface Stats { totalUsers: number; totalNotes: number; totalPyqs: number; }
interface User  { _id: string; name: string; email: string; role: "student" | "admin"; createdAt: string; }
interface Note  { _id: string; title: string; subject: string; branch: string; semester: number; fileName: string; createdAt: string; user?: { name: string; email: string }; }
interface Pyq   { _id: string; title: string; subject: string; year: number; branch: string; fileName: string; createdAt: string; uploadedBy?: { name: string; email: string }; }

type Tab = "overview" | "users" | "notes" | "pyqs";

// ── Stat Card ─────────────────────────────────────────────────────────────
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

// ── Confirm Dialog ────────────────────────────────────────────────────────
function useConfirm() {
  const confirm = (msg: string) => window.confirm(msg);
  return confirm;
}

// ── Main Component ────────────────────────────────────────────────────────
export function AdminPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [tab, setTab]       = useState<Tab>("overview");
  const [stats, setStats]   = useState<Stats>({ totalUsers: 0, totalNotes: 0, totalPyqs: 0 });
  const [users, setUsers]   = useState<User[]>([]);
  const [notes, setNotes]   = useState<Note[]>([]);
  const [pyqs,  setPyqs]    = useState<Pyq[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, n, p, set] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/notes"),
        api.get("/admin/pyqs"),
        api.get("/settings"),
      ]);
      setStats(s.data);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setNotes(Array.isArray(n.data) ? n.data : []);
      setPyqs(Array.isArray(p.data)  ? p.data  : []);
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
      showToast(`AI Chatbot is now ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error(error);
      showToast("Failed to update AI settings");
    }
  };

  // ── User actions ────────────────────────────────────────────────────────
  const toggleRole = async (u: User) => {
    const newRole = u.role === "admin" ? "student" : "admin";
    await api.put(`/admin/users/${u._id}/role`, { role: newRole });
    setUsers(prev => prev.map(x => x._id === u._id ? { ...x, role: newRole } : x));
    showToast(`${u.name} is now ${newRole}`);
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Delete "${u.name}"? This is permanent.`)) return;
    await api.delete(`/admin/users/${u._id}`);
    setUsers(prev => prev.filter(x => x._id !== u._id));
    setStats(s => ({ ...s, totalUsers: s.totalUsers - 1 }));
    showToast("User deleted");
  };

  // ── Note actions ────────────────────────────────────────────────────────
  const deleteNote = async (n: Note) => {
    if (!confirm(`Delete note "${n.title}"?`)) return;
    await api.delete(`/admin/notes/${n._id}`);
    setNotes(prev => prev.filter(x => x._id !== n._id));
    setStats(s => ({ ...s, totalNotes: s.totalNotes - 1 }));
    showToast("Note deleted");
  };

  // ── PYQ actions ─────────────────────────────────────────────────────────
  const deletePyq = async (p: Pyq) => {
    if (!confirm(`Delete PYQ "${p.title}"?`)) return;
    await api.delete(`/admin/pyqs/${p._id}`);
    setPyqs(prev => prev.filter(x => x._id !== p._id));
    setStats(s => ({ ...s, totalPyqs: s.totalPyqs - 1 }));
    showToast("PYQ deleted");
  };

  // ── Access guard ────────────────────────────────────────────────────────
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400">lock</span>
        <p className="text-white font-bold text-lg">Access Denied</p>
        <p className="text-zinc-500 text-sm">You don't have permission to view the admin panel.</p>
      </div>
    );
  }

  // ── Nav tabs ─────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview",  icon: "dashboard"         },
    { id: "users",    label: "Users",     icon: "group"             },
    { id: "notes",    label: "Notes",     icon: "folder_open"       },
    { id: "pyqs",     label: "PYQs",      icon: "description"       },
  ];

  const q = search.toLowerCase();

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q) || n.branch.toLowerCase().includes(q));
  const filteredPyqs  = pyqs.filter(p  => p.title.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q));

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF9000] text-black text-sm font-bold px-5 py-3 rounded-xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Full control over all platform content and users</p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 border border-[#2a2a2a] px-4 py-2 rounded-lg hover:text-white hover:border-[#444] transition"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-[#1f1f1f]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#FF9000] text-[#FF9000]"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[#111] border border-[#1f1f1f]" />)}
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ──────────────────────────────────────────────── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="group"       label="Total Users" value={stats.totalUsers} color="border-[#2a2a2a]" />
                <StatCard icon="folder_open" label="Notes"       value={stats.totalNotes} color="border-[#2a2a2a]" />
                <StatCard icon="description" label="PYQs"        value={stats.totalPyqs}  color="border-[#2a2a2a]" />
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

              {/* Recent Notes */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-400 mb-3">Recent Notes</h2>
                <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
                  {notes.slice(0, 5).map((n, i) => (
                    <div key={n._id} className={`flex items-center justify-between px-4 py-3 bg-[#0f0f0f] ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-zinc-600 text-[18px]">description</span>
                        <div>
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-zinc-500">{n.subject} · {n.branch} · Sem {n.semester}</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ─────────────────────────────────────────────────── */}
          {tab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[16px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users…"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF9000]/40"
                  />
                </div>
                <span className="text-xs text-zinc-600">{filteredUsers.length} users</span>
              </div>

              <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="bg-[#0f0f0f] hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] font-bold text-sm shrink-0">
                              {u.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{u.name}</p>
                              <p className="text-xs text-zinc-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.role === "admin" ? "bg-[#FF9000]/10 text-[#FF9000] border border-[#FF9000]/20" : "bg-[#1a1a1a] text-zinc-400"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right space-x-3">
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={user?.id === u._id}
                            className="text-xs font-semibold text-[#FF9000] hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {u.role === "admin" ? "Demote" : "Promote"}
                          </button>
                          <button
                            onClick={() => deleteUser(u)}
                            disabled={user?.id === u._id}
                            className="text-xs font-semibold text-red-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-12 text-center text-zinc-600 text-sm">No users found</div>
                )}
              </div>
            </div>
          )}

          {/* ── NOTES ─────────────────────────────────────────────────── */}
          {tab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[16px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search notes…"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF9000]/40"
                  />
                </div>
                <span className="text-xs text-zinc-600">{filteredNotes.length} notes</span>
              </div>

              <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Subject</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Branch / Sem</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Uploaded By</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    {filteredNotes.map(n => (
                      <tr key={n._id} className="bg-[#0f0f0f] hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-zinc-600 text-[16px]">description</span>
                            <span className="font-medium text-white truncate max-w-[180px]">{n.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600 pl-6">{n.fileName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{n.subject}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{n.branch} · Sem {n.semester}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{n.user?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteNote(n)}
                            className="text-xs font-semibold text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredNotes.length === 0 && (
                  <div className="py-12 text-center text-zinc-600 text-sm">No notes found</div>
                )}
              </div>
            </div>
          )}

          {/* ── PYQs ──────────────────────────────────────────────────── */}
          {tab === "pyqs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[16px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search PYQs…"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF9000]/40"
                  />
                </div>
                <span className="text-xs text-zinc-600">{filteredPyqs.length} papers</span>
              </div>

              <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Subject</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Branch / Year</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Uploaded By</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    {filteredPyqs.map(p => (
                      <tr key={p._id} className="bg-[#0f0f0f] hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-zinc-600 text-[16px]">quiz</span>
                            <span className="font-medium text-white truncate max-w-[180px]">{p.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600 pl-6">{p.fileName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{p.subject}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{p.branch} · {p.year}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{p.uploadedBy?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deletePyq(p)}
                            className="text-xs font-semibold text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPyqs.length === 0 && (
                  <div className="py-12 text-center text-zinc-600 text-sm">No PYQs found</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;
