import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Plus, Trash2, BookOpen, Edit2, Check, AlertCircle, Folder, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ReportIssueModal } from "../../components/admin/ReportIssueModal";

interface Subject {
  _id: string;
  name: string;
  code?: string;
  semesters: number[];
  syllabus: "new" | "old";
  branches: string[];
  createdAt: string;
  createdBy?: string;
}

const AVAILABLE_BRANCHES = ["CSE", "IT", "ET&T", "EE", "EEE", "MECH", "CIVIL", "MINING"];
const AVAILABLE_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const BRANCHES_MAP: Record<string, string> = {
  "CSE": "Computer Science and Engineering",
  "IT": "Information Technology",
  "ET&T": "Electronics and Telecommunication",
  "EE": "Electrical Engineering",
  "EEE": "Electrical and Electronics Engineering",
  "MECH": "Mechanical Engineering",
  "CIVIL": "Civil Engineering",
  "MINING": "Mining Engineering"
};

export function AdminSubjects() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "co-owner";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItem, setReportItem] = useState({ id: "", type: "", title: "" });

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    branches: [] as string[],
    semesters: [] as number[],
    syllabus: "old"
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/subjects");
      setSubjects(res.data);
    } catch (e) {
      console.error("Failed to load subjects", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.branches.length === 0) {
      alert("Please select at least one branch.");
      return;
    }
    if (formData.semesters.length === 0) {
      alert("Please select at least one semester.");
      return;
    }

    try {
      setFormLoading(true);
      if (editingId) {
        const res = await api.put(`/admin/subjects/${editingId}`, formData);
        setSubjects(prev => prev.map(s => s._id === editingId ? res.data : s));
        setEditingId(null);
      } else {
        const res = await api.post("/admin/subjects", formData);
        setSubjects(prev => [...prev, res.data]);
      }
      setShowForm(false);
      setFormData({ name: "", code: "", branches: [], semesters: [], syllabus: "old" });
    } catch (e: any) {
      console.error("Failed to save subject", e);
      alert(e.response?.data?.message || "Failed to save subject.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      code: subject.code || "",
      branches: subject.branches || [],
      semesters: subject.semesters || [],
      syllabus: subject.syllabus
    });
    setEditingId(subject._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      console.error("Failed to delete subject", e);
    }
  };

  const toggleBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter(b => b !== branch)
        : [...prev.branches, branch]
    }));
  };

  const toggleSemester = (sem: number) => {
    setFormData(prev => ({
      ...prev,
      semesters: prev.semesters.includes(sem)
        ? prev.semesters.filter(s => s !== sem)
        : [...prev.semesters, sem]
    }));
  };

  if (loading) {
    return <div className="p-8 text-zinc-400 flex items-center justify-center">Loading subjects...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Subject Manager</h1>
          <p className="text-zinc-400">Add or remove subjects dynamically across any branch and semester.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData({ name: "", code: "", branches: [], semesters: [], syllabus: "old" });
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF9000] text-black font-semibold rounded-lg hover:bg-[#FF9000]/90 transition-colors"
        >
          {showForm ? "Cancel" : <><Plus size={18} /> Add Subject</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">
            {editingId ? "Edit Subject" : "Add New Subject"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Subject Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Analog Electronics"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Subject Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AEC"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Syllabus</label>
                <select
                  required
                  value={formData.syllabus}
                  onChange={e => setFormData({ ...formData, syllabus: e.target.value as "new" | "old" })}
                  className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] outline-none transition-colors appearance-none"
                >
                  <option value="old">Old Syllabus</option>
                  <option value="new">New Syllabus</option>
                </select>
              </div>
            </div>

            {/* Branches Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Map to Branches *</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, branches: prev.branches.length === AVAILABLE_BRANCHES.length ? [] : [...AVAILABLE_BRANCHES] }))}
                  className="text-xs text-[#FF9000] hover:underline"
                >
                  {formData.branches.length === AVAILABLE_BRANCHES.length ? "Deselect All" : "Select All Branches"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BRANCHES.map(branch => {
                  const isSelected = formData.branches.includes(branch);
                  return (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => toggleBranch(branch)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        isSelected 
                          ? "bg-[#FF9000]/20 text-[#FF9000] border-[#FF9000]/40" 
                          : "bg-[#111] text-zinc-400 border-[#333] hover:border-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? "bg-[#FF9000] border-[#FF9000]" : "border-zinc-500"}`}>
                        {isSelected && <Check size={10} className="text-black stroke-[4]" />}
                      </div>
                      {branch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semesters Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Map to Semesters *</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, semesters: prev.semesters.length === AVAILABLE_SEMESTERS.length ? [] : [...AVAILABLE_SEMESTERS] }))}
                  className="text-xs text-[#FF9000] hover:underline"
                >
                  {formData.semesters.length === AVAILABLE_SEMESTERS.length ? "Deselect All" : "Select All Semesters"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SEMESTERS.map(sem => {
                  const isSelected = formData.semesters.includes(sem);
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => toggleSemester(sem)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        isSelected 
                          ? "bg-[#FF9000]/20 text-[#FF9000] border-[#FF9000]/40" 
                          : "bg-[#111] text-zinc-400 border-[#333] hover:border-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? "bg-[#FF9000] border-[#FF9000]" : "border-zinc-500"}`}>
                        {isSelected && <Check size={10} className="text-black stroke-[4]" />}
                      </div>
                      Sem {sem}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#222]">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 bg-[#FF9000] text-black font-bold rounded-lg hover:bg-[#E58100] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FF9000]/20"
              >
                {formLoading ? "Saving..." : editingId ? "Update Subject" : <><Plus size={18} strokeWidth={3} /> Save Subject</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drill-down UI */}
      {!showForm && subjects.length > 0 && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <button
              onClick={() => {
                setSelectedBranch(null);
                setSelectedSemester(null);
              }}
              className={`hover:text-[#FF9000] transition-colors ${
                selectedBranch === null ? "text-[#FF9000] font-bold" : ""
              }`}
            >
              ALL SUBJECTS
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
                  {AVAILABLE_BRANCHES.map((b) => (
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
              /* ================= LEVEL 3: SUBJECTS TABLE ================= */
              <motion.div
                key="subjects"
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
                      Semester {selectedSemester} Subjects
                    </h1>
                    <p className="text-xs text-zinc-400">
                      {BRANCHES_MAP[selectedBranch] || selectedBranch}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#111] border-b border-[#222]">
                          <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Subject Name & Code</th>
                          <th className="px-6 py-4 font-semibold text-zinc-300 text-sm w-1/3">Mapped Branches</th>
                          <th className="px-6 py-4 font-semibold text-zinc-300 text-sm w-1/4">Mapped Semesters</th>
                          <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Syllabus</th>
                          <th className="px-6 py-4 font-semibold text-zinc-300 text-sm text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222]">
                        {subjects.filter(subject => {
                          const branchMatch = subject.branches?.includes(selectedBranch);
                          const semMatch = subject.semesters?.includes(selectedSemester);
                          return branchMatch && semMatch;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                              No subjects mapped to this branch and semester yet.
                            </td>
                          </tr>
                        ) : subjects.filter(subject => {
                          const branchMatch = subject.branches?.includes(selectedBranch);
                          const semMatch = subject.semesters?.includes(selectedSemester);
                          return branchMatch && semMatch;
                        }).map(subject => (
                          <tr key={subject._id} className="hover:bg-[#111] transition-colors group">
                            <td className="px-6 py-4 text-white font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] shrink-0">
                                  <BookOpen size={14} />
                                </div>
                                <div>
                                  <div>{subject.name}</div>
                                  {subject.code && <div className="text-xs text-zinc-500 font-mono mt-0.5">{subject.code}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {subject.branches?.map(b => (
                                  <span key={b} className="bg-[#222] text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#333]">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {subject.semesters?.map(s => (
                                  <span key={s} className="bg-[#222] text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#333]">
                                    Sem {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                subject.syllabus === "new" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              }`}>
                                {subject.syllabus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isOwner || subject.createdBy === user?.id ? (
                                  <>
                                    <button
                                      onClick={() => handleEdit(subject)}
                                      className="p-2 text-zinc-500 hover:text-[#FF9000] hover:bg-[#FF9000]/10 rounded-lg transition-colors"
                                      title="Edit Subject"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(subject._id)}
                                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Delete Subject"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReportItem({ id: subject._id, type: "Subject", title: subject.name });
                                      setReportModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FF9000]/10 text-[#FF9000] rounded-lg hover:bg-[#FF9000]/20 transition-colors border border-[#FF9000]/20"
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
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
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
