import React, { useState, useEffect } from "react";
import { Search, Plus, Calendar, FileText, Trash2, ArrowLeft, Brain, Cpu, MessageSquare } from "lucide-react";
import { api } from "../lib/api";
import { PyqUpload } from "../components/pyq/PyqUpload";
import { PyqDashboard } from "../components/pyq/PyqDashboard";
import { motion, AnimatePresence } from "framer-motion";

export function PyqPage() {
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // Check if there is an ID in the URL for shared links
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      loadAnalysis(id);
    }
    fetchHistory();
  }, []);

  const fetchHistory = async (query = "") => {
    setHistoryLoading(true);
    try {
      const response = await api.get(`/pyq/history?q=${encodeURIComponent(query)}`);
      setHistoryList(response.data);
    } catch (err) {
      console.error("Failed to load PYQ history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/pyq/analysis/${id}`);
      setActiveAnalysis(response.data);
      // Clean query params so URL looks tidy
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      alert("Failed to load analysis details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchHistory(val);
  };

  const handleAnalyze = async (file: File) => {
    setLoading(true);
    setLoadingStep(0);

    // Stepper loader simulation timings
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 4500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/pyq/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      clearInterval(interval);
      setLoadingStep(4);
      
      // Short delay for the final step to display
      setTimeout(() => {
        setActiveAnalysis(response.data);
        setLoading(false);
        fetchHistory();
      }, 800);
    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      const errMsg = err.response?.data?.message || "AI Analysis failed. Make sure your Groq API key is valid.";
      alert(errMsg);
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this analysis from your history?")) return;

    try {
      await api.delete(`/pyq/analysis/${id}`);
      setHistoryList((prev) => prev.filter((item) => item._id !== id));
      if (activeAnalysis?._id === id) {
        setActiveAnalysis(null);
      }
    } catch (err) {
      alert("Failed to delete analysis.");
      console.error(err);
    }
  };

  const handleReanalyze = async () => {
    if (!activeAnalysis) return;
    setReanalyzing(true);
    try {
      const response = await api.post(`/pyq/reanalyze/${activeAnalysis._id}`);
      setActiveAnalysis(response.data);
      fetchHistory();
    } catch (err) {
      alert("Reanalysis failed. Please check backend environment configuration.");
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-110px)] print:block">
      {/* Left Sidebar: History List (no-print) */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col space-y-4 no-print">
        {/* New Analysis Trigger */}
        <button
          onClick={() => setActiveAnalysis(null)}
          className={`flex items-center justify-center gap-2 rounded px-4 h-12 text-sm font-bold transition-all w-full cursor-pointer ${
            activeAnalysis === null
              ? "bg-primary text-black shadow-lg cursor-default"
              : "border border-outline bg-[#16161A] hover:bg-[#1C1C21] text-white"
          }`}
        >
          <Plus size={16} /> Analyze New Paper
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search papers, subjects..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-11 pl-10 pr-4 rounded border border-outline bg-[#16161A] text-sm focus:outline-none focus:border-primary text-white"
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto rounded border border-outline bg-[#0F0F12] p-3 min-h-[300px] lg:max-h-[60vh] space-y-2">
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant px-2 mt-1 font-mono">
            Analysis History
          </h3>
          
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant text-xs font-mono">
              <span className="animate-pulse">LOADING HISTORY...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <Brain size={24} className="text-on-surface-variant mb-2 opacity-40" />
              <p className="text-xs font-semibold text-on-surface-variant">No records found</p>
              <p className="text-[10px] text-on-surface-variant opacity-60 mt-1">Upload a paper above to start analyzing.</p>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-hidden">
              {historyList.map((item) => {
                const isActive = activeAnalysis?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => loadAnalysis(item._id)}
                    className={`group relative flex items-center justify-between rounded p-2.5 cursor-pointer transition ${
                      isActive
                        ? "bg-primary/10 border border-primary/20 text-primary"
                        : "hover:bg-[#16161A] border border-transparent text-[#e2e2e2]"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-xs font-bold truncate">{item.paperName}</p>
                      <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{item.subject}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant mt-1 font-mono">
                        <Calendar size={10} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Workspace Area */}
      <div className="flex-1 print:w-full">
        <AnimatePresence mode="wait">
          {activeAnalysis ? (
            <motion.div
              key={activeAnalysis._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <PyqDashboard
                analysis={activeAnalysis}
                onReanalyze={handleReanalyze}
                reanalyzing={reanalyzing}
              />
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded border border-outline bg-[#0F0F12] p-6 md:p-10 shadow-lg min-h-[60vh] flex flex-col justify-center print:hidden"
            >
              <PyqUpload
                onAnalyze={handleAnalyze}
                loading={loading}
                loadingStep={loadingStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default PyqPage;
