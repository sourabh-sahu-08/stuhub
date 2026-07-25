import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Plus, Trash2, BookOpen } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  semester: number;
  syllabus: "new" | "old";
  department?: Department;
  createdAt: string;
}

export function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    departmentCode: "IT",
    semester: "4",
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
    try {
      setFormLoading(true);
      const res = await api.post("/admin/subjects", formData);
      setSubjects(prev => [...prev, res.data]);
      setShowForm(false);
      setFormData({ name: "", code: "", departmentCode: "IT", semester: "4", syllabus: "old" });
    } catch (e) {
      console.error("Failed to create subject", e);
      alert("Failed to create subject. Please check the department code.");
    } finally {
      setFormLoading(false);
    }
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

  if (loading) {
    return <div className="p-8 text-zinc-400 flex items-center justify-center">Loading subjects...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Subject Manager</h1>
          <p className="text-zinc-400">Add or remove subjects dynamically across any branch and semester.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF9000] text-black font-semibold rounded-lg hover:bg-[#FF9000]/90 transition-colors"
        >
          {showForm ? "Cancel" : <><Plus size={18} /> Add Subject</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Add New Subject</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Subject Name</label>
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
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Subject Code</label>
              <input
                required
                type="text"
                placeholder="e.g. AEC"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Branch Code</label>
              <input
                required
                type="text"
                placeholder="e.g. IT"
                value={formData.departmentCode}
                onChange={e => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Semester</label>
              <select
                required
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 focus:border-[#FF9000] outline-none transition-colors appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
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
            <div className="lg:col-span-5 flex justify-end mt-4">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 bg-[#FF9000] text-black font-bold rounded-lg hover:bg-[#E58100] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FF9000]/20"
              >
                {formLoading ? "Adding..." : <><Plus size={18} strokeWidth={3} /> Add Subject</>}
              </button>
            </div>
          </form>
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
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Subject Name</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Code</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Branch</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Semester</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm">Syllabus</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {subjects.map(subject => (
                  <tr key={subject._id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-6 py-4 text-white font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF9000]/10 flex items-center justify-center text-[#FF9000] shrink-0">
                          <BookOpen size={14} />
                        </div>
                        {subject.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{subject.code}</td>
                    <td className="px-6 py-4 text-zinc-400">{subject.department?.code || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#222] text-zinc-300 px-2.5 py-1 rounded-md text-xs font-medium border border-[#333]">
                        Sem {subject.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        subject.syllabus === "new" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}>
                        {subject.syllabus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
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
