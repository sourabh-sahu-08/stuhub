import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface Department {
  _id: string;
  name: string;
  code: string;
}

export function CompleteProfileModal() {
  const { user, completeProfile } = useAuth();
  
  // State variables for the form
  const [name, setName] = useState(user?.name ?? "");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState("");
  
  // UI states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load departments
  useEffect(() => {
    api.get("/auth/departments")
      .then((res) => {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setDepartment(res.data[0]._id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments", err);
      });
  }, []);

  // Update name if user updates
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // If user is already complete or no user, do not render
  if (!user || user.isProfileComplete) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validations
    if (!name.trim()) return setError("Name is required");
    if (!rollNumber.trim()) return setError("Roll number is required");
    if (!department) return setError("Please select a department");
    if (!section.trim()) return setError("Section is required (e.g. A, B, C)");

    setLoading(true);
    try {
      await completeProfile({
        name,
        rollNumber,
        department,
        semester,
        section: section.toUpperCase()
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-2xl border border-brand-500/30 bg-slate-900/90 shadow-[0_0_50px_rgba(0,184,83,0.15)] text-white my-auto"
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,184,83,0.2)] animate-pulse">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Complete Your Student Profile</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Welcome to Stuhub! Since you logged in with a social account, please complete these mandatory academic details to open your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sourabh Sahu"
              className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white transition-all"
            />
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Roll Number *</label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. CSE-2026-042"
              className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white transition-all"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department *</label>
            <select
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white transition-all appearance-none"
            >
              {departments.length === 0 ? (
                <option value="" disabled className="bg-slate-950">Loading departments...</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept._id} value={dept._id} className="bg-slate-950">
                    {dept.name} ({dept.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Semester */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Semester *</label>
              <select
                required
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem} className="bg-slate-950">Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Section *</label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                maxLength={2}
                className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white transition-all text-center"
              />
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="flex gap-2 items-center text-xs text-red-400 font-bold p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-brand-500 text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:bg-brand-600 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(0,184,83,0.3)] active:scale-95 mt-6"
          >
            {loading ? "Completing Profile..." : "Open Student Command Center"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
