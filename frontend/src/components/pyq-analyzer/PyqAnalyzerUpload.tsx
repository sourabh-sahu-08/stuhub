import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, X, Sparkles, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PyqAnalyzerUploadProps {
  onAnalyze: (data: {
    subject: string;
    branch: string;
    semester: number;
    syllabus: File;
    pyqs: File[];
  }) => void;
  loading: boolean;
}

export function PyqAnalyzerUpload({ onAnalyze, loading }: PyqAnalyzerUploadProps) {
  // Form fields
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState<number | "">("");

  // Files
  const [syllabus, setSyllabus] = useState<File | null>(null);
  const [pyqs, setPyqs] = useState<File[]>([]);

  // Errors
  const [error, setError] = useState<string | null>(null);

  // Drag states
  const [isSyllabusDragActive, setIsSyllabusDragActive] = useState(false);
  const [isPyqDragActive, setIsPyqDragActive] = useState(false);

  // Refs
  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const pyqInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Format bytes helper
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Syllabus file handlers
  const handleSyllabusDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsSyllabusDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsSyllabusDragActive(false);
    }
  };

  const processSyllabusFile = (file: File) => {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Syllabus must be a PDF file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Syllabus exceeds 5MB size limit (${formatSize(file.size)}).`);
      return;
    }
    setSyllabus(file);
  };

  const handleSyllabusDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSyllabusDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSyllabusFile(e.dataTransfer.files[0]);
    }
  };

  const handleSyllabusChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSyllabusFile(e.target.files[0]);
    }
  };

  // PYQs handlers
  const handlePyqDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsPyqDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsPyqDragActive(false);
    }
  };

  const processPyqFiles = (fileList: FileList) => {
    setError(null);
    const newFiles: File[] = [];
    let fileError: string | null = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type !== "application/pdf") {
        fileError = "Only PDF files are allowed for question papers.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        fileError = `File "${file.name}" exceeds 5MB limit (${formatSize(file.size)}).`;
        continue;
      }
      // Avoid duplicate names in current selection
      if (!pyqs.some((f) => f.name === file.name) && !newFiles.some((f) => f.name === file.name)) {
        newFiles.push(file);
      }
    }

    if (fileError) {
      setError(fileError);
    }

    if (newFiles.length > 0) {
      setPyqs((prev) => {
        const combined = [...prev, ...newFiles];
        if (combined.length > 10) {
          setError("Maximum of 10 question papers can be uploaded.");
          return combined.slice(0, 10);
        }
        return combined;
      });
    }
  };

  const handlePyqDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPyqDragActive(false);
    if (e.dataTransfer.files) {
      processPyqFiles(e.dataTransfer.files);
    }
  };

  const handlePyqChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processPyqFiles(e.target.files);
    }
  };

  const removePyq = (index: number) => {
    setPyqs((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit check
  const isFormValid =
    subject.trim().length >= 2 &&
    branch.trim().length >= 2 &&
    semester !== "" &&
    syllabus !== null &&
    pyqs.length >= 3 &&
    pyqs.length <= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && syllabus) {
      onAnalyze({
        subject: subject.trim(),
        branch: branch.trim(),
        semester: Number(semester),
        syllabus,
        pyqs,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-2xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
          <Sparkles size={24} className="text-primary animate-pulse" />
          AI PYQ Analyzer Upload
        </h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Select course parameters, upload exactly 1 syllabus, and select 3–10 past exam papers to validate for multi-paper analyzer.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Course Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Subject Name
          </label>
          <input
            type="text"
            required
            value={subject}
            placeholder="e.g. Operating Systems"
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
            className="w-full h-11 px-4 rounded border border-outline bg-surface-container text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Branch
          </label>
          <input
            type="text"
            required
            value={branch}
            placeholder="e.g. Computer Science"
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
            className="w-full h-11 px-4 rounded border border-outline bg-surface-container text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Semester
          </label>
          <select
            required
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value) || "")}
            disabled={loading}
            className="w-full h-11 px-4 rounded border border-outline bg-surface-container text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">Select Semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Syllabus Upload Dropzone */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
          Syllabus PDF (Exactly 1 file)
        </label>
        
        {!syllabus ? (
          <div
            onDragEnter={handleSyllabusDrag}
            onDragOver={handleSyllabusDrag}
            onDragLeave={handleSyllabusDrag}
            onDrop={handleSyllabusDrop}
            onClick={() => syllabusInputRef.current?.click()}
            className={`border-2 border-dashed p-6 rounded text-center cursor-pointer transition-all ${
              isSyllabusDragActive
                ? "border-primary bg-primary/5"
                : "border-outline bg-surface-container/40 hover:border-primary/50 hover:bg-surface-container/80"
            }`}
          >
            <input
              ref={syllabusInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleSyllabusChange}
              disabled={loading}
            />
            <Upload size={20} className="mx-auto text-primary mb-2" />
            <p className="text-xs font-bold text-white">
              Drag & drop syllabus here, or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-on-surface-variant mt-1">
              PDF only, up to 5MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-surface-container border border-outline rounded">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-9 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{syllabus.name}</p>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                  {formatSize(syllabus.size)} &bull; PDF
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSyllabus(null)}
              disabled={loading}
              className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
              title="Remove Syllabus"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* PYQs Multiple Upload Dropzone */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Exam Question Papers (3 to 10 PDFs)
          </label>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {pyqs.length} / 10 selected
          </span>
        </div>

        {pyqs.length < 10 && (
          <div
            onDragEnter={handlePyqDrag}
            onDragOver={handlePyqDrag}
            onDragLeave={handlePyqDrag}
            onDrop={handlePyqDrop}
            onClick={() => pyqInputRef.current?.click()}
            className={`border-2 border-dashed p-6 rounded text-center cursor-pointer transition-all ${
              isPyqDragActive
                ? "border-primary bg-primary/5"
                : "border-outline bg-surface-container/40 hover:border-primary/50 hover:bg-surface-container/80"
            }`}
          >
            <input
              ref={pyqInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handlePyqChange}
              disabled={loading}
            />
            <Upload size={20} className="mx-auto text-primary mb-2" />
            <p className="text-xs font-bold text-white">
              Drag & drop question papers here, or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Select multiple PDFs, up to 5MB each (Min 3 required)
            </p>
          </div>
        )}

        {/* Selected files list */}
        {pyqs.length > 0 && (
          <div className="mt-3 space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {pyqs.map((file, idx) => (
              <div
                key={file.name + idx}
                className="flex items-center justify-between p-3 bg-surface-container border border-outline rounded hover:border-[#3f3f46] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-8 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      {formatSize(file.size)} &bull; PDF
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePyq(idx)}
                  disabled={loading}
                  className="p-1.5 rounded hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Section */}
      <div className="pt-4 flex flex-col items-center sm:items-start gap-3">
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded px-6 h-12 text-sm font-bold shadow-lg transition-all ${
            isFormValid && !loading
              ? "bg-primary text-black hover:opacity-90 cursor-pointer"
              : "bg-[#27272D] text-zinc-500 cursor-not-allowed border border-[#3f3f46]/45"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Validating Files...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Start Analysis (Validate)
            </>
          )}
        </button>

        {/* Dynamic tips for user */}
        {!isFormValid && (
          <p className="text-[10px] text-on-surface-variant font-mono">
            REQUIREMENTS: 2+ char subject, 2+ char branch, select semester, syllabus PDF, and 3–10 PYQ PDFs.
          </p>
        )}
        {isFormValid && (
          <p className="text-[10px] text-emerald-500 flex items-center gap-1 font-mono">
            <CheckCircle2 size={12} />
            Ready for validation check.
          </p>
        )}
      </div>
    </form>
  );
}
