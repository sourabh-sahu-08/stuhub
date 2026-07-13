import React, { useState } from "react";
import { ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Network, Sparkles, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PyqAnalyzerUpload } from "../components/pyq-analyzer/PyqAnalyzerUpload";
import { motion, AnimatePresence } from "framer-motion";

export function PyqAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);

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
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "File validation failed. Please check file properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setError(null);
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
            className="flex items-center gap-1.5 rounded border border-[#27272D] bg-[#16161A] px-3 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white transition-all cursor-pointer font-mono"
          >
            <Network size={12} className={checkingHealth ? "animate-spin text-primary" : ""} />
            {checkingHealth ? "CHECKING API..." : "TEST API CONNECTIVITY"}
          </button>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="rounded border border-[#27272D] bg-[#0F0F12] p-6 md:p-10 shadow-lg min-h-[60vh] flex flex-col justify-center">
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
          ) : (
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
              <div className="rounded border border-[#27272D] bg-[#16161A] p-5 space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono border-b border-[#27272D] pb-2">
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

                <div className="border-t border-[#27272D] pt-3.5 space-y-3.5">
                  <div>
                    <span className="text-on-surface-variant block font-mono uppercase text-[9px] mb-1.5">Syllabus File (1 PDF)</span>
                    <div className="flex items-center gap-2 p-2 bg-[#0F0F12] border border-[#27272D] rounded text-xs">
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
                        <div key={index} className="flex items-center gap-2 p-2 bg-[#0F0F12] border border-[#27272D] rounded text-xs">
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

              {/* Buttons */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded border border-[#27272D] hover:border-primary/50 hover:bg-[#16161A] px-5 h-11 text-xs font-bold text-white shadow transition-all cursor-pointer"
                >
                  <RefreshCw size={14} /> Validate Another Upload
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default PyqAnalyzerPage;
