import React, { useState } from "react";
import { ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Network, Sparkles, BookOpen, Flame, Crosshair, Target, ListChecks, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PyqAnalyzerUpload } from "../components/pyq-analyzer/PyqAnalyzerUpload";
import { motion, AnimatePresence } from "framer-motion";

export function PyqAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  
  // Phase 2 states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Health-check (dev validation only)
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkDevHealth = async () => {
    setCheckingHealth(true);
    setHealthStatus(null);
    try {
      const response = await api.get("/pyq-analyzer/health");
      setHealthStatus(`SUCCESS: ${response.data.message}`);
    } catch (err: any) {
      console.error(err);
      setHealthStatus(`FAILED: ${err.response?.data?.message || "Could not reach endpoint."}`);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleAnalyze = async (data: {
    subject: string;
    branch: string;
    semester: number;
    syllabus: File;
    pyqs: File[];
  }) => {
    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("branch", data.branch);
      formData.append("semester", String(data.semester));
      formData.append("syllabus", data.syllabus);
      data.pyqs.forEach((file) => {
        formData.append("pyqs", file);
      });

      const response = await api.post("/pyq-analyzer/validate-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setValidationResult(response.data);
      setCurrentFormData(formData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "File validation failed. Please check file properties.");
    } finally {
      setLoading(false);
    }
  };

  const startPhase2Analysis = async () => {
    if (!currentFormData) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await api.post("/pyq-analyzer/analyze", currentFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAnalysisResult(response.data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.response?.data?.message || "AI Analysis failed.");
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
  };

  return (
    <div className="space-y-6">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-white transition-colors font-mono"
        >
          <ArrowLeft size={14} /> BACK TO COMMAND CENTER
        </Link>

        {/* Dev health check module */}
        <div className="flex items-center gap-3">
          {healthStatus && (
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${
              healthStatus.startsWith("SUCCESS") 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {healthStatus}
            </span>
          )}
          <button
            onClick={checkDevHealth}
            disabled={checkingHealth}
            className="flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white transition-all cursor-pointer font-mono"
          >
            <Network size={12} className={checkingHealth ? "animate-spin text-primary" : ""} />
            {checkingHealth ? "CHECKING API..." : "TEST API CONNECTIVITY"}
          </button>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="rounded border border-outline bg-surface p-6 md:p-10 shadow-lg min-h-[60vh] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!validationResult ? (
            <motion.div
              key="uploader-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs flex items-start gap-2 max-w-3xl mx-auto">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Validation Error</h4>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              <PyqAnalyzerUpload onAnalyze={handleAnalyze} loading={loading} />
            </motion.div>
          ) : !analysisResult ? (
            <motion.div
              key="success-summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Upload Validated Successfully</h3>
                  <p className="text-xs text-on-surface-variant">
                    All inputs and file limits were verified on the backend. No database records or local files were saved.
                  </p>
                </div>
              </div>

              {/* Verified Metadata Details */}
              <div className="rounded border border-outline bg-surface-container p-5 space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono border-b border-outline pb-2">
                  Verified Analysis Parameters
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px]">Subject</span>
                    <span className="font-bold text-white block mt-0.5">{validationResult.subject}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px]">Branch</span>
                    <span className="font-bold text-white block mt-0.5">{validationResult.branch}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px]">Semester</span>
                    <span className="font-bold text-white block mt-0.5">Semester {validationResult.semester}</span>
                  </div>
                </div>

                <div className="border-t border-outline pt-3.5 space-y-3.5">
                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px] mb-1.5">Syllabus File (1 PDF)</span>
                    <div className="flex items-center gap-2 p-2 bg-surface border border-outline rounded text-xs">
                      <BookOpen size={14} className="text-primary shrink-0" />
                      <span className="font-bold text-white truncate flex-1">{validationResult.syllabus.fileName}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {(validationResult.syllabus.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px] mb-1.5">
                      Question Papers ({validationResult.pyqs.length} PDFs)
                    </span>
                    <div className="space-y-1.5">
                      {validationResult.pyqs.map((paper: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-surface border border-outline rounded text-xs">
                          <Cpu size={14} className="text-primary shrink-0" />
                          <span className="font-bold text-white truncate flex-1">{paper.fileName}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {(paper.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready message for phase 2 */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded flex items-center gap-3">
                <Sparkles size={20} className="text-primary shrink-0 animate-pulse" />
                <div className="text-xs">
                  <h5 className="font-bold text-white">Phase 1 Validation Checked</h5>
                  <p className="text-on-surface-variant mt-0.5">
                    Ready for AI content extraction, semantic grouping, and chapter weightage calculation in Phase 2.
                  </p>
                </div>
              </div>

              {analysisError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs flex items-start gap-2 max-w-3xl mx-auto">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Analysis Error</h4>
                    <p className="mt-1">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={analyzing}
                  className="flex items-center gap-2 rounded border border-outline hover:border-primary/50 hover:bg-surface-container px-5 h-11 text-xs font-bold text-white shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} /> Validate Another Upload
                </button>
                <button
                  type="button"
                  onClick={startPhase2Analysis}
                  disabled={analyzing}
                  className={`flex items-center gap-2 rounded px-5 h-11 text-xs font-bold shadow transition-all ${
                    analyzing ? "bg-surface-container text-zinc-500 border border-outline cursor-not-allowed" : "bg-primary text-black hover:opacity-90 cursor-pointer"
                  }`}
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Extracting & Analyzing... (10-20s)
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Start AI Analysis
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis-dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-8 w-full"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="text-primary animate-pulse" size={24} /> 
                    AI Analysis Results
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono">
                    {validationResult?.subject} • {validationResult?.branch} • Sem {validationResult?.semester}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded border border-outline hover:border-primary/50 hover:bg-surface-container px-4 h-9 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <RefreshCw size={12} /> Start Over
                </button>
              </div>

              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container border border-outline rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
                    <Flame size={14} /> Difficulty
                  </div>
                  <div className="text-xl font-bold text-white">
                    {analysisResult?.overallDifficulty || "N/A"}
                  </div>
                </div>

                <div className="bg-surface-container border border-outline rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
                    <Crosshair size={14} /> Patterns
                  </div>
                  <div className="text-sm font-medium text-white truncate" title={analysisResult?.questionPatterns?.join(", ")}>
                    {analysisResult?.questionPatterns?.length || 0} Key Formats
                  </div>
                </div>

                <div className="bg-surface-container border border-outline rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
                    <Target size={14} /> Predicted Qs
                  </div>
                  <div className="text-xl font-bold text-white">
                    {analysisResult?.predictedPaper?.reduce((acc: number, section: any) => acc + (section.questions?.length || 0), 0) || 0} <span className="text-sm text-on-surface-variant font-normal">Highly Likely</span>
                  </div>
                </div>

                <div className="bg-surface-container border border-outline rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
                    <BookOpen size={14} /> Top Chapter
                  </div>
                  <div className="text-sm font-bold text-white truncate" title={analysisResult?.chapters?.[0]?.name}>
                    {analysisResult?.chapters?.[0]?.name || "N/A"}
                  </div>
                </div>
              </div>

              {/* Study Strategy Timeline */}
              <div className="space-y-4 pt-4 border-t border-outline">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-2">
                  <ListChecks size={16} /> Optimal Study Strategy
                </h4>
                <div className="space-y-3">
                  {analysisResult?.studyStrategy?.map((strategy: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-lg bg-surface border border-outline hover:border-[#3f3f46] transition-all">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-sm font-mono">
                          {strategy.step || idx + 1}
                        </div>
                        {idx !== analysisResult.studyStrategy.length - 1 && (
                          <div className="w-px h-full bg-outline flex-1 mt-1"></div>
                        )}
                      </div>
                      <div className="pb-2">
                        <h5 className="font-bold text-white text-sm mb-1">{strategy.title}</h5>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{strategy.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Weightages & Concepts */}
              <div className="space-y-4 pt-4 border-t border-outline">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">Chapter Weightage & Key Concepts</h4>
                <div className="grid grid-cols-1 gap-4">
                  {analysisResult?.chapters?.map((chapter: any, idx: number) => (
                    <div key={idx} className="bg-surface-container border border-outline p-5 rounded-lg hover:border-[#3f3f46] transition-colors relative overflow-hidden group">
                      <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-1000" style={{ width: `${chapter.weightage}%` }}></div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="space-y-1 mt-1">
                          <h5 className="font-bold text-base text-white">{chapter.name}</h5>
                          <p className="text-xs text-on-surface-variant max-w-2xl">{chapter.description}</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded border border-primary/20 text-sm font-bold shrink-0">
                          {chapter.weightage}%
                        </div>
                      </div>
                      
                      {chapter.importantConcepts && chapter.importantConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline/50">
                          {chapter.importantConcepts.map((concept: string, cIdx: number) => (
                            <span key={cIdx} className="px-2.5 py-1 bg-surface border border-outline text-white text-[10px] rounded font-mono uppercase tracking-wide">
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {chapter.mostAskedQuestions && chapter.mostAskedQuestions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-outline/50 space-y-2">
                          <h6 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Most Asked Questions in this Unit</h6>
                          <div className="space-y-2">
                            {chapter.mostAskedQuestions.map((mq: any, mIdx: number) => (
                              <div key={mIdx} className="flex gap-2 items-start bg-surface/50 p-2 rounded border border-outline/30">
                                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap shrink-0 mt-0.5 border border-primary/20">
                                  {mq.timesAsked}x Asked
                                </span>
                                <p className="text-xs text-white leading-relaxed">
                                  "{mq.question}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Predicted Mock Exam Paper */}
              <div className="space-y-6 pt-6 border-t border-outline">
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-extrabold text-white uppercase tracking-widest font-mono flex items-center justify-center gap-2">
                    <Target size={20} className="text-primary" /> AI Predicted Mock Paper
                  </h4>
                  <p className="text-xs text-on-surface-variant">Generated based on historical patterns and chapter weightages.</p>
                </div>
                
                <div className="space-y-6">
                  {analysisResult?.predictedPaper?.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="bg-surface border border-outline rounded-xl overflow-hidden">
                      <div className="bg-surface-container border-b border-outline p-4 text-center">
                        <h5 className="font-bold text-primary text-lg font-mono">{section.sectionName}</h5>
                        {section.instructions && (
                          <p className="text-xs text-on-surface-variant mt-1 italic">{section.instructions}</p>
                        )}
                      </div>
                      <div className="p-4 sm:p-6 space-y-5">
                        {section.questions?.map((pq: any, qIdx: number) => (
                          <div key={qIdx} className="flex gap-4 group">
                            <div className="shrink-0 pt-0.5">
                              <span className="text-sm font-bold text-on-surface-variant font-mono w-6 inline-block text-right">
                                Q{qIdx + 1}.
                              </span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm text-white font-medium leading-relaxed">
                                  {pq.question}
                                </p>
                                {pq.marks && (
                                  <span className="shrink-0 text-xs font-bold text-on-surface-variant font-mono">
                                    [{pq.marks} Marks]
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                                  <Flame size={10} /> {pq.probability}% Probability
                                </span>
                                <span className="text-[10px] text-primary font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                  → {pq.chapter}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Question Patterns */}
              {analysisResult?.questionPatterns && (
                <div className="space-y-4 pt-4 border-t border-outline">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">Exam Patterns Identified</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.questionPatterns.map((pattern: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 flex items-center gap-2 bg-surface border border-outline text-on-surface-variant hover:text-white text-xs rounded transition-colors">
                        <ChevronRight size={14} className="text-primary" /> {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default PyqAnalyzerPage;
