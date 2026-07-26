import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Plus, Trash2, BookOpen, Edit2, Check } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  code?: string;
  semesters: number[];
  syllabus: "new" | "old";
  branches: string[];
  createdAt: string;
}

const AVAILABLE_BRANCHES = ["CSE", "IT", "ET&T", "EEE", "MECH", "CIVIL", "MINING"];
const AVAILABLE_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterBranch, setFilterBranch] = useState<string>("All");
  const [filterSemester, setFilterSemester] = useState<string>("All");
  
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

      {/* Filters */}
      {!showForm && subjects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] border border-[#222] p-4 rounded-2xl shadow-xl">
          <div className="flex-1">
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Filter by Branch</label>
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] outline-none transition-colors appearance-none font-medium"
            >
              <option value="All">All Branches</option>
              {AVAILABLE_BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Filter by Semester</label>
            <select
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] outline-none transition-colors appearance-none font-medium"
            >
              <option value="All">All Semesters</option>
              {AVAILABLE_SEMESTERS.map(s => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
        {subjects.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mb-4 border border-[#222]">
              <BookOpen size={32} className="text-zinc-600" />
            </div>
            <p className="font-medium text-white">No subjects found.</p>
            <p className="text-sm mt-1">Create one to get started.</p>
          </div>
        ) : (
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
                  const branchMatch = filterBranch === "All" || subject.branches?.includes(filterBranch);
                  const semMatch = filterSemester === "All" || subject.semesters?.includes(parseInt(filterSemester));
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
