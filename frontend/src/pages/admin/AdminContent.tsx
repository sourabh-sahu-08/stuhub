import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";
import { Eye, Download, Trash2, Plus, X, FileText, BookOpen, Clock, CheckCircle, AlertCircle, Folder, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ReportIssueModal } from "../../components/admin/ReportIssueModal";

interface Note { _id: string; title: string; subject: string; branch: string; semester: number; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; uploadedBy?: { _id: string; name: string }; }
interface Pyq  { _id: string; paperName: string; title?: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; uploadedBy?: { _id: string; name: string }; }
interface CtPyq { _id: string; paperName: string; title?: string; subject: string; semester: number; branch: string; fileName: string; driveUrl?: string; createdAt: string; user?: { name: string; email: string }; uploadedBy?: { _id: string; name: string }; }

const AVAILABLE_BRANCHES = ["CSE", "IT", "ET&T", "EE", "MECH", "CIVIL", "MINING"];
const AVAILABLE_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const BRANCHES_MAP: Record<string, string> = {
  "CSE": "Computer Science and Engineering",
  "IT": "Information Technology",
  "ET&T": "Electronics and Telecommunication",
  "EE": "Electrical Engineering",
  "MECH": "Mechanical Engineering",
  "CIVIL": "Civil Engineering",
  "MINING": "Mining Engineering"
};

export function AdminContent() {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.role === "owner" || currentUser?.role === "co-owner";

  const [tab, setTab] = useState<"notes" | "pyqs" | "ct-pyqs" | "assignments">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [ctPyqs, setCtPyqs] = useState<CtPyq[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItem, setReportItem] = useState({ id: "", type: "", title: "" });

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
    semester: "4",
    syllabus: "old",
    branch: "IT",
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
        } else if (uploadType === "assignment") {
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
      setFormData({ title: "", subject: "", semester: "4", syllabus: "old", branch: "IT", driveUrl: "" });
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

  const renderTable = (items: any[], type: "notes"|"pyqs"|"ct-pyqs"|"assignments") => {
    const filteredItems = items.filter(item => 
      item.branch?.toUpperCase() === selectedBranch?.toUpperCase() && Number(item.semester) === Number(selectedSemester)
    );
    
    return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-zinc-400 border-collapse min-w-[800px]">
        <thead className="bg-[#111] text-xs uppercase border-b border-[#222]">
          <tr>
            <th className="px-5 py-4 font-semibold text-zinc-300">Content Title</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Subject</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Branch & Sem</th>
            <th className="px-5 py-4 font-semibold text-zinc-300">Uploader</th>
            <th className="px-5 py-4 font-semibold text-zinc-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#222]">
          {filteredItems.map(item => (
            <tr key={item._id} className="hover:bg-[#111] transition-colors group">
              <td className="px-5 py-4 font-medium text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="line-clamp-1">{item.title || item.paperName}</div>
                </div>
              </td>
              <td className="px-5 py-4 text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-zinc-600" />
                  {item.subject}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#222] text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#333]">
                    {item.branch || "N/A"}
                  </span>
                  <span className="bg-[#222] text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#333]">
                    Sem {item.semester}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-zinc-400 text-xs">{item.user?.name || item.uploadedBy?.name || "Unknown"}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleView(item, type)} className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-[#222] transition-colors" title="View">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleDownload(item, type)} className="text-zinc-500 hover:text-[#FF9000] p-2 rounded-lg hover:bg-[#FF9000]/10 transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                  {isOwner || item.user?._id === currentUser?.id || item.uploadedBy?._id === currentUser?.id ? (
                    <button onClick={() => deleteItem(item._id, type, item.title || item.paperName)} className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReportItem({ id: item._id, type: type === "ct-pyqs" ? "CT PYQ" : type === "pyqs" ? "PYQ" : type === "assignments" ? "Assignment" : "Note", title: item.title || item.paperName });
                        setReportModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FF9000]/10 text-[#FF9000] rounded-lg hover:bg-[#FF9000]/20 transition-colors border border-[#FF9000]/20 ml-2"
                      title="Report Issue"
                    >
                      <AlertCircle size={14} />
                      Report Issue
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-500">
                  <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mb-4 border border-[#222]">
                    <FileText size={32} className="opacity-40" />
                  </div>
                  <p className="font-medium text-white mb-1">No {type === 'assignments' ? 'assignment solutions' : type.replace("-", " ")} found.</p>
                  <p className="text-sm">Click "Add Content" to upload some.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    );
  };

  const existingBranches = Array.from(new Set(subjects.flatMap(s => s.branches || []).filter(Boolean)));
  const uniqueBranches = Array.from(new Set([...existingBranches, "CSE", "IT", "ET&T", "EEE", "MECH", "CIVIL", "MINING"]));
  
  // Smart Subject Filtering: Only show subjects mapped to the chosen branch & semester
  const availableSubjectsForSelection = subjects.filter(s => 
    s.branches?.includes(formData.branch) && 
    s.semesters?.includes(parseInt(formData.semester))
  );
  const uniqueSubjectNames = Array.from(new Set(availableSubjectsForSelection.map(s => s.name)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Content Manager</h1>
          <p className="text-zinc-400">Manage notes, previous year questions, and assignment solutions.</p>
        </div>
        
        <button
          onClick={() => { setUploadType(tab === "notes" ? "note" : tab === "pyqs" ? "pyq" : tab === "ct-pyqs" ? "ct-pyq" : "assignment"); setUploadMethod("link"); setShowUpload(true); }}
          className="bg-[#FF9000] text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E58100] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#FF9000]/20"
        >
          <Plus size={18} strokeWidth={3} />
          Add Content
        </button>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-zinc-500">
        <button
          onClick={() => {
            setSelectedBranch(null);
            setSelectedSemester(null);
          }}
          className={`hover:text-[#FF9000] transition-colors ${
            selectedBranch === null ? "text-[#FF9000] font-bold" : ""
          }`}
        >
          ALL CONTENT
        </button>
        {selectedBranch !== null && (
          <>
            <span>/</span>
            <button
              onClick={() => {
                setSelectedSemester(null);
              }}
              className={`hover:text-[#FF9000] transition-colors ${
                selectedSemester === null ? "text-[#FF9000] font-bold" : ""
              }`}
            >
              {selectedBranch}
            </button>
          </>
        )}
        {selectedSemester !== null && (
          <>
            <span>/</span>
            <span className="text-[#FF9000] font-bold">SEMESTER {selectedSemester}</span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedBranch === null ? (
          /* ================= LEVEL 1: BRANCHES ================= */
          <motion.div
            key="branches"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uniqueBranches.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#222] bg-[#0A0A0A] p-5 text-left transition-all hover:border-[#FF9000] hover:shadow-[0_0_15px_rgba(255,144,0,0.05)] focus:outline-none"
                >
                  <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-[#FF9000]/5 transition-transform group-hover:scale-125" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#FF9000]/10 text-[#FF9000] transition-colors group-hover:bg-[#FF9000] group-hover:text-black">
                    <Folder size={18} fill="currentColor" className="opacity-80" />
                  </div>
                  <div className="mt-6">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      Branch: {b}
                    </span>
                    <h3 className="mt-0.5 text-sm font-bold text-zinc-200 group-hover:text-white line-clamp-1">
                      {BRANCHES_MAP[b] || b}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : selectedSemester === null ? (
          /* ================= LEVEL 2: SEMESTERS ================= */
          <motion.div
            key="semesters"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedBranch(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#222] bg-[#111] text-zinc-400 transition-colors hover:bg-[#222] hover:text-white"
                aria-label="Back to branches"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {BRANCHES_MAP[selectedBranch] || selectedBranch}
                </h1>
                <p className="text-xs text-zinc-400">Select semester</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {AVAILABLE_SEMESTERS.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className="group flex flex-col items-center justify-center rounded-lg border border-[#222] bg-[#0A0A0A] p-4 transition-colors hover:border-[#FF9000] hover:bg-[#FF9000]/5"
                >
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-[#FF9000]">
                    Semester {sem}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ================= LEVEL 3: CONTENT TABS AND TABLES ================= */
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSemester(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#222] bg-[#111] text-zinc-400 transition-colors hover:bg-[#222] hover:text-white"
                aria-label="Back to semesters"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  Semester {selectedSemester} Content
                </h1>
                <p className="text-xs text-zinc-400">
                  {BRANCHES_MAP[selectedBranch] || selectedBranch}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 border-b border-[#222] overflow-x-auto scrollbar-hide">
              {(["notes", "pyqs", "ct-pyqs", "assignments"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    tab === t ? "border-[#FF9000] text-[#FF9000]" : "border-transparent text-zinc-500 hover:text-white"
                  }`}
                >
                  {t === "notes" ? "Notes" : t === "pyqs" ? "PYQs" : t === "ct-pyqs" ? "CT PYQs" : "Assignment Solutions"}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-[#222] bg-[#0A0A0A] shadow-xl overflow-hidden">
              {tab === "notes" && renderTable(notes, "notes")}
              {tab === "pyqs" && renderTable(pyqs, "pyqs")}
              {tab === "ct-pyqs" && renderTable(ctPyqs, "ct-pyqs")}
              {tab === "assignments" && renderTable(assignments, "assignments")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
            <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#111]">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="text-[#FF9000]" size={20} />
                Upload {uploadType === "note" ? "Note" : uploadType === "pyq" ? "PYQ" : uploadType === "ct-pyq" ? "CT PYQ" : "Solution"}
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white transition-colors bg-[#222] p-1.5 rounded-lg hover:bg-[#333]">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Content Type</label>
                <div className="flex bg-[#111] rounded-lg p-1 gap-1 border border-[#222] overflow-x-auto scrollbar-hide">
                  {(["note", "pyq", "ct-pyq", "assignment"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setUploadType(type); }}
                      className={`px-3 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${uploadType === type ? "bg-[#222] text-[#FF9000] shadow" : "text-zinc-500 hover:text-white hover:bg-[#1A1A1A]"}`}
                    >
                      {type === "note" ? "Note" : type === "pyq" ? "PYQ" : type === "ct-pyq" ? "CT PYQ" : "Solution"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Branch</label>
                  <select required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value, subject: ""})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none font-medium">
                    <option value="" disabled>Select Branch</option>
                    {uniqueBranches.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Semester</label>
                  <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value, subject: ""})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none font-medium">
                    <option value="" disabled>Select Sem</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Subject</label>
                    <span className="text-[10px] text-zinc-600 font-medium">Auto-filtered</span>
                  </div>
                  <input required list="subject-options" type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Operating Systems" />
                  <datalist id="subject-options">
                    {uniqueSubjectNames.map(sub => <option key={sub as string} value={sub as string} />)}
                  </datalist>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Syllabus</label>
                  <select required value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors appearance-none font-medium">
                    <option value="old">Old Syllabus</option>
                    <option value="new">New Syllabus</option>
                  </select>
                </div>
              </div>

              <hr className="border-[#222]" />

              <div className="flex gap-6 mb-2">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={uploadMethod === "link"} onChange={() => setUploadMethod("link")} className="accent-[#FF9000] w-4 h-4" />
                  Drive Link
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={uploadMethod === "file"} onChange={() => setUploadMethod("file")} className="accent-[#FF9000] w-4 h-4" />
                  File Upload
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Title / Paper Name</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Operating Systems Unit 1" />
              </div>

              {uploadMethod === "link" ? (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Google Drive Link</label>
                  <input required type="url" value={formData.driveUrl} onChange={e => setFormData({...formData, driveUrl: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="https://..." />
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

              <button disabled={uploadLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3.5 rounded-lg mt-8 hover:bg-[#E58100] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-[#FF9000]/20 text-[15px]">
                {uploadLoading ? <Clock size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {uploadLoading ? "Uploading..." : "Save Content"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ReportIssueModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        itemId={reportItem.id} 
        itemType={reportItem.type} 
        itemTitle={reportItem.title} 
      />
    </div>
  );
}
