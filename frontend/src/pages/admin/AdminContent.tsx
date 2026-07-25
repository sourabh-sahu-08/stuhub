import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";
import { Eye, Download, Trash2, Plus, X, FileText, BookOpen, Clock, CheckCircle } from "lucide-react";

interface Note { _id: string; title: string; subject: string; branch: string; semester: number; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }
interface Pyq  { _id: string; paperName: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }
interface CtPyq { _id: string; paperName: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }

export function AdminContent() {
  const [tab, setTab] = useState<"notes" | "pyqs" | "ct-pyqs" | "assignments">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [ctPyqs, setCtPyqs] = useState<CtPyq[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<"note"|"pyq"|"ct-pyq"|"assignment">("note");
  const [uploadMethod, setUploadMethod] = useState<"link"|"file">("link");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const [n, p, c, a, s] = await Promise.all([
        api.get("/admin/notes"),
        api.get("/admin/pyqs"),
        api.get("/admin/ct-pyqs"),
        api.get("/admin/assignments"),
        api.get("/admin/subjects"),
      ]);
      setNotes(Array.isArray(n.data) ? n.data : []);
      setPyqs(Array.isArray(p.data) ? p.data : []);
      setCtPyqs(Array.isArray(c.data) ? c.data : []);
      setAssignments(Array.isArray(a.data) ? a.data : []);
      setSubjects(Array.isArray(s.data) ? s.data : []);
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
      const finalTitle = formData.title.trim();

      if (uploadMethod === "link") {
        if (uploadType === "note") {
          await api.post("/admin/notes/link", { ...formData, title: finalTitle });
        } else if (uploadType === "pyq") {
          await api.post("/admin/pyqs/link", {
            paperName: finalTitle,
            subject: formData.subject,
            semester: formData.semester,
            syllabus: formData.syllabus,
            branch: formData.branch,
            driveUrl: formData.driveUrl
          });
        } else if (uploadType === "ct-pyq") {
          await api.post("/admin/ct-pyqs/link", {
            paperName: finalTitle,
            subject: formData.subject,
            semester: formData.semester,
            syllabus: formData.syllabus,
            branch: formData.branch,
            driveUrl: formData.driveUrl
          });
        } else {
          await api.post("/admin/assignments/link", {
            title: finalTitle,
            subject: formData.subject,
            semester: formData.semester,
            syllabus: formData.syllabus,
            branch: formData.branch,
            driveUrl: formData.driveUrl
          });
        }
      } else {
        // File Upload
        if (!file) {
          alert("Please select a file to upload.");
          setUploadLoading(false);
          return;
        }

        const data = new FormData();
        data.append("file", file);
        if (uploadType === "note") {
          data.append("title", finalTitle);
        } else {
          data.append("paperName", finalTitle);
        }
        data.append("subject", formData.subject);
        data.append("semester", formData.semester);
        data.append("syllabus", formData.syllabus);
        data.append("branch", formData.branch);

        const endpoint = uploadType === "note" ? "/notes/upload" : uploadType === "pyq" ? "/pyq/upload" : uploadType === "ct-pyq" ? "/ct-pyq/upload" : "/assignments/upload";
        
        await api.post(endpoint, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      setShowUpload(false);
      setFormData({ title: "", subject: "", semester: "1", syllabus: "new", branch: "CSE", driveUrl: "" });
      setFile(null);
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to upload content");
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteItem = async (id: string, type: "notes"|"pyqs"|"ct-pyqs"|"assignments", title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      loadContent();
    } catch (error) {
      console.error(error);
      alert("Failed to delete item");
    }
  };

  const handleDownload = async (item: any, type: "notes"|"pyqs"|"ct-pyqs"|"assignments") => {
    if (item.driveUrl) {
      window.open(item.driveUrl, "_blank");
      return;
    }
    
    const endpoint = type === "notes" ? "/notes" : type === "pyqs" ? "/pyq" : type === "ct-pyqs" ? "/ct-pyq" : "/assignments";
    try {
      const response = await api.get(`${endpoint}/download/${item._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.fileName || "download.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download the file.");
    }
  };

  const handleView = async (item: any, type: "notes"|"pyqs"|"ct-pyqs"|"assignments") => {
    if (item.driveUrl) {
      window.open(item.driveUrl, "_blank");
      return;
    }

    const endpoint = type === "notes" ? "/notes" : type === "pyqs" ? "/pyq" : type === "ct-pyqs" ? "/ct-pyq" : "/assignments";
    try {
      const response = await api.get(`${endpoint}/download/${item._id}`, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing file", error);
      alert("Failed to view the file.");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#1f1f1f] rounded w-1/4"></div>
      <div className="h-10 bg-[#1f1f1f] rounded-xl w-full"></div>
    </div>;
  }

  const renderTable = (items: any[], type: "notes"|"pyqs"|"ct-pyqs"|"assignments") => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-zinc-400 border-collapse">
        <thead className="bg-[#111] text-xs uppercase border-b border-[#222]">
          <tr>
            <th className="px-5 py-4 font-semibold text-zinc-300">Title</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Subject</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Semester</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Uploader</th>
            <th className="px-5 py-4 font-semibold text-zinc-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#222]">
          {items.map(item => (
            <tr key={item._id} className="hover:bg-[#111] transition-colors group">
              <td className="px-5 py-4 font-medium text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] shrink-0">
                    <FileText size={14} />
                  </div>
                  {item.title || item.paperName}
                </div>
              </td>
              <td className="px-5 py-4 text-zinc-400">{item.subject}</td>
              <td className="px-5 py-4">
                <span className="bg-[#222] text-zinc-300 px-2.5 py-1 rounded-md text-xs font-medium border border-[#333]">
                  Sem {item.semester}
                </span>
              </td>
              <td className="px-5 py-4 text-zinc-400">{item.user?.name || item.uploadedBy?.name || "Unknown"}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleView(item, type)} className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-[#222] transition-colors" title="View">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleDownload(item, type)} className="text-zinc-500 hover:text-[#FF9000] p-2 rounded-lg hover:bg-[#FF9000]/10 transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                  <button onClick={() => deleteItem(item._id, type, item.title || item.paperName)} className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-500">
                  <FileText size={32} className="mb-3 opacity-20" />
                  <p>No {type === 'assignments' ? 'assignment solutions' : type.replace("-", " ")} found.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const uniqueSubjects = Array.from(new Set(subjects.map(s => s.name)));
  const existingBranches = Array.from(new Set(subjects.map(s => s.department?.code || s.departmentCode || s.branch).filter(Boolean)));
  const uniqueBranches = Array.from(new Set([...existingBranches, "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML"]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content Management</h1>
          <p className="text-zinc-400 mt-1">Manage notes, previous year questions, and assignment solutions.</p>
        </div>
        
        <button
          onClick={() => { setUploadType(tab === "notes" ? "note" : tab === "pyqs" ? "pyq" : "ct-pyq"); setShowUpload(true); }}
          className="bg-[#FF9000] text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E58100] transition-colors flex items-center gap-2 shadow-lg shadow-[#FF9000]/20"
        >
          <Plus size={18} strokeWidth={3} />
          Add Content
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 border-b border-[#222] overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTab("notes")}
          className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            tab === "notes" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setTab("pyqs")}
          className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            tab === "pyqs" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          PYQs
        </button>
        <button
          onClick={() => setTab("ct-pyqs")}
          className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            tab === "ct-pyqs" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          CT PYQs
        </button>
        <button
          onClick={() => setTab("assignments")}
          className={`px-3 sm:px-5 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
            tab === "assignments" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          Assignment Solutions
        </button>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#0A0A0A] shadow-xl overflow-hidden">
        {tab === "notes" && renderTable(notes, "notes")}
        {tab === "pyqs" && renderTable(pyqs, "pyqs")}
        {tab === "ct-pyqs" && renderTable(ctPyqs, "ct-pyqs")}
        {tab === "assignments" && renderTable(assignments, "assignments")}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Upload {uploadType === "note" ? "Note" : uploadType === "pyq" ? "PYQ" : uploadType === "ct-pyq" ? "CT PYQ" : "Assignment Solution"}
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white transition-colors bg-[#111] p-1.5 rounded-lg hover:bg-[#222]">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Type Selection */}
              <div className="flex bg-[#111] rounded-lg p-1 gap-1 border border-[#222]">
                <button
                  type="button"
                  onClick={() => setUploadType("note")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === "note" ? "bg-[#222] text-[#FF9000] shadow" : "text-zinc-500 hover:text-white hover:bg-[#1A1A1A]"}`}
                >
                  Note
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("pyq")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === "pyq" ? "bg-[#222] text-[#FF9000] shadow" : "text-zinc-500 hover:text-white hover:bg-[#1A1A1A]"}`}
                >
                  PYQ
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("ct-pyq")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === "ct-pyq" ? "bg-[#222] text-[#FF9000] shadow" : "text-zinc-500 hover:text-white hover:bg-[#1A1A1A]"}`}
                >
                  CT PYQ
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("assignment")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === "assignment" ? "bg-[#222] text-[#FF9000] shadow" : "text-zinc-500 hover:text-white hover:bg-[#1A1A1A]"}`}
                >
                  Solution
                </button>
              </div>

              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
                  <input type="radio" checked={uploadMethod === "link"} onChange={() => setUploadMethod("link")} className="accent-[#FF9000] w-4 h-4" />
                  Drive Link
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
                  <input type="radio" checked={uploadMethod === "file"} onChange={() => setUploadMethod("file")} className="accent-[#FF9000] w-4 h-4" />
                  File Upload
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Title / Paper Name</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Operating Systems" />
              </div>

              {uploadMethod === "link" ? (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Google Drive Link</label>
                  <input required type="url" value={formData.driveUrl} onChange={e => setFormData({...formData, driveUrl: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="https://drive.google.com/..." />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Select File (PDF)</label>
                  <input 
                    required 
                    type="file" 
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FF9000] file:text-black hover:file:bg-[#E58100]" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Subject</label>
                  <input required list="subject-options" type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Operating Systems" />
                  <datalist id="subject-options">
                    {uniqueSubjects.map(sub => <option key={sub as string} value={sub as string} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Branch</label>
                  <select required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none">
                    <option value="" disabled>Select Branch</option>
                    {uniqueBranches.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Semester</label>
                  <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none">
                    <option value="" disabled>Select Sem</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Syllabus</label>
                  <select required value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none">
                    <option value="" disabled>Select</option>
                    <option value="new">New</option>
                    <option value="old">Old</option>
                  </select>
                </div>
              </div>

              <button disabled={uploadLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3 rounded-lg mt-6 hover:bg-[#E58100] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-[#FF9000]/20">
                {uploadLoading ? <Clock size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                {uploadLoading ? "Uploading..." : "Save Content"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
