import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: string;
  itemTitle: string;
}

export function ReportIssueModal({ isOpen, onClose, itemId, itemType, itemTitle }: ReportIssueModalProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        name: user?.name || "Admin",
        email: user?.email || "admin@system",
        type: "issue",
        message: `[Admin Issue Report] - ${itemType}: ${itemTitle} (ID: ${itemId})\n\nIssue Details:\n${description}`,
      });
      alert("Issue reported successfully to the Owner.");
      setDescription("");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to submit issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111] rounded-2xl border border-[#222] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Report Issue
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Content Type</label>
            <div className="w-full bg-[#1a1a1a] text-zinc-300 rounded-lg px-4 py-2 border border-[#333]">
              {itemType}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Content Title</label>
            <div className="w-full bg-[#1a1a1a] text-zinc-300 rounded-lg px-4 py-2 border border-[#333]">
              {itemTitle}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Issue Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is wrong with this content? e.g. 'Syllabus is outdated' or 'Link is broken'"
              className="w-full bg-[#050505] text-white rounded-lg px-4 py-3 border border-[#333] focus:border-red-500 focus:outline-none h-32 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
