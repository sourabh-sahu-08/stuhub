import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  FileText,
  Search,
  Plus,
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  UploadCloud,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface SubjectOption {
  name: string;
  code: string;
}

interface NoteFile {
  _id: string;
  fileName: string;
  title: string;
  subject: string;
  semester: number;
  syllabus: "new" | "old";
  branch: string;
  user: {
    _id: string;
    name: string;
    role: string;
  };
  mimeType?: string;
  driveUrl?: string;
  createdAt: string;
}

const BRANCHES = [
  { code: "IT", name: "Information Technology" },
  { code: "CSE", name: "Computer Science and Engineering" },
  { code: "MECHNICAL", name: "Mechanical Engineering" },
  { code: "CIVIL", name: "Civil Engineering" },
  { code: "MINING", name: "Mining Engineering" },
  { code: "ELEC", name: "Electrical Engineering" },
  { code: "ELECTRONICS AND TELECOMMUNICATION", name: "Electronics and Telecommunication" }
];

export function NotesPage() {
  const { user } = useAuth();

  // Navigation State
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Files & Filtering State
  const [notes, setNotes] = useState<NoteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSyllabusTab, setActiveSyllabusTab] = useState<"new" | "old">("new");

  // Autocomplete suggestions
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notes for the selected path
  const fetchNotes = async (branch: string, sem: number, search = "", syllabus = "all") => {
    setLoading(true);
    try {
      let url = `/notes/list/${branch}/${sem}?q=${encodeURIComponent(search)}`;
      if (syllabus !== "all") {
        url += `&syllabus=${syllabus}`;
      }
      const response = await api.get(url);
      setNotes(response.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subject suggestions based on branch and semester
  const fetchSubjectOptions = async (branch: string, sem: number) => {
    try {
      const response = await api.get(`/notes/subjects/${branch}/${sem}`);
      setSubjectOptions(response.data);
    } catch (err) {
      console.error("Failed to fetch subject options:", err);
    }
  };

  useEffect(() => {
    if (selectedBranch !== null && selectedSemester !== null) {
      fetchNotes(selectedBranch, selectedSemester, searchQuery, activeSyllabusTab);
      fetchSubjectOptions(selectedBranch, selectedSemester);
    }
  }, [selectedBranch, selectedSemester]);

  // Handle Search & Tab filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedBranch && selectedSemester) {
      fetchNotes(selectedBranch, selectedSemester, value, activeSyllabusTab);
    }
  };

  const handleSyllabusTabChange = (tab: "new" | "old") => {
    setActiveSyllabusTab(tab);
    if (selectedBranch && selectedSemester) {
      fetchNotes(selectedBranch, selectedSemester, searchQuery, tab);
    }
  };

  // Handle Dropdown selection click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSubjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // View note inline
  const handleView = async (note: NoteFile) => {
    if (note.driveUrl) {
      window.open(note.driveUrl, "_blank");
      return;
    }
    try {
      const response = await api.get(`/notes/download/${note._id}`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: note.mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to view file:", err);
      alert("Failed to load preview.");
    }
  };

  // Download note file
  const handleDownload = async (id: string, fileName: string, mimeType?: string) => {
    try {
      const response = await api.get(`/notes/download/${id}`, {
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

  // Delete note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete these notes?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notes:", err);
      alert("Failed to delete notes.");
    }
  };

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const getBranchName = (code: string) => {
    return BRANCHES.find((b) => b.code === code)?.name ?? code;
  };

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      {/* ================= BREADCRUMBS ================= */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-zinc-500 no-print">
        <button
          onClick={() => {
            setSelectedBranch(null);
            setSelectedSemester(null);
          }}
          className={`hover:text-[#F5A524] transition-colors ${
            selectedBranch === null ? "text-[#F5A524] font-bold" : ""
          }`}
        >
          NOTES
        </button>
        {selectedBranch !== null && (
          <>
            <span>/</span>
            <button
              onClick={() => {
                setSelectedSemester(null);
              }}
              className={`hover:text-[#F5A524] transition-colors ${
                selectedSemester === null ? "text-[#F5A524] font-bold" : ""
              }`}
            >
              {selectedBranch}
            </button>
          </>
        )}
        {selectedSemester !== null && (
          <>
            <span>/</span>
            <span className="text-[#F5A524] font-bold">SEMESTER {selectedSemester}</span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedBranch === null ? (
          /* ================= LEVEL 1: BRANCHES ================= */
          <motion.div
            key="branches"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Notes Library
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Select your engineering branch to browse and share lecture notes, books, and study materials.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BRANCHES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setSelectedBranch(b.code)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-outline bg-surface p-5 text-left transition-all hover:border-[#F5A524] hover:shadow-[0_0_15px_rgba(245,165,36,0.05)] focus:outline-none focus:ring-2 focus:ring-[#F5A524]"
                >
                  <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-[#F5A524]/5 transition-transform group-hover:scale-125" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F5A524]/10 text-[#F5A524] transition-colors group-hover:bg-[#F5A524] group-hover:text-black">
                    <Folder size={18} fill="currentColor" className="opacity-80" />
                  </div>
                  <div className="mt-6">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      Branch: {b.code}
                    </span>
                    <h3 className="mt-0.5 text-sm font-bold text-zinc-200 group-hover:text-white line-clamp-1">
                      {b.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : selectedSemester === null ? (
          /* ================= LEVEL 2: SEMESTERS ================= */
          <motion.div
            key="semesters"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedBranch(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-outline bg-surface-container text-zinc-400 transition-colors hover:bg-[#27272D] hover:text-white"
                aria-label="Back to branches"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {getBranchName(selectedBranch)}
                </h1>
                <p className="text-xs text-zinc-400">Select your academic semester</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-outline bg-surface p-5 text-left transition-all hover:border-[#F5A524] hover:shadow-[0_0_15px_rgba(245,165,36,0.05)] focus:outline-none"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F5A524]/10 text-[#F5A524] transition-colors group-hover:bg-[#F5A524] group-hover:text-black">
                    <Folder size={16} fill="currentColor" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white">
                      Semester {sem}
                    </h3>
                    <p className="text-[10px] text-zinc-500">Notes repository</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ================= LEVEL 3: NOTES FILES LIST ================= */
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedSemester(null);
                    setSearchQuery("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-outline bg-surface-container text-zinc-400 transition-colors hover:bg-[#27272D] hover:text-white"
                  aria-label="Back to semesters"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white sm:text-2xl">
                    Semester {selectedSemester} Notes
                  </h1>
                  <p className="text-xs text-zinc-400">
                    {getBranchName(selectedBranch)} ({selectedBranch})
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Syllabus Tabs */}
              <div className="flex items-center gap-6 border-b border-outline pb-0">
                {(["new", "old"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleSyllabusTabChange(tab)}
                    className={`cursor-pointer pb-2 px-0 text-xs font-bold uppercase transition-colors relative border-b-2 -mb-[2px] ${
                      activeSyllabusTab === tab
                        ? "border-[#F5A524] text-[#F5A524]"
                        : "border-transparent text-zinc-500 hover:text-white"
                    }`}
                  >
                    {tab} syllabus
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search notes title or subject..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-md border border-outline bg-surface py-2.5 pl-10 pr-4 text-xs text-zinc-200 outline-none transition-colors placeholder:text-zinc-500 focus:border-[#F5A524]"
                />
              </div>
            </div>

            {/* Notes List */}
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-outline bg-surface">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#F5A524] border-t-transparent" />
                <span className="mt-2 text-xs font-mono text-zinc-500">
                  RETRIEVING FILES...
                </span>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-outline bg-surface p-6 text-center">
                <AlertCircle size={28} className="text-zinc-500" />
                <h3 className="mt-3 text-sm font-bold text-zinc-200">No notes found</h3>
                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                  No study materials uploaded for this selection yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    className="flex flex-col justify-between rounded-lg border border-outline bg-surface p-4 transition-colors hover:border-[#3F3F46]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container text-zinc-500">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-zinc-200">
                            {note.title}
                          </h4>
                          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                            <span className="rounded bg-[#F5A524]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F5A524]">
                              {note.subject}
                            </span>
                            <span className="rounded bg-[#27272D] px-2 py-0.5 text-[9px] font-mono text-zinc-400 uppercase">
                              {note.syllabus} Syllabus
                            </span>
                          </div>
                        </div>
                      </div>

                      {user?.id === note.user?._id && (
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="shrink-0 p-1.5 rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          title="Delete Notes"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-outline pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {note.user?.name ?? "Anonymous"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(note)}
                          className="flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1.5 text-[10px] font-bold text-zinc-200 hover:bg-[#27272D] transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                        {!note.driveUrl && (
                          <button
                            onClick={() =>
                              handleDownload(note._id, note.fileName, note.mimeType)
                            }
                            className="flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1.5 text-[10px] font-bold text-zinc-200 hover:bg-[#27272D] transition-colors"
                          >
                            <Download size={12} /> Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotesPage;
