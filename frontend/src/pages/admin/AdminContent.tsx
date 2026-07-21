import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Note { _id: string; title: string; subject: string; branch: string; semester: number; fileName: string; createdAt: string; user?: { name: string; email: string }; }
interface Pyq  { _id: string; title: string; subject: string; year: number; branch: string; fileName: string; createdAt: string; uploadedBy?: { name: string; email: string }; }
interface Assignment { _id: string; title: string; course: string; dueDate: string; status: string; userId?: { name: string; email: string }; }

export function AdminContent() {
  const [tab, setTab] = useState<"notes" | "pyqs" | "assignments">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [n, p, a] = await Promise.all([
        api.get("/admin/notes"),
        api.get("/admin/pyqs"),
        api.get("/admin/assignments"),
      ]);
      setNotes(Array.isArray(n.data) ? n.data : []);
      setPyqs(Array.isArray(p.data) ? p.data : []);
      setAssignments(Array.isArray(a.data) ? a.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (n: Note) => {
    if (!window.confirm(`Delete note "${n.title}"?`)) return;
    try {
      await api.delete(`/admin/notes/${n._id}`);
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to delete note");
    }
  };

  const deletePyq = async (p: Pyq) => {
    if (!window.confirm(`Delete PYQ "${p.title}"?`)) return;
    try {
      await api.delete(`/admin/pyqs/${p._id}`);
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to delete PYQ");
    }
  };

  const deleteAssignment = async (a: Assignment) => {
    if (!window.confirm(`Delete assignment "${a.title}"?`)) return;
    try {
      await api.delete(`/admin/assignments/${a._id}`);
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to delete assignment");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#1f1f1f] rounded w-1/4"></div>
      <div className="h-10 bg-[#1f1f1f] rounded-xl w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <p className="text-zinc-400 mt-1">Manage notes, previous year questions, and assignments uploaded by users.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-[#1f1f1f]">
        <button
          onClick={() => setTab("notes")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === "notes" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          Notes
        </button>
          <button
            onClick={() => setTab("pyqs")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "pyqs" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            PYQs
          </button>
          <button
            onClick={() => setTab("assignments")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "assignments" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            Assignments
          </button>
        </div>

        <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
          {tab === "notes" ? (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-[#0f0f0f] text-xs uppercase border-b border-[#1f1f1f]">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Uploader</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {notes.map(n => (
                  <tr key={n._id} className="hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{n.title}</td>
                    <td className="px-4 py-3">{n.subject}</td>
                    <td className="px-4 py-3">{n.user?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteNote(n)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {notes.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No notes found.</td></tr>
                )}
              </tbody>
            </table>
          ) : tab === "pyqs" ? (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-[#0f0f0f] text-xs uppercase border-b border-[#1f1f1f]">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Subject & Year</th>
                  <th className="px-4 py-3 font-medium">Uploader</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {pyqs.map(p => (
                  <tr key={p._id} className="hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{p.title}</td>
                    <td className="px-4 py-3">{p.subject} ({p.year})</td>
                    <td className="px-4 py-3">{p.uploadedBy?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deletePyq(p)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {pyqs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No PYQs found.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-[#0f0f0f] text-xs uppercase border-b border-[#1f1f1f]">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {assignments.map(a => (
                  <tr key={a._id} className="hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{a.title}</td>
                    <td className="px-4 py-3">{a.course}</td>
                    <td className="px-4 py-3">{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{a.userId?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteAssignment(a)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No assignments found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }
