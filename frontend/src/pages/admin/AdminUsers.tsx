import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Search, ShieldAlert, Trash2, Users } from "lucide-react";

interface User { _id: string; name: string; email: string; role: "student" | "admin"; createdAt: string; }

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const u = await api.get("/admin/users");
      setUsers(Array.isArray(u.data) ? u.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (u: User) => {
    const newRole = u.role === "admin" ? "student" : "admin";
    if (!window.confirm(`Change role of ${u.name} to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${u._id}/role`, { role: newRole });
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to update user role");
    }
  };

  const deleteUser = async (u: User) => {
    if (!window.confirm(`Are you sure you want to delete ${u.name}?`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#1f1f1f] rounded w-1/4"></div>
      <div className="h-10 bg-[#1f1f1f] rounded-xl w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users Management</h1>
          <p className="text-zinc-400 mt-1">Manage user roles and accounts.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-[#111] border border-[#333] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all shadow-lg"
          />
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
            <thead className="bg-[#111] text-xs uppercase border-b border-[#222]">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-300">User</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Role</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Joined</th>
                <th className="px-6 py-4 font-semibold text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-[#111] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] font-bold shadow-inner">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider border ${u.role === "admin" ? "bg-[#FF9000]/10 text-[#FF9000] border-[#FF9000]/20" : "bg-[#222] text-zinc-400 border-[#333]"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleRole(u)} className="p-2 text-zinc-500 hover:text-[#FF9000] hover:bg-[#FF9000]/10 rounded-lg transition-colors" title="Toggle Role">
                        <ShieldAlert size={16} />
                      </button>
                      <button onClick={() => deleteUser(u)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 flex flex-col items-center">
                    <Users size={32} className="mb-4 opacity-30" />
                    <p>No users found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
