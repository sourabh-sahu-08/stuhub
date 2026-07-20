import { useState, useEffect } from "react";
import { Plus, Clock, Calendar as CalendarIcon, CheckCircle2, Circle, ArrowRight, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { AssignmentModal } from "../components/assignments/AssignmentModal";

export interface Assignment {
  _id: string;
  title: string;
  course?: string;
  description?: string;
  status: "Not Started" | "In Progress" | "Submitted";
  givenDate: string;
  dueDate: string;
  reminderTime?: string;
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Failed to delete assignment", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Assignment["status"]) => {
    try {
      setAssignments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
      await api.put(`/assignments/${id}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchAssignments(); // Revert on failure
    }
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "In Progress": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const completedCount = assignments.filter(a => a.status === "Submitted").length;
  const progressPercent = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Assignments</h1>
          <p className="text-sm text-zinc-400">Track deadlines, manage submissions, and set reminders.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Progress */}
          <div className="flex items-center gap-3 px-4 py-2 bg-black border border-[#222] rounded-lg">
            <span className="text-xs font-medium text-zinc-400">Progress</span>
            <div className="w-24 h-1.5 bg-[#111] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-[#FF9000]"
              />
            </div>
            <span className="text-xs font-bold text-white">{progressPercent}%</span>
          </div>
          
          <button 
            onClick={openNewModal}
            className="flex items-center gap-2 bg-[#FF9000] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ff9d22] transition-colors"
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9000]" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-black border border-[#222] rounded-xl border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center mb-4 text-zinc-500">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No active assignments</h3>
          <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
            You're all caught up! Create a new assignment to start tracking your coursework deadlines.
          </p>
          <button 
            onClick={openNewModal}
            className="text-sm font-medium text-[#FF9000] hover:text-[#ff9d22]"
          >
            + Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {assignments.map(assignment => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={assignment._id}
                className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 hover:border-[#333] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </div>
                  
                  {/* Actions Dropdown / Buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button onClick={() => openEditModal(assignment)} className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-[#222] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(assignment._id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-[#222] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{assignment.title}</h3>
                  {assignment.course && <p className="text-xs text-brand-500 font-medium mb-3">{assignment.course}</p>}
                  {assignment.description && <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{assignment.description}</p>}
                </div>

                <div className="pt-4 mt-2 border-t border-[#1a1a1a] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <CalendarIcon size={14} className="text-zinc-500" />
                    <span>Due: <span className="text-zinc-200 font-medium">{new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                  </div>
                  {assignment.reminderTime && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock size={14} className="text-[#FF9000]" />
                      <span>Reminder: {new Date(assignment.reminderTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Quick Status Toggle */}
                <div className="mt-5 grid grid-cols-3 gap-1 p-1 bg-[#111] rounded-lg border border-[#222]">
                  {["Not Started", "In Progress", "Submitted"].map(status => {
                    const isSelected = assignment.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(assignment._id, status as any)}
                        className={`text-[10px] py-1.5 rounded-md font-medium transition-all ${
                          isSelected 
                            ? "bg-[#222] text-white shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]"
                        }`}
                      >
                        {status === "Not Started" ? "To Do" : status === "In Progress" ? "Doing" : "Done"}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isModalOpen && (
        <AssignmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={fetchAssignments}
          assignment={editingAssignment}
        />
      )}
    </div>
  );
}
