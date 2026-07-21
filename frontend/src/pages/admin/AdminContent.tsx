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

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<"note"|"pyq">("note");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "1",
    syllabus: "new",
    branch: "CSE",
    driveUrl: ""
  });

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    try {
      if (uploadType === "note") {
        await api.post("/admin/notes/link", formData);
      } else {
        await api.post("/admin/pyqs/link", {
          paperName: formData.title,
          subject: formData.subject,
          semester: formData.semester,
          syllabus: formData.syllabus,
          branch: formData.branch,
          driveUrl: formData.driveUrl
        });
      }
      setShowUpload(false);
      setFormData({ title: "", subject: "", semester: "1", syllabus: "new", branch: "CSE", driveUrl: "" });
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to upload link");
    } finally {
      setUploadLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-zinc-400 mt-1">Manage notes, previous year questions, and assignments uploaded by users.</p>
        </div>
        
        {tab !== "assignments" && (
          <button
            onClick={() => { setUploadType(tab === "notes" ? "note" : "pyq"); setShowUpload(true); }}
            className="bg-[#FF9000] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E58100] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add {tab === "notes" ? "Note" : "PYQ"} Link
          </button>
        )}
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

        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Upload {uploadType === "note" ? "Note" : "PYQ"} Link</h2>
                <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Title / Paper Name</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="e.g. Unit 1 Operating Systems" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Google Drive Link</label>
                  <input required type="url" value={formData.driveUrl} onChange={e => setFormData({...formData, driveUrl: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="https://drive.google.com/..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Subject</label>
                    <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Branch</label>
                    <input required type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Semester</label>
                    <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Syllabus</label>
                    <select required value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]">
                      <option value="new">New</option>
                      <option value="old">Old</option>
                    </select>
                  </div>
                </div>

                <button disabled={uploadLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3 rounded-lg mt-6 hover:bg-[#E58100] transition-colors disabled:opacity-50">
                  {uploadLoading ? "Saving..." : "Save Link"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
