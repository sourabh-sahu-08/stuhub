import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";

interface Note { _id: string; title: string; subject: string; branch: string; semester: number; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }
interface Pyq  { _id: string; paperName: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }
interface CtPyq { _id: string; paperName: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; }

export function AdminContent() {
  const [tab, setTab] = useState<"notes" | "pyqs" | "ct-pyqs" | "assignments">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [ctPyqs, setCtPyqs] = useState<CtPyq[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
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
    unitNo: "",
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
      const [n, p, c, a] = await Promise.all([
        api.get("/admin/notes"),
        api.get("/admin/pyqs"),
        api.get("/admin/ct-pyqs"),
        api.get("/admin/assignments"),
      ]);
      setNotes(Array.isArray(n.data) ? n.data : []);
      setPyqs(Array.isArray(p.data) ? p.data : []);
      setCtPyqs(Array.isArray(c.data) ? c.data : []);
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
      const prefix = uploadType === "ct-pyq" ? "CT" : "Unit";
      const finalTitle = formData.unitNo.trim() ? `${prefix} ${formData.unitNo.trim()} - ${formData.title.trim()}` : formData.title.trim();

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
      setFormData({ title: "", unitNo: "", subject: "", semester: "1", syllabus: "new", branch: "CSE", driveUrl: "" });
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
    <table className="w-full text-left text-sm text-zinc-400">
      <thead className="bg-[#0f0f0f] text-xs uppercase border-b border-[#1f1f1f]">
        <tr>
          <th className="px-4 py-3 font-medium">Title</th>
          <th className="px-4 py-3 font-medium">Subject</th>
          <th className="px-4 py-3 font-medium">Semester</th>
          <th className="px-4 py-3 font-medium">Uploader</th>
          <th className="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1a1a1a]">
        {items.map(item => (
          <tr key={item._id} className="hover:bg-[#0f0f0f] transition-colors">
            <td className="px-4 py-3 font-medium text-white">{item.title || item.paperName}</td>
            <td className="px-4 py-3">{item.subject}</td>
            <td className="px-4 py-3">Sem {item.semester}</td>
            <td className="px-4 py-3">{item.user?.name || item.uploadedBy?.name || "Unknown"}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => handleView(item, type)} className="text-zinc-400 hover:text-[#FF9000] p-1.5 rounded transition-colors" title="View">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
                <button onClick={() => handleDownload(item, type)} className="text-zinc-400 hover:text-[#FF9000] p-1.5 rounded transition-colors" title="Download">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
                <button onClick={() => deleteItem(item._id, type, item.title || item.paperName)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No {type.replace("-", " ")} found.</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-zinc-400 mt-1">Manage notes, previous year questions, and CT papers uploaded by users.</p>
        </div>
        
        <button
          onClick={() => { setUploadType(tab === "notes" ? "note" : tab === "pyqs" ? "pyq" : "ct-pyq"); setShowUpload(true); }}
          className="bg-[#FF9000] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E58100] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Content
        </button>
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
          onClick={() => setTab("ct-pyqs")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === "ct-pyqs" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          CT PYQs
        </button>
        <button
          onClick={() => setTab("assignments")}
          className={`flex-1 sm:flex-none px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            tab === "assignments" ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
          }`}
        >
          Assignments
        </button>
      </div>

      <div className="rounded-xl border border-[#1f1f1f] overflow-hidden">
        {tab === "notes" && renderTable(notes, "notes")}
        {tab === "pyqs" && renderTable(pyqs, "pyqs")}
        {tab === "ct-pyqs" && renderTable(ctPyqs, "ct-pyqs")}
        {tab === "assignments" && renderTable(assignments, "assignments")}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Upload {uploadType === "note" ? "Note" : uploadType === "pyq" ? "PYQ" : uploadType === "ct-pyq" ? "CT PYQ" : "Assignment"}
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {/* Type Selection */}
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setUploadType("note")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadType === "note" ? "bg-[#2a2a2a] text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  Note
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("pyq")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadType === "pyq" ? "bg-[#2a2a2a] text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  PYQ
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("ct-pyq")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadType === "ct-pyq" ? "bg-[#2a2a2a] text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  CT PYQ
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("assignment")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${uploadType === "assignment" ? "bg-[#2a2a2a] text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  Assignment
                </button>
              </div>

              {/* Upload Method */}
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="radio" checked={uploadMethod === "link"} onChange={() => setUploadMethod("link")} className="accent-[#FF9000]" />
                  Drive Link
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="radio" checked={uploadMethod === "file"} onChange={() => setUploadMethod("file")} className="accent-[#FF9000]" />
                  File Upload
                </label>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Unit / CT No</label>
                  <input type="text" value={formData.unitNo} onChange={e => setFormData({...formData, unitNo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="e.g. 1" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Title / Paper Name</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="e.g. Operating Systems" />
                </div>
              </div>

              {uploadMethod === "link" ? (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Google Drive Link</label>
                  <input required type="url" value={formData.driveUrl} onChange={e => setFormData({...formData, driveUrl: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="https://drive.google.com/..." />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Select File (PDF)</label>
                  <input 
                    required 
                    type="file" 
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#FF9000] file:text-black hover:file:bg-[#E58100]" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Subject</label>
                  <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="e.g. Operating Systems" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Branch</label>
                  <input required type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9000]" placeholder="e.g. IT" />
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

              <button disabled={uploadLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3 rounded-lg mt-6 hover:bg-[#E58100] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                {uploadLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {uploadLoading ? "Uploading..." : "Save Content"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
