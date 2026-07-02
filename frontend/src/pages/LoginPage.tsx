import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Search,
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Library,
  Sparkles,
  X,
  HelpCircle,
  ChevronDown,
  Brain
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CompleteProfileModal } from "../components/auth/CompleteProfileModal";

const features = [
  {
    title: "Assignments Tracker",
    shortTitle: "Assignments",
    description: "Centralize your coursework. Monitor deadlines, track submission status, and record scores in a structured student workflow.",
    icon: ClipboardCheck,
    color: "from-blue-500 to-indigo-500",
    bullets: [
      "Deadlines alert & notification bubble",
      "Status badges (Not Started, In Progress, Submitted)",
      "Credit and score weighting calculations"
    ],
    mockup: {
      type: "assignments",
      data: [
        { title: "DBMS Assignment 3", due: "Tomorrow", status: "In Progress", weight: "10%" },
        { title: "OS Kernel Lab", due: "July 8", status: "Not Started", weight: "15%" },
        { title: "Applied AI Midterm Project", due: "Completed", status: "Submitted", weight: "20%" }
      ]
    }
  },
  {
    title: "Attendance Watch",
    shortTitle: "Attendance",
    description: "Stay on top of university attendance criteria. Log conducted classes, preview status, and ensure you remain above the safe threshold.",
    icon: Calendar,
    color: "from-amber-500 to-orange-500",
    bullets: [
      "Interactive log calendars",
      "Custom target percentage inputs (default 75%)",
      "Smart warnings (e.g., 'Attend 3 classes to recover')"
    ],
    mockup: {
      type: "attendance",
      pct: 78.5,
      required: 75,
      status: "Safe"
    }
  },
  {
    title: "Digital Library",
    shortTitle: "Library",
    description: "Upload, store, and organize course materials. Find uploaded notes, slides, and syllabus documents with instant text search.",
    icon: Library,
    color: "from-emerald-500 to-teal-500",
    bullets: [
      "Category tagging (Notes, Labs, Papers)",
      "Multi-format file attachments",
      "Quick search index"
    ],
    mockup: {
      type: "library",
      files: [
        { name: "DBMS_Syllabus_2026.pdf", size: "1.2 MB", tag: "Syllabus" },
        { name: "OS_Lecture_5.pdf", size: "4.8 MB", tag: "Lecture Notes" },
        { name: "AI_Search_Algorithms.png", size: "850 KB", tag: "Diagram" }
      ]
    }
  },
  {
    title: "AI Studio",
    shortTitle: "AI Studio",
    description: "Leverage custom LLM chats, summarize note files, and calculate target study planners with smart algorithms.",
    icon: Sparkles,
    color: "from-purple-500 to-fuchsia-500",
    bullets: [
      "Interactive chatbot window",
      "Markdown and code block formatting",
      "Semantic context parsing"
    ],
    mockup: {
      type: "ai",
      messages: [
        { role: "user", text: "Explain binary search trees." },
        { role: "ai", text: "A BST is a node-based binary tree structure where the left subtree contains keys less than the parent." }
      ]
    }
  },
  {
    title: "AI PYQ Analyzer",
    shortTitle: "PYQ Analyzer",
    description: "Scan previous papers, predict exam patterns, and get custom AI study plans using Groq vision API.",
    icon: Brain,
    color: "from-indigo-500 to-purple-500",
    bullets: [
      "PDF & Image vision analysis (via Groq Vision)",
      "Automated difficulty score calculations",
      "Predicted question bank generation"
    ],
    mockup: {
      type: "pyq",
      topics: [
        { name: "Indexing & Hashing", pct: 40 },
        { name: "Concurrency Control", pct: 30 },
        { name: "Query Optimization", pct: 20 }
      ]
    }
  }
];

export function LoginPage() {
  const { user, login, register, socialLogin } = useAuth();
  
  // Navigation & UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentHeroFeature, setCurrentHeroFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroFeature((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Interactive Mockup States
  const [mockAssignments, setMockAssignments] = useState([
    { id: 1, title: "DBMS Assignment 3", due: "Tomorrow", status: "In Progress", weight: "10%" },
    { id: 2, title: "OS Kernel Lab", due: "July 8", status: "Not Started", weight: "15%" },
    { id: 3, title: "Applied AI Midterm Project", due: "Completed", status: "Submitted", weight: "20%" }
  ]);
  const [attendedClasses, setAttendedClasses] = useState(11);
  const [totalClasses, setTotalClasses] = useState(14);
  const [librarySearch, setLibrarySearch] = useState("");
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  
  const initialMessages = [
    { role: "user", text: "Explain binary search trees." },
    { role: "ai", text: "A BST is a node-based binary tree structure where the left subtree contains keys less than the parent." }
  ];
  const [aiConversation, setAiConversation] = useState(initialMessages);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [pyqScanState, setPyqScanState] = useState<"idle" | "scanning" | "done">("idle");

  // Auth Form States
  const [name, setName] = useState("Riya Sharma");
  const [email, setEmail] = useState("student@stuhub.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Google Identity Services SDK
  useEffect(() => {
    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-gsi-client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Initialize and Render Google Sign-In Button
  useEffect(() => {
    if (!isModalOpen) return;

    const interval = setInterval(() => {
      const google = (window as any).google;
      if (google && google.accounts) {
        clearInterval(interval);
        
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: async (response: any) => {
            setLoading(true);
            setError("");
            try {
              await socialLogin(response.credential);
              setIsModalOpen(false);
            } catch (err) {
              setError("Google authentication failed. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: btnElement.clientWidth || 380,
            text: "signin_with"
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isModalOpen]);

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (modalMode === "login") {
        await login(email, password);
      } else {
        await register({ name, email, password, role: "student" });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError("");
    try {
      if (provider === "google") {
        const mockPayload = JSON.stringify({
          email: "sourabh08923@gmail.com",
          name: "Sourabh Sahu",
          avatar: "https://lh3.googleusercontent.com/a/default-user"
        });
        await socialLogin(mockPayload);
      } else {
        const mockPayload = JSON.stringify({
          email: "sourabh_github@stuhub.edu",
          name: "Sourabh Github",
          avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
        });
        await socialLogin(mockPayload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError("Social login authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login("student@stuhub.edu", "password123");
      setIsModalOpen(false);
    } catch (err) {
      setError("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Interactive Mockup Simulation Actions
  const toggleAssignment = (id: number) => {
    setMockAssignments(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Submitted" ? "In Progress" : "Submitted",
              due: item.status === "Submitted" ? "Tomorrow" : "Completed"
            }
          : item
      )
    );
  };

  const handleLogAttendance = (attended: boolean) => {
    setTotalClasses(t => t + 1);
    if (attended) {
      setAttendedClasses(a => a + 1);
    }
  };

  const handleDownloadFile = (fileName: string) => {
    if (downloadingFile) return;
    setDownloadingFile(fileName);
    setTimeout(() => {
      setDownloadingFile(null);
    }, 1500);
  };

  const handleAiPromptClick = (promptText: string) => {
    if (isAiTyping) return;
    setAiConversation([
      { role: "user", text: promptText },
      { role: "ai", text: "Thinking..." }
    ]);
    setIsAiTyping(true);
    
    let fullResponse = "";
    if (promptText.includes("BST")) {
      fullResponse = "A Binary Search Tree (BST) is a tree where each node has at most two children. The left subtree has keys smaller than the node, and the right subtree has keys larger.";
    } else if (promptText.includes("semaphore")) {
      fullResponse = "A semaphore is a variable or abstract data type used to control access to a common resource by multiple processes in a concurrent system.";
    } else {
      fullResponse = "Here is a quick summary: Normalization in databases removes redundancy and improves data integrity by structuring tables logically.";
    }

    setTimeout(() => {
      setAiConversation([
        { role: "user", text: promptText },
        { role: "ai", text: fullResponse }
      ]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handlePyqScan = () => {
    if (pyqScanState !== "idle") return;
    setPyqScanState("scanning");
    setTimeout(() => {
      setPyqScanState("done");
    }, 2000);
  };

  const triggerSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsModalOpen(true);
    setModalMode("login");
  };

  const faqData = [
    {
      q: "What is Stuhub?",
      a: "Stuhub is a student-centric command center designed to centralize and scale your academic workflows. It unifies course assignments, attendance, library archives, and smart AI planners in one premium workspace."
    },
    {
      q: "How does the AI Studio help me?",
      a: "Our built-in AI Studio provides intelligent notes summarization, custom study schedules, recommendations, and study prompts to keep you prepared for internal and external assessments."
    },
    {
      q: "Is it mobile responsive?",
      a: "Absolutely! Stuhub is fully responsive and designed to work on everything from large desktop monitors to mobile phone screens with premium glassmorphic overlays."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500 selection:text-white">
      {/* 1. Header Nav */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 select-none">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">Stuhub</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-500 font-bold block -mt-1">Student Portal</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#home" className="hover:text-brand-500 transition-colors duration-200">Home</a>
          <a href="#features" className="hover:text-brand-500 transition-colors duration-200">Workspace Overview</a>
          <a href="#faq" className="hover:text-brand-500 transition-colors duration-200">FAQ</a>
        </nav>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Link to="/dashboard" className="flex items-center gap-2 group select-none">
                {/* Circular Avatar Progress Ring (25%) */}
                <div className="relative flex items-center justify-center h-8 w-8">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="13" className="stroke-white/10 fill-none" strokeWidth="2" />
                    <circle cx="16" cy="16" r="13" className="stroke-brand-500 fill-none" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 13}`} strokeDashoffset={`${2 * Math.PI * 13 * (1 - 0.25)}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute h-6.5 w-6.5 rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold uppercase text-white">
                    {user.name.slice(0, 1)}
                  </div>
                </div>
                <div className="hidden min-w-0 sm:flex items-center gap-1">
                  <span className="truncate text-xs font-semibold text-slate-200 group-hover:text-brand-500 transition-colors">{user.name}</span>
                  <span className="text-[10px] text-brand-500 font-bold">25%</span>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setModalMode("login");
              }}
              className="focus-ring h-10 px-6 rounded-lg bg-brand-500 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] active:scale-95"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Image with Blurred Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/workspace_background.jpg"
            alt="Collaborative Workspace"
            className="w-full h-full object-cover filter brightness-[0.2] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          
          {/* Glowing colorful ambient background blobs */}
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Active Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500 select-none shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />
              STUHUB STUDENT ENVIRONMENT IS ACTIVE
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              The Command Center for <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-400">
                Academic Success
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-slate-350">
              Unify your course assignments, track attendance safeties, build digital notes libraries, and analyze previous exam papers with Groq-powered AI.
            </p>

            {/* Search Box */}
            <form onSubmit={triggerSearch} className="max-w-lg mx-auto lg:mx-0 bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/10 flex items-center gap-2 shadow-2xl focus-within:border-brand-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 flex-1 px-3 text-slate-400">
                <Search size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules or features..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-455 focus:ring-0 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg bg-brand-500 text-sm font-bold text-white flex items-center gap-1.5 transition hover:bg-brand-600 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] active:scale-95"
              >
                Search <ArrowRight size={16} />
              </button>
            </form>

            {/* Checkmarks */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-200 font-semibold select-none pt-2">
              {["Assignments Tracker", "Attendance Watch", "Digital Library", "Groq PYQ Analyzer"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-slate-900/40 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CheckCircle2 className="text-brand-500" size={14} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Floating Mockup Dashboard with Rotating Modules (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end no-print">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-[340px] h-[360px] bg-slate-900/30 rounded-2xl border border-white/10 p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col justify-between overflow-hidden"
            >
              {/* Top mock title bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase bg-white/5 px-2.5 py-0.5 rounded">
                  dashboard.stuhub.io
                </span>
              </div>

              {/* Central region with auto-rotating mockup feature */}
              <div className="flex-1 py-5 relative flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {currentHeroFeature === 0 && (
                    <motion.div
                      key="ai-assistant"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 text-left"
                    >
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Assistant Chat</div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[10px] leading-relaxed shadow-sm">
                        <div className="font-extrabold text-[8px] uppercase tracking-wider text-brand-400 mb-0.5">Stuhub AI</div>
                        Predicted DBMS exam question on <strong>SQL Joins</strong> has 85% probability.
                      </div>
                    </motion.div>
                  )}

                  {currentHeroFeature === 1 && (
                    <motion.div
                      key="attendance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center justify-center space-y-3"
                    >
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Attendance Monitor</div>
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 p-3 rounded-xl shadow-lg w-full max-w-[200px] text-left">
                        <div className="relative flex items-center justify-center h-10 w-10 flex-shrink-0">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" className="stroke-white/5 fill-none" strokeWidth="3" />
                            <circle cx="20" cy="20" r="16" className="stroke-emerald-500 fill-none" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.78)}`} strokeLinecap="round" />
                          </svg>
                          <span className="text-[9px] font-black text-white">78%</span>
                        </div>
                        <div>
                          <div className="text-[9px] font-extrabold text-white">Attendance</div>
                          <div className="text-[8px] font-bold text-emerald-450 uppercase tracking-wider mt-0.5">Safe</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentHeroFeature === 2 && (
                    <motion.div
                      key="assignments"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 text-left"
                    >
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Assignments Tracker</div>
                      <div className="p-3.5 rounded-xl bg-slate-950/45 border border-white/5 text-[10px] space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-500">
                          <span>ACTIVE TASKS</span>
                          <span className="text-brand-500">2 pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="rounded border-white/10 bg-transparent text-brand-500 focus:ring-0 focus:ring-offset-0 h-3 w-3" />
                          <span className="text-slate-355">Submit OS lab report</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentHeroFeature === 3 && (
                    <motion.div
                      key="library"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 text-left"
                    >
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Digital Library Repo</div>
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-white/5 text-[10px]">
                        <div className="h-7 w-7 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                          <Library size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-200 truncate">DBMS_Syllabus.pdf</div>
                          <div className="text-[8px] text-slate-550">1.2 MB</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentHeroFeature === 4 && (
                    <motion.div
                      key="pyq"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 text-left"
                    >
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Exam PYQ Analyzer</div>
                      <div className="border border-emerald-500/20 bg-slate-950/60 p-3.5 rounded-xl shadow-lg space-y-1.5">
                        <div className="text-[8px] font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-1">
                          <Brain size={10} className="text-brand-500" /> Topic Analysis
                        </div>
                        <p className="text-[10px] text-slate-200 font-bold leading-snug">
                          SQL Indexing Repeated 3x in Papers
                        </p>
                        <div className="text-[8px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block">
                          High Probability
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom decorative stats bar */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><Brain size={12} className="text-brand-500" /> Groq Vision Online</span>
                <span className="text-emerald-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 99.9% Up</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Platform Overview Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-500 font-extrabold">Workspace Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Dynamic Workspace Overview</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Click on any module to preview its live interactive mock-up and core student workflows.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Tabs selector column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = activeFeature === idx;
              return (
                <button
                  key={feat.title}
                  onClick={() => setActiveFeature(idx)}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900/60 border-brand-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
                      : "bg-slate-900/10 border-white/5 hover:border-white/10 hover:bg-slate-900/20"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                    isActive ? "bg-brand-500 text-white" : "bg-white/5 text-slate-400"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold transition ${isActive ? "text-white" : "text-slate-300"}`}>
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive display panel (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.4)] relative min-h-[380px] overflow-hidden">
            {/* Decorative background grid */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px] -z-10" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-white mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                </div>

                {/* Feature specific live mockup */}
                <div className="flex-1 flex flex-col justify-center bg-slate-950/40 rounded-xl border border-white/5 p-4 min-h-[180px] relative overflow-hidden">
                  {features[activeFeature].mockup.type === "assignments" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>INTERACTIVE WORKLIST</span>
                        <span className="text-[9px] text-brand-500 uppercase font-bold">(Click row to check off)</span>
                      </div>
                      <div className="space-y-2">
                        {mockAssignments.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleAssignment(item.id)}
                            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-left hover:border-brand-500/20 hover:bg-slate-900/80 transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${item.status === 'Submitted' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                              <div>
                                <span className={`font-bold text-slate-200 ${item.status === 'Submitted' ? 'line-through text-slate-500' : ''}`}>
                                  {item.title}
                                </span>
                                <div className="text-[9px] text-slate-500 mt-0.5">Weight: {item.weight}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                              <span className="text-[10px] text-slate-500">{item.due}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                item.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {features[activeFeature].mockup.type === "attendance" && (() => {
                    const attPct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 0;
                    const isSafe = attPct >= 75;
                    return (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="flex justify-between items-center w-full text-[10px] font-bold text-slate-500 px-1">
                          <span>LIVE TRACKER CALCULATOR</span>
                          <span className="text-[9px] text-brand-500 uppercase">(Test attendance bunk limits)</span>
                        </div>
                        <div className="flex items-center gap-6 bg-slate-900/60 border border-white/5 p-3 rounded-xl w-full max-w-[280px]">
                          <div className="relative flex items-center justify-center h-14 w-14 flex-shrink-0">
                            <svg className="absolute w-full h-full transform -rotate-90">
                              <circle cx="28" cy="28" r="22" className="stroke-white/5 fill-none" strokeWidth="4" />
                              <circle cx="28" cy="28" r="22" className="stroke-brand-500 fill-none" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - attPct / 100)}`} strokeLinecap="round" />
                            </svg>
                            <span className="text-[10px] font-black text-white">{attPct}%</span>
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-[10px] font-extrabold text-white truncate">Classes: {attendedClasses}/{totalClasses}</div>
                            <div className={`text-[8.5px] font-bold uppercase tracking-wider mt-0.5 ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isSafe ? 'Safe! Above 75%' : 'Warning: Below 75%'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLogAttendance(true)}
                            className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition active:scale-95"
                          >
                            Attend Class (+)
                          </button>
                          <button
                            onClick={() => handleLogAttendance(false)}
                            className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20 transition active:scale-95"
                          >
                            Bunk Class (-)
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {features[activeFeature].mockup.type === "library" && (() => {
                    const filteredFiles = features[activeFeature].mockup.files?.filter((file: any) =>
                      file.name.toLowerCase().includes(librarySearch.toLowerCase())
                    ) || [];
                    return (
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span>INTERACTIVE FILE INDEX</span>
                          <span className="text-[9px] text-brand-500 uppercase">(Filter & Download)</span>
                        </div>
                        <input
                          type="text"
                          value={librarySearch}
                          onChange={(e) => setLibrarySearch(e.target.value)}
                          placeholder="Search notes (e.g. DBMS, OS)..."
                          className="w-full bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 mb-2"
                        />
                        <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                          {filteredFiles.map((file: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleDownloadFile(file.name)}
                              disabled={downloadingFile !== null}
                              className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-left hover:border-brand-500/20 hover:bg-slate-900/80 transition"
                            >
                              <div className="h-6 w-6 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                                <Library size={12} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-200 truncate">{file.name}</div>
                                <div className="text-[8px] text-slate-500">{file.size}</div>
                              </div>
                              <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                                {downloadingFile === file.name ? 'Downloading...' : 'Click to Download'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {features[activeFeature].mockup.type === "ai" && (
                    <div className="space-y-2 flex flex-col justify-between h-full text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                        <span>STUDY CO-PILOT CHAT</span>
                        <span className="text-[9px] text-brand-500 uppercase">(Select Prompt Below)</span>
                      </div>
                      <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 flex-1 flex flex-col justify-end">
                        {aiConversation.map((msg, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-[10px] leading-relaxed max-w-[85%] ${
                            msg.role === 'user' ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400 self-end' : 'bg-slate-900/80 border border-white/5 text-slate-350 self-start'
                          }`}>
                            <div className="font-extrabold text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">
                              {msg.role === 'user' ? 'You' : 'Stuhub AI'}
                            </div>
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {["Explain BST", "What is semaphore?"].map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handleAiPromptClick(prompt)}
                            disabled={isAiTyping}
                            className="text-[9px] bg-slate-900 border border-white/10 hover:border-brand-500/40 hover:bg-slate-900/80 text-slate-300 px-2.5 py-1 rounded-full transition active:scale-95 disabled:opacity-50"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {features[activeFeature].mockup.type === "pyq" && (
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                        <span>GROQ VISION SCANNER</span>
                        <span className="text-[9px] text-brand-500 uppercase">(Simulate OCR Scan)</span>
                      </div>
                      
                      {pyqScanState === 'idle' && (
                        <div className="flex flex-col items-center justify-center py-4 border border-dashed border-white/10 rounded-lg hover:border-brand-500/30 transition cursor-pointer" onClick={handlePyqScan}>
                          <Brain size={24} className="text-brand-500/60 mb-1.5 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-300">Click to Scan Sample Paper</span>
                          <span className="text-[8px] text-slate-500 mt-0.5">Simulates PDF parsing & Groq API analysis</span>
                        </div>
                      )}

                      {pyqScanState === 'scanning' && (
                        <div className="relative flex flex-col items-center justify-center py-6 border border-brand-500/20 bg-brand-500/5 rounded-lg overflow-hidden">
                          {/* Animated radar bar scanner */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_#6366f1] animate-bounce" style={{ animationDuration: '1.5s' }} />
                          <Brain size={24} className="text-brand-500 mb-1.5 animate-spin" style={{ animationDuration: '3s' }} />
                          <span className="text-[10px] font-bold text-slate-300">Parsing PDF / Running Groq LLM...</span>
                        </div>
                      )}

                      {pyqScanState === 'done' && (
                        <div className="space-y-2.5">
                          {features[activeFeature].mockup.topics?.map((topic: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-200">
                                <span>{topic.name}</span>
                                <span className="text-brand-400">{topic.pct}% Weight</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-1 border border-white/5">
                                <div className="bg-brand-500 h-1 rounded-full animate-pulse" style={{ width: `${topic.pct}%` }} />
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => setPyqScanState("idle")}
                            className="w-full text-center text-[9px] text-slate-500 hover:text-white transition font-bold"
                          >
                            Reset Scanner
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Key value list */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  {features[activeFeature].bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900/10 border-t border-white/5 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
              <HelpCircle className="text-brand-500" size={28} /> FAQ
            </h2>
            <p className="text-slate-400 text-sm">Have any questions? Find answers to commonly asked inquiries here.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/5 bg-slate-900/20 overflow-hidden transition-all duration-300 hover:border-white/10">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 font-bold text-slate-200 hover:text-white transition flex justify-between items-center"
                >
                  {item.q}
                  <span className="text-brand-500 text-lg">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-slate-950/20">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-500 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} Stuhub. All rights reserved.</p>
      </footer>

      {/* 6. Authentic Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-white">
                  {modalMode === "login" ? "Sign in to Stuhub" : "Create Account"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {modalMode === "login"
                    ? "Enter your credentials to access your student portal"
                    : "Fill in the details to start your workspace"}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {modalMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>

                {error && <p className="text-xs text-red-400 font-bold p-3 bg-red-500/10 rounded-lg">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-brand-500 text-sm font-bold text-white flex items-center justify-center gap-1.5 transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : modalMode === "login" ? "Enter Workspace" : "Create Account"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Social Logins */}
              <div className="mt-4 space-y-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">or continue with</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>
                
                {/* Official Google Sign-In Button Container */}
                <div id="google-signin-btn" className="w-full flex justify-center overflow-hidden min-h-[44px]"></div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="h-11 rounded-lg border border-white/10 bg-white/5 text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.177 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.624 4.228 1.636l3.076-3.076C19.14 2.502 15.918 1.5 12.24 1.5 6.42 1.5 1.7 6.22 1.7 12s4.72 10.5 10.54 10.5c5.73 0 10.19-3.9 10.19-9.9 0-.6-.05-1.17-.16-1.715H12.24z"/>
                    </svg>
                    Mock Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("github")}
                    className="h-11 rounded-lg border border-white/10 bg-white/5 text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    Mock GitHub
                  </button>
                </div>
              </div>

              {/* Demo Login Option */}
              {modalMode === "login" && (
                <div className="mt-3">
                  <button
                    onClick={handleDemoLogin}
                    className="w-full h-11 rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-500 text-xs font-bold transition hover:bg-brand-500/20"
                  >
                    Quick Demo Student Login
                  </button>
                </div>
              )}

              <p className="text-xs text-center text-slate-400 mt-6">
                {modalMode === "login" ? (
                  <>
                    New to Stuhub?{" "}
                    <button onClick={() => setModalMode("register")} className="text-brand-500 font-bold hover:underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setModalMode("login")} className="text-brand-500 font-bold hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory Social Login Profile Completion Modal */}
      <CompleteProfileModal />
    </div>
  );
}
