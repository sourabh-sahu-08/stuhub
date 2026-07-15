import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Stats {
  totalUsers: number;
  totalNotes: number;
  totalPyqs: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt: string;
}

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users")
      ]);
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "student" | "admin") => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-zinc-500 bg-background min-h-screen">
        You do not have permission to access the admin panel.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 space-y-8 bg-background min-h-screen text-zinc-200">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">admin_panel_settings</span>
          Admin Dashboard
        </h1>
        <p className="text-sm text-zinc-400">Manage users, content, and view platform statistics.</p>
      </header>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-surface-container rounded-2xl border border-outline" />
            ))}
          </div>
          <div className="h-96 bg-surface-container rounded-2xl border border-outline" />
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container border border-outline shadow-sm flex flex-col justify-between hover:border-primary/50 transition">
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Users</div>
              <div className="text-4xl font-extrabold text-white mt-4">{stats?.totalUsers || 0}</div>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container border border-outline shadow-sm flex flex-col justify-between hover:border-primary/50 transition">
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Notes</div>
              <div className="text-4xl font-extrabold text-white mt-4">{stats?.totalNotes || 0}</div>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container border border-outline shadow-sm flex flex-col justify-between hover:border-primary/50 transition">
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total PYQs</div>
              <div className="text-4xl font-extrabold text-white mt-4">{stats?.totalPyqs || 0}</div>
            </div>
          </section>

          {/* User Management Section */}
          <section className="bg-surface-container border border-outline rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-outline bg-surface flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Registered Users</h2>
              <span className="text-xs font-mono text-zinc-500 bg-background px-3 py-1 rounded-full border border-outline">
                {users.length} Users
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50 text-zinc-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{u.name}</span>
                          <span className="text-xs text-zinc-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          u.role === 'admin' 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-background border border-outline text-zinc-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'student' : 'admin')}
                          disabled={user?.id === u._id} // Cannot change own role
                          className="text-xs font-semibold text-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={user?.id === u._id} // Cannot delete self
                          className="text-xs font-semibold text-red-500 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
