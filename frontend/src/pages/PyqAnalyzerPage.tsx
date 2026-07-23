import React, { useState } from "react";
import { ArrowLeft, RefreshCw, ShieldAlert, Network, Sparkles, BarChart2, BookOpen, Target, Brain, Layers, Clock, Sigma, MoonStar, Zap, TrendingUp, Trophy, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PyqAnalyzerUpload } from "../components/pyq-analyzer/PyqAnalyzerUpload";
import { motion, AnimatePresence } from "framer-motion";

// V2 Components
import { AnalysisHero } from "../components/pyq-analyzer/v2/AnalysisHero";
import { QuickStats } from "../components/pyq-analyzer/v2/QuickStats";
import { AISummary } from "../components/pyq-analyzer/v2/AISummary";
import { UnitCards } from "../components/pyq-analyzer/v2/UnitCards";
import { TopRepeatedTopics } from "../components/pyq-analyzer/v2/TopRepeatedTopics";
import { PredictedQuestions } from "../components/pyq-analyzer/v2/PredictedQuestions";


const TABS = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "units", label: "Units", icon: Layers },
  { id: "topics", label: "Top Topics", icon: Trophy },
  { id: "predictions", label: "Predictions", icon: Target },

];

export function PyqAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Health-check
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkDevHealth = async () => {
    setCheckingHealth(true);
    setHealthStatus(null);
    try {
      const response = await api.get("/pyq-analyzer/health");
      setHealthStatus(`SUCCESS: ${response.data.message}`);
    } catch (err: any) {
      setHealthStatus(`FAILED: ${err.response?.data?.message || "Could not reach endpoint."}`);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleAnalyze = async (data: { subject: string; branch: string; semester: number; syllabus: File; pyqs: File[] }) => {
    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("branch", data.branch);
      formData.append("semester", String(data.semester));
      formData.append("syllabus", data.syllabus);
      data.pyqs.forEach((file) => formData.append("pyqs", file));

      const response = await api.post("/pyq-analyzer/validate-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setValidationResult(response.data);
      setCurrentFormData(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || "File validation failed.");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    if (!currentFormData) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await api.post("/pyq-analyzer/analyze", currentFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
      setGeneratedAt(new Date().toLocaleTimeString());
      setActiveTab("overview");
    } catch (err: any) {
      setAnalysisError(err.response?.data?.message || "AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setError(null);
    setCurrentFormData(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setActiveTab("overview");
  };

  // Loading screen during AI analysis
  if (analyzing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#FF9000]/20 border-t-[#FF9000] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain size={24} className="text-[#FF9000]" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">AI Exam Intelligence Engine Running</h3>
          <p className="text-sm text-zinc-500 max-w-xs text-center">Extracting every question, computing patterns, predicting the next paper… This may take 20–40 seconds.</p>
        </div>
        <div className="flex flex-col gap-2 w-64">
          {["Reading past papers", "Identifying question patterns", "Computing unit weightages", "Detecting repeated questions", "Predicting exam questions", "Generating study plan"].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.8 }} className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.8 + 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-[#FF9000]"
              />
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors font-mono">
          <ArrowLeft size={14} /> BACK TO DASHBOARD
        </Link>
        <div className="flex items-center gap-3">
          {healthStatus && (
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${healthStatus.startsWith("SUCCESS") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {healthStatus}
            </span>
          )}
          <button onClick={checkDevHealth} disabled={checkingHealth} className="flex items-center gap-1.5 rounded border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all cursor-pointer font-mono">
            <Network size={12} className={checkingHealth ? "animate-spin text-[#FF9000]" : ""} />
            {checkingHealth ? "CHECKING..." : "TEST API"}
          </button>
          {analysisResult && (
            <button onClick={handleReset} className="flex items-center gap-1.5 rounded border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all cursor-pointer font-mono">
              <RefreshCw size={12} /> NEW ANALYSIS
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Upload */}
        {!validationResult ? (
          <motion.div key="uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2 max-w-3xl mx-auto">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div><h4 className="font-bold">Validation Error</h4><p className="mt-1">{error}</p></div>
              </div>
            )}
            <div className="rounded-2xl border border-white/8 bg-[#0a0a0f] p-6 md:p-10">
              <PyqAnalyzerUpload onAnalyze={handleAnalyze} loading={loading} />
            </div>
          </motion.div>

        ) : !analysisResult ? (
          /* Phase 2: Confirmed - start analysis */
          <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#0a0a0f] p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white">Files Validated ✓</h3>
                <p className="text-xs text-zinc-500">{validationResult?.pyqs?.length} papers ready for AI Exam Intelligence Analysis</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[["Subject", validationResult?.subject], ["Branch", validationResult?.branch], ["Semester", `Sem ${validationResult?.semester}`]].map(([k, v]) => (
                  <div key={k} className="bg-white/4 border border-white/8 rounded-xl p-3">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase">{k}</div>
                    <div className="text-sm font-bold text-white mt-0.5 truncate">{v}</div>
                  </div>
                ))}
              </div>

              {analysisError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">{analysisError}</div>
              )}

              <div className="flex gap-3 justify-center pt-2">
                <button onClick={handleReset} className="flex items-center gap-2 rounded-xl border border-white/10 px-5 h-11 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer">
                  <RefreshCw size={14} /> Start Over
                </button>
                <button onClick={startAnalysis} className="flex items-center gap-2 rounded-xl bg-[#FF9000] text-black px-6 h-11 text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#FF9000]/20">
                  <Brain size={16} /> Run AI Analysis
                </button>
              </div>
            </div>
          </motion.div>

        ) : (
          /* Phase 3: Full V2 Dashboard */
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Hero */}
            <AnalysisHero meta={analysisResult.meta ?? {
              subject: validationResult?.subject,
              branch: validationResult?.branch,
              semester: validationResult?.semester,
              totalPapers: validationResult?.pyqs?.length,
              overallDifficulty: "Medium",
              confidenceScore: 85,
              estimatedStudyHours: 30,
              theoryVsNumerical: { theory: 65, numerical: 35 }
            }} generatedAt={generatedAt} />

            {/* AI Summary */}
            {analysisResult.aiSummary && (
              <AISummary summary={analysisResult.aiSummary} importantTopics={analysisResult.importantTopics ?? []} />
            )}

            {/* Tabs */}
            <div className="sticky top-0 z-10 bg-[#09090B]/90 backdrop-blur-sm pt-1 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all font-mono shrink-0 ${
                      activeTab === tab.id
                        ? "bg-[#FF9000] text-black"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <tab.icon size={12} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {activeTab === "overview" && (
                  <QuickStats stats={analysisResult.quickStats ?? {
                    totalQuestions: 0, uniqueQuestions: 0, repeatedQuestions: 0,
                    totalUnits: analysisResult.units?.length ?? 0, totalTopics: analysisResult.topRepeatedTopics?.length ?? 0,
                    expectedMarksCoverage: 85, questionPatterns: []
                  }} />
                )}
                {activeTab === "units" && <UnitCards units={analysisResult.units ?? []} />}
                {activeTab === "topics" && <TopRepeatedTopics topics={analysisResult.topRepeatedTopics ?? []} />}
                {activeTab === "predictions" && <PredictedQuestions questions={analysisResult.predictedQuestions ?? []} />}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PyqAnalyzerPage;
