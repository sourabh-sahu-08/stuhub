import { useEffect, useState } from "react";
import { api } from "../../lib/api";

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
          <h1 className="text-2xl font-bold text-white">Users Management</h1>
          <p className="text-zinc-400 mt-1">Manage user roles and accounts.</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF9000] transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-[#0f0f0f] text-xs uppercase border-b border-[#1f1f1f]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-[#0f0f0f] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] font-bold">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.role === "admin" ? "bg-[#FF9000]/10 text-[#FF9000]" : "bg-[#1a1a1a] text-zinc-500"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleRole(u)} className="p-1.5 text-zinc-400 hover:text-[#FF9000] hover:bg-[#FF9000]/10 rounded transition-colors" title="Toggle Role">
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    </button>
                    <button onClick={() => deleteUser(u)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete User">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
