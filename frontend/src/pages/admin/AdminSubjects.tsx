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
          <h1 className="text-3xl font-bold text-white mb-2">Subject Manager</h1>
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
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-6">Add New Subject</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Subject Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Analog Electronics"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Subject Code</label>
              <input
                required
                type="text"
                placeholder="e.g. AEC"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Branch Code</label>
              <input
                required
                type="text"
                placeholder="e.g. IT"
                value={formData.departmentCode}
                onChange={e => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Semester</label>
              <select
                required
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 focus:border-[#FF9000] outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Syllabus</label>
              <select
                required
                value={formData.syllabus}
                onChange={e => setFormData({ ...formData, syllabus: e.target.value as "new" | "old" })}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 focus:border-[#FF9000] outline-none"
              >
                <option value="old">Old Syllabus</option>
                <option value="new">New Syllabus</option>
              </select>
            </div>
            <div className="lg:col-span-5 flex justify-end mt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2 bg-[#FF9000] text-black font-semibold rounded-lg hover:bg-[#FF9000]/90 disabled:opacity-50"
              >
                {formLoading ? "Adding..." : "Add Subject"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {subjects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No subjects found. Create one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-[#222]">
                <th className="p-4 font-medium text-zinc-400">Subject Name</th>
                <th className="p-4 font-medium text-zinc-400">Code</th>
                <th className="p-4 font-medium text-zinc-400">Branch</th>
                <th className="p-4 font-medium text-zinc-400">Semester</th>
                <th className="p-4 font-medium text-zinc-400">Syllabus</th>
                <th className="p-4 font-medium text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject._id} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                  <td className="p-4 text-zinc-200 font-medium">{subject.name}</td>
                  <td className="p-4 text-zinc-400">{subject.code}</td>
                  <td className="p-4 text-zinc-400">{subject.department?.code || "-"}</td>
                  <td className="p-4 text-zinc-400">Sem {subject.semester}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      subject.syllabus === "new" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {subject.syllabus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
