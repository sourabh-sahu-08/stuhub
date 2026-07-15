import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  UploadCloud,
  X,
  Calendar,
  User,
  Trash2,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface SubjectOption {
  name: string;
  code: string;
}

interface PyqPaper {
  _id: string;
  fileName: string;
  paperName: string;
  subject: string;
  semester: number;
  user: {
    _id: string;
    name: string;
    role: string;
  };
  mimeType: string;
  createdAt: string;
}

export function PyqPage() {
  const { user } = useAuth();
  
  // Navigation & Data State
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [papers, setPapers] = useState<PyqPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [paperName, setPaperName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Subject Autocomplete Options
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch papers for the selected semester
  const fetchPapers = async (sem: number, search = "") => {
    setLoading(true);
    try {
      const response = await api.get(
        `/pyq/semester/${sem}?q=${encodeURIComponent(search)}`
      );
      setPapers(response.data);
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch seeded subjects for the selected semester
  const fetchSubjectOptions = async (sem: number) => {
    try {
      const response = await api.get(`/pyq/subjects/${sem}`);
      setSubjectOptions(response.data);
    } catch (err) {
      console.error("Failed to fetch subject options:", err);
    }
  };

  useEffect(() => {
    if (selectedSemester !== null) {
      fetchPapers(selectedSemester, searchQuery);
      fetchSubjectOptions(selectedSemester);
    }
  }, [selectedSemester]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedSemester !== null) {
      fetchPapers(selectedSemester, value);
    }
  };

  // Handle Dropdown selection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSubjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    
    if (!isPdf && !isImage) {
      alert("Unsupported file format! Please upload a PDF or an Image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Maximum allowed size is 5MB.");
      return;
    }

    setSelectedFile(file);
    // Pre-fill paper name if empty
    if (!paperName) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));
      setPaperName(nameWithoutExt);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !paperName.trim() || !subject.trim() || selectedSemester === null) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("paperName", paperName.trim());
      formData.append("subject", subject.trim());
      formData.append("semester", selectedSemester.toString());

      await api.post("/pyq/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset Form and close modal
      setPaperName("");
      setSubject("");
      setSelectedFile(null);
      setIsUploadOpen(false);
      
      // Refresh list
      fetchPapers(selectedSemester, searchQuery);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload PYQ. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // View file inline in new tab
  const handleView = async (id: string, mimeType: string) => {
    try {
      const response = await api.get(`/pyq/download/${id}`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to view file:", err);
      alert("Failed to load preview.");
    }
  };

  // Download file to local storage
  const handleDownload = async (id: string, fileName: string, mimeType: string) => {
    try {
      const response = await api.get(`/pyq/download/${id}`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Failed to download file.");
    }
  };

  // Delete paper
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question paper?")) return;

    try {
      await api.delete(`/pyq/${id}`);
      setPapers((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete paper:", err);
      alert("Failed to delete paper.");
    }
  };

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  // Suggested subjects filtered by user typing
  const filteredSubjects = subjectOptions.filter((opt) =>
    opt.name.toLowerCase().includes(subject.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <AnimatePresence mode="wait">
        {selectedSemester === null ? (
          /* ================= GRID OVERVIEW ================= */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Previous Year Question Papers
              </h1>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Select a semester to browse, upload, and download question papers for various subjects.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#27272D] bg-[#0F0F12] p-5 text-left transition-all hover:border-[#F5A524] hover:shadow-[0_0_15px_rgba(245,165,36,0.07)] focus:outline-none focus:ring-2 focus:ring-[#F5A524] focus:ring-offset-2 focus:ring-offset-[#09090B]"
                >
                  <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-[#F5A524]/5 transition-transform group-hover:scale-125" />
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A524]/10 text-[#F5A524] transition-colors group-hover:bg-[#F5A524] group-hover:text-black">
                    <BookOpen size={20} />
                  </div>

                  <div className="mt-8">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#71717A]">
                      Academics
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-[#E2E2E2] group-hover:text-white">
                      Semester {sem}
                    </h3>
                    <p className="mt-1 text-xs text-[#71717A]">
                      View past mid-sem & end-sem papers
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ================= DETAIL VIEW ================= */
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col space-y-6"
          >
            {/* Header / Back */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedSemester(null);
                    setSearchQuery("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272D] bg-[#16161A] text-[#A1A1AA] transition-colors hover:bg-[#27272D] hover:text-white"
                  aria-label="Back to semesters"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white sm:text-2xl">
                    Semester {selectedSemester} PYQs
                  </h1>
                  <p className="text-xs text-[#A1A1AA]">
                    Past exam question papers repository
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center justify-center gap-2 rounded-md bg-[#F5A524] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={15} /> Upload PYQ Paper
              </button>
            </div>

            {/* Search filter */}
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#71717A]">
                search
              </span>
              <input
                type="text"
                placeholder="Search subject or paper name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-md border border-[#27272D] bg-[#0F0F12] py-2.5 pl-10 pr-4 text-xs text-[#E2E2E2] outline-none transition-colors placeholder:text-[#71717A] focus:border-[#F5A524]"
              />
            </div>

            {/* PYQ Papers List */}
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-[#27272D] bg-[#0F0F12]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#F5A524] border-t-transparent" />
                <span className="mt-2 text-xs font-mono text-[#71717A]">
                  RETRIEVING PYQS...
                </span>
              </div>
            ) : papers.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-[#27272D] bg-[#0F0F12] p-6 text-center">
                <AlertCircle size={28} className="text-[#71717A]" />
                <h3 className="mt-3 text-sm font-bold text-[#E2E2E2]">
                  No papers found
                </h3>
                <p className="mt-1 max-w-xs text-xs text-[#71717A]">
                  Be the first to upload a question paper for Semester {selectedSemester}!
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-4 text-xs font-bold text-[#F5A524] hover:underline"
                >
                  Upload now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {papers.map((paper) => (
                  <div
                    key={paper._id}
                    className="flex flex-col justify-between rounded-lg border border-[#27272D] bg-[#0F0F12] p-4 transition-colors hover:border-[#3F3F46]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#16161A] text-[#71717A]">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-[#E2E2E2]">
                            {paper.paperName}
                          </h4>
                          <span className="mt-1.5 inline-block rounded bg-[#F5A524]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F5A524]">
                            {paper.subject}
                          </span>
                        </div>
                      </div>

                      {user?.id === paper.user?._id && (
                        <button
                          onClick={() => handleDelete(paper._id)}
                          className="shrink-0 p-1.5 rounded text-[#71717A] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          title="Delete Paper"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-[#27272D] pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-[#71717A]">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(paper.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {paper.user?.name ?? "Anonymous"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(paper._id, paper.mimeType)}
                          className="flex items-center gap-1.5 rounded bg-[#16161A] px-2.5 py-1.5 text-[10px] font-bold text-[#E2E2E2] hover:bg-[#27272D] transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(paper._id, paper.fileName, paper.mimeType)
                          }
                          className="flex items-center gap-1.5 rounded bg-[#16161A] px-2.5 py-1.5 text-[10px] font-bold text-[#E2E2E2] hover:bg-[#27272D] transition-colors"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= UPLOAD MODAL ================= */}
      <AnimatePresence>
        {isUploadOpen && selectedSemester !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!uploadLoading) setIsUploadOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg rounded-xl border border-[#27272D] bg-[#0F0F12] p-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  if (!uploadLoading) setIsUploadOpen(false);
                }}
                disabled={uploadLoading}
                className="absolute right-4 top-4 text-[#71717A] hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <h2 className="text-lg font-bold text-white">Upload Question Paper</h2>
              <p className="text-xs text-[#71717A]">
                Uploading paper to Semester {selectedSemester} repository.
              </p>

              <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
                {/* Subject autocomplete */}
                <div className="relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={uploadLoading}
                    placeholder="e.g. Database Management Systems"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSubjectDropdownOpen(true);
                    }}
                    onFocus={() => setSubjectDropdownOpen(true)}
                    className="mt-1 w-full rounded-md border border-[#27272D] bg-[#16161A] px-3 py-2 text-xs text-white outline-none focus:border-[#F5A524] disabled:opacity-65"
                  />

                  {/* Autocomplete list */}
                  {subjectDropdownOpen && filteredSubjects.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-[#27272D] bg-[#16161A] p-1 shadow-xl">
                      {filteredSubjects.map((opt) => (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setSubject(opt.name);
                            setSubjectDropdownOpen(false);
                          }}
                          className="w-full rounded px-2.5 py-1.5 text-left text-xs hover:bg-[#27272D] text-[#E2E2E2]"
                        >
                          <span className="font-bold text-[#F5A524] mr-2">
                            [{opt.code}]
                          </span>
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Paper Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                    Paper Title / Description
                  </label>
                  <input
                    type="text"
                    required
                    disabled={uploadLoading}
                    placeholder="e.g. Mid Semester Exam 2024"
                    value={paperName}
                    onChange={(e) => setPaperName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#27272D] bg-[#16161A] px-3 py-2 text-xs text-white outline-none focus:border-[#F5A524] disabled:opacity-65"
                  />
                </div>

                {/* Semester locked */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                    Semester
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`Semester ${selectedSemester}`}
                    className="mt-1 w-full rounded-md border border-[#27272D] bg-[#16161A]/50 px-3 py-2 text-xs text-[#71717A] outline-none"
                  />
                </div>

                {/* Dropzone file input */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all ${
                    dragActive
                      ? "border-[#F5A524] bg-[#F5A524]/5"
                      : "border-[#27272D] bg-[#16161A] hover:border-[#3F3F46]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    disabled={uploadLoading}
                    onChange={handleFileChange}
                    accept="application/pdf,image/*"
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText size={24} className="text-[#F5A524]" />
                      <p className="mt-2 text-xs font-bold text-[#E2E2E2] max-w-[250px] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-[#71717A]">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploadLoading}
                        className="mt-3 text-[10px] font-bold text-red-500 hover:underline disabled:opacity-50"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={28} className="text-[#71717A]" />
                      <p className="mt-2 text-xs font-semibold text-[#E2E2E2]">
                        Drag and drop your paper, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadLoading}
                          className="text-[#F5A524] hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-[9px] text-[#71717A] mt-1">
                        Supports PDF, PNG, JPG, or JPEG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 border-t border-[#27272D] pt-4">
                  <button
                    type="button"
                    disabled={uploadLoading}
                    onClick={() => setIsUploadOpen(false)}
                    className="rounded-md bg-[#16161A] px-4 py-2 text-xs font-bold text-[#E2E2E2] hover:bg-[#27272D] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading || !selectedFile}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-[#F5A524] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
                  >
                    {uploadLoading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PyqPage;
