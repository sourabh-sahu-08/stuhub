import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, Image as ImageIcon, X, Sparkles, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PyqUploadProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
  loadingStep: number;
}

const STEPS = [
  "Uploading File...",
  "Reading Document...",
  "Extracting Text (OCR)...",
  "AI Analyzing Paper...",
  "Generating Dashboard..."
];

export function PyqUpload({ onAnalyze, loading, loadingStep }: PyqUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please upload a PDF, PNG, JPG, or JPEG file.");
      return;
    }
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (file) {
      onAnalyze(file);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Upload Question Paper
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload your mid-term, end-term, or practice papers in PDF or image formats to get a comprehensive AI analysis.
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={!file ? triggerFileSelect : undefined}
              className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                  : file
                  ? "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 cursor-default"
                  : "border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/20"
              }`}
            >
              {/* Grid background effect */}
              <div className="absolute inset-0 -z-10 opacity-[0.05] dark:opacity-[0.03] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf, image/png, image/jpeg, image/jpg"
                onChange={handleChange}
              />

              {!file ? (
                <div className="space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-500 shadow-sm">
                    <Upload size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Drag & drop your question paper here, or <span className="text-brand-500 hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Supports PDF, PNG, JPG, or JPEG (Max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6 text-left">
                  {/* File preview */}
                  <div className="flex-shrink-0">
                    {previewUrl ? (
                      <div className="relative h-28 w-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-28 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-brand-500 shadow-sm">
                        <FileText size={36} />
                      </div>
                    )}
                  </div>

                  {/* File details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatSize(file.size)} &bull; {file.type.split("/")[1].toUpperCase()}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm"
                    >
                      <X size={14} /> Remove File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-6 h-12 text-sm font-bold text-white shadow-soft transition-all hover:shadow-[0_5px_20px_rgba(99,102,241,0.4)]"
                >
                  <Sparkles size={16} /> Analyze Question Paper
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Premium loading step tracker */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-8 shadow-soft backdrop-blur-md space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="relative mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-500 shadow-sm overflow-hidden">
                <Loader2 size={32} className="animate-spin text-brand-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Analyzing Document
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Our AI engine is processing your paper. This may take up to a minute.
                </p>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="space-y-4 max-w-md mx-auto">
              {STEPS.map((stepName, index) => {
                const isCompleted = index < loadingStep;
                const isActive = index === loadingStep;
                const isFuture = index > loadingStep;

                return (
                  <div
                    key={stepName}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      isFuture ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    {/* Circle Indicator */}
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-soft"
                          : isActive
                          ? "bg-brand-500 text-white animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : index + 1}
                    </div>

                    {/* Step label */}
                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive
                          ? "text-brand-500 dark:text-brand-400 font-bold"
                          : isCompleted
                          ? "text-slate-700 dark:text-slate-300 line-through decoration-slate-300 dark:decoration-slate-700"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
