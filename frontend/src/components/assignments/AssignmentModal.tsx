import { useState, useEffect } from "react";
import { X, Calendar, Clock, Book, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { Assignment } from "../../pages/AssignmentsPage";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  assignment?: Assignment | null;
}

export function AssignmentModal({ isOpen, onClose, onSaved, assignment }: AssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    description: "",
    status: "Not Started",
    dueDate: "",
    givenDate: new Date().toISOString().split('T')[0],
    reminderTime: ""
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        course: assignment.course || "",
        description: assignment.description || "",
        status: assignment.status,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0,16) : "",
        givenDate: assignment.givenDate ? new Date(assignment.givenDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reminderTime: assignment.reminderTime ? new Date(assignment.reminderTime).toISOString().slice(0,16) : ""
      });
    }
  }, [assignment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (assignment) {
        await api.put(`/assignments/${assignment._id}`, formData);
      } else {
        await api.post("/assignments", formData);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
          <h2 className="text-lg font-semibold text-white">
            {assignment ? "Edit Assignment" : "New Assignment"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Operating Systems Lab 4"
                className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Course / Subject</label>
              <div className="relative">
                <Book size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. CS302"
                  className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Given Date</label>
                <input
                  type="date"
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                  value={formData.givenDate}
                  onChange={(e) => setFormData({ ...formData, givenDate: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Due Date *</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Reminder Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="datetime-local"
                  className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                placeholder="Optional notes or links for this assignment..."
                className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1A1A1A]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-[#111] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black bg-[#FF9000] hover:bg-[#ff9d22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
              {assignment ? "Save Changes" : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
