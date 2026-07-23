import { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, Clock, Trash2, ShieldAlert, Sparkles, Filter, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  type: 'issue' | 'suggestion';
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

export function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'issue' | 'suggestion'>('all');

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/feedback");
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Failed to fetch feedback", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/admin/feedback/${id}/status`, { status: newStatus });
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus as any } : f));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'reviewed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-[#FF9000]" />
            User Feedback
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Review issues and suggestions submitted from the landing page.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0A0A0A] border border-[#222] rounded-lg p-1">
            {(['all', 'issue', 'suggestion'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  typeFilter === t ? 'bg-[#FF9000] text-black' : 'text-zinc-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex bg-[#0A0A0A] border border-[#222] rounded-lg p-1">
            {(['all', 'new', 'reviewed', 'resolved'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  filter === s ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 border border-[#222] rounded-xl bg-[#0A0A0A]">
          <div className="animate-spin w-8 h-8 border-4 border-[#FF9000] border-t-transparent rounded-full" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-[#222] border-dashed rounded-xl bg-[#0A0A0A] text-zinc-500">
          <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
          <p>No feedback found matching the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFeedbacks.map(fb => (
            <div key={fb._id} className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      fb.type === 'issue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                    }`}>
                      {fb.type === 'issue' ? <AlertCircle size={12} /> : <Sparkles size={12} />}
                      {fb.type}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(fb.status)}`}>
                      {fb.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-lg">{fb.name}</h3>
                  <a href={`mailto:${fb.email}`} className="text-sm text-brand-500 hover:underline">{fb.email}</a>
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <Clock size={12} />
                  {new Date(fb.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-[#111] border border-[#222] rounded-lg p-4 mb-4">
                <p className="text-zinc-300 text-sm whitespace-pre-wrap">{fb.message}</p>
              </div>

              <div className="flex items-center gap-2 border-t border-[#222] pt-4">
                <span className="text-xs text-zinc-500 mr-2">Update status:</span>
                <button
                  onClick={() => updateStatus(fb._id, 'new')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    fb.status === 'new' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#111] text-zinc-400 hover:bg-[#222] hover:text-white'
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => updateStatus(fb._id, 'reviewed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    fb.status === 'reviewed' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#111] text-zinc-400 hover:bg-[#222] hover:text-white'
                  }`}
                >
                  Reviewed
                </button>
                <button
                  onClick={() => updateStatus(fb._id, 'resolved')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    fb.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#111] text-zinc-400 hover:bg-[#222] hover:text-white'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
