import { useState, useEffect, useRef, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  Search,
  ArrowRight,
  Activity,
  Zap,
  Play,
  PenTool,
  LayoutTemplate,
  Layers,
  MousePointer2,
  ArrowUpRight,
  BarChart2,
  ShieldCheck,
  Download,
  Sparkles,
  X,
  Brain,
  ClipboardList,
  Library
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { CompleteProfileModal } from "../components/auth/CompleteProfileModal";
import { api } from "../lib/api";

const features = [
  {
    title: "Assignments Tracker",
    shortTitle: "Assignments",
    description: "Centralize your coursework. Monitor deadlines, track submission status, and record scores in a structured student workflow.",
    icon: ClipboardList,
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
    description: "Scan previous papers, predict exam patterns, and get custom AI study plans.",
    icon: Brain,
    color: "from-indigo-500 to-purple-500",
    bullets: [
      "PDF & Image vision analysis",
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
  const { user, login, register, socialLogin, setAuthSession } = useAuth();
  const { metrics, assignments, recentNotes } = useWorkspace();
  
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
  const [mockAssignments] = useState([
    { id: 1, title: "DBMS Assignment 3", due: "Tomorrow", status: "In Progress", weight: "10%" },
    { id: 2, title: "OS Kernel Lab", due: "July 8", status: "Not Started", weight: "15%" },
    { id: 3, title: "Applied AI Midterm Project", due: "Completed", status: "Submitted", weight: "20%" }
  ]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [downloadingFile] = useState<string | null>(null);
  
  const initialMessages = [
    { role: "user", text: "Explain binary search trees." },
    { role: "ai", text: "A BST is a node-based binary tree structure where the left subtree contains keys less than the parent." }
  ];
  const [aiConversation] = useState(initialMessages);
  const [isAiTyping] = useState(false);
  const [pyqScanState] = useState<"idle" | "scanning" | "done">("idle");

  // Auth Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Tracks whether google.accounts.id.initialize() has already been called
  // to prevent the "called multiple times" GSI warning on modal re-opens.
  const gsiInitialized = useRef(false);

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

        // Only call initialize() once to avoid the GSI "called multiple times" warning
        if (!gsiInitialized.current) {
          gsiInitialized.current = true;
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
        }

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const provider = params.get('provider');
    const state = params.get('state');

    if (code && provider) {
      setLoading(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const payload = provider === 'linkedin' 
        ? { code, redirectUri: `${window.location.origin}/?provider=linkedin` }
        : { code };

      api.post(`/auth/${provider}`, payload)
        .then((res: any) => {
          setAuthSession(res.data.token, res.data.user);
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || `${provider} authentication failed.`);
        })
        .finally(() => setLoading(false));
    }
  }, [login]);

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/?provider=github`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleLinkedinLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/?provider=linkedin`);
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=linkedin_auth&scope=openid%20profile%20email`;
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

  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-500 selection:text-white">
      {/* 1. Header Nav */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#272727] px-6 py-4 flex items-center justify-between shadow-lg">
        <a href="/" className="flex items-center gap-3 select-none cursor-pointer">
          <img 
            src="/fvicon.png" 
            alt="Stuhub Logo" 
            className="h-24 w-auto object-contain"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
          <a href="#home" className="hover:text-brand-500 transition-colors duration-200">Home</a>
          <a href="#features" className="hover:text-brand-500 transition-colors duration-200">Workspace Overview</a>
          <a href="#faq" className="hover:text-brand-500 transition-colors duration-200">FAQ</a>
        </nav>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-[#333333] px-3 py-1.5 rounded-lg">
              <Link to="/dashboard" className="flex items-center gap-2 group select-none">
                {/* Circular Avatar Progress Ring (25%) */}
                <div className="relative flex items-center justify-center h-8 w-8">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="13" className="stroke-white/10 fill-none" strokeWidth="2" />
                    <circle cx="16" cy="16" r="13" className="stroke-brand-500 fill-none" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 13}`} strokeDashoffset={`${2 * Math.PI * 13 * (1 - 0.25)}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute h-6.5 w-6.5 rounded-full bg-black flex items-center justify-center text-xs font-bold uppercase text-white">
                    {user.name.slice(0, 1)}
                  </div>
                </div>
                <div className="hidden min-w-0 sm:flex items-center gap-1">
                  <span className="truncate text-xs font-semibold text-zinc-200 group-hover:text-brand-500 transition-colors">{user.name}</span>
                  <span className="text-[10px] text-brand-500 font-bold">25%</span>
                  <ChevronDown size={14} className="text-zinc-400 group-hover:text-brand-500 transition-colors" />
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

      {/* 2. Premium Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 bg-black overflow-hidden">
        {/* Subtle grid background for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          {/* Left Column: Typography & Command Palette (6 cols) */}
          <div className="lg:col-span-6 space-y-12 text-left">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111111] border border-[#222222]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9000] animate-pulse" />
                <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">Academic Operating System</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-tight leading-[1.15] text-white"
              >
                The Command Center <br className="hidden sm:block"/>
                for <span className="text-[#FF9000]">Academic Success</span>.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-lg text-base sm:text-lg text-zinc-400 leading-relaxed font-normal"
              >
                Unify your coursework, monitor attendance safely, build digital libraries, and analyze previous exam papers in one refined workspace.
              </motion.p>
            </div>

            {/* Command Palette Search */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <form 
                onSubmit={triggerSearch} 
                className="max-w-xl w-full bg-[#0A0A0A] rounded-xl border border-[#222222] p-2.5 flex items-center shadow-lg hover:border-[#333333] focus-within:border-[#FF9000]/50 focus-within:ring-4 focus-within:ring-[#FF9000]/10 transition-all duration-200 group cursor-text"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.focus();
                }}
              >
                <div className="flex items-center gap-3 flex-1 px-2">
                  <Search size={18} className="text-zinc-500 group-focus-within:text-[#FF9000] transition-colors" />
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notes, assignments, PYQs, faculty, resources..."
                      className="bg-transparent border-none outline-none text-zinc-200 text-sm w-full placeholder:text-zinc-600 focus:ring-0 peer"
                    />
                    {/* Simulated cursor blink when empty (optional visual flair) */}
                    {searchQuery === "" && (
                      <span className="absolute left-0 w-[1px] h-4 bg-zinc-600 animate-pulse peer-focus:hidden pointer-events-none" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2">
                  <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] px-2 text-[10px] font-medium text-zinc-500">
                    <span className="text-xs">⌘</span> K
                  </kbd>
                </div>
              </form>
            </motion.div>
            
            {/* Premium Metric Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-2xl"
            >
              {(user ? [
                { label: "Pending Tasks", value: metrics.pendingAssignments.toString(), icon: Clock },
                { label: "Attendance", value: metrics.attendancePercentage > 0 ? `${metrics.attendancePercentage.toFixed(1)}%` : "—", icon: Calendar },
                { label: "Resources", value: metrics.notesUploaded.toString(), icon: FileText },
                { label: "AI Usage", value: "Active", icon: Brain }
              ] : [
                { label: "System Uptime", value: "99.9%", icon: Sparkles },
                { label: "Attendance", value: "92%", icon: Calendar, isDemo: true },
                { label: "Resources", value: "143", icon: FileText, isDemo: true },
                { label: "AI Assistant", value: "24/7", icon: Brain }
              ]).map((metric, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-4 flex flex-col items-start gap-2 hover:-translate-y-[2px] hover:shadow-lg hover:border-[#333] transition-all duration-200 ease-out cursor-default relative overflow-hidden"
                >
                  {(!user && (metric as any).isDemo) && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[8px] font-bold px-1.5 py-0.5 rounded-bl uppercase">Demo</div>}
                  <metric.icon size={14} className="text-zinc-500" />
                  <div>
                    <p className="text-xl font-semibold text-white tracking-tight">{metric.value}</p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{metric.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Realistic Widget Previews (6 cols) */}
          <div className="lg:col-span-6 relative h-[500px] w-full no-print">
            <div className="absolute inset-0 grid grid-cols-2 gap-5 auto-rows-[110px]">
              
              {/* Widget 1: Attendance */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-1 row-span-1 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5 flex flex-col justify-between hover:border-[#333333] hover:-translate-y-[2px] hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
              >
                {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Preview</div>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">Attendance</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-4xl font-semibold text-white tracking-tight"
                    >
                      {user ? (metrics.attendancePercentage > 0 ? `${metrics.attendancePercentage.toFixed(1)}%` : "—") : "92%"}
                    </motion.p>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{user && metrics.attendancePercentage < 75 ? "Needs attention" : "Safe threshold"}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="col-span-1 row-span-2 bg-[#111111] border border-[#1A1A1A] rounded-xl p-5 flex flex-col hover:border-[#333333] hover:-translate-y-[2px] hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
              >
                {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">Preview</div>}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">PYQ Analyzer</span>
                  <Brain size={14} className="text-[#FF9000] group-hover:animate-pulse" />
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="52" className="stroke-[#222222] fill-none" strokeWidth="1" />
                      <circle cx="56" cy="56" r="42" className="stroke-[#222222] fill-none" strokeWidth="1" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.85) }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                        cx="56" cy="56" r="52" 
                        className="stroke-[#FF9000]/30 fill-none" 
                        strokeWidth="1" 
                        strokeDasharray={`${2 * Math.PI * 52}`}
                      />
                    </svg>
                    <div className="text-center">
                      <motion.p 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1 }}
                        className="text-xl font-semibold text-white tracking-tight"
                      >
                        {user ? (metrics.pyqsUploaded > 0 ? "Ready" : "0") : "85%"}
                      </motion.p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">{user ? "Scans" : "Match"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto bg-[#050505] rounded-md border border-[#222222] p-2 text-center transition-colors group-hover:border-[#333]">
                  <span className="text-[10px] font-medium text-zinc-300">Predictive Model Active</span>
                </div>
              </motion.div>

              {/* Widget 3: Assignments */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="col-span-1 row-span-2 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 flex flex-col justify-between hover:border-[#333333] hover:-translate-y-[2px] hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
              >
                {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Preview</div>}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">Assignments</span>
                    <span className="text-[10px] font-medium text-white px-2 py-0.5 bg-[#222222] rounded-md border border-[#333]">
                      {user ? `${metrics.pendingAssignments} Due` : "3 Due"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {user ? (
                      assignments.slice(0, 2).map((a: any, i: number) => (
                        <div key={a._id} className="flex items-start gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'Submitted' ? 'bg-emerald-500' : 'bg-[#FF9000]'} mt-1.5 shrink-0`} />
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{a.title}</p>
                            <p className="text-[11px] text-zinc-500">{new Date(a.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF9000] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white">OS Kernel Lab</p>
                            <p className="text-[11px] text-zinc-500">Tomorrow, 11:59 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-zinc-400">DBMS Schema</p>
                            <p className="text-[11px] text-zinc-600">Jul 24</p>
                          </div>
                        </div>
                      </>
                    )}
                    {user && assignments.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">No assignments yet</p>
                    )}
                  </div>
                </div>
                <div className="pt-5 mt-4">
                  <div className="w-full h-1 bg-[#222222] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: user ? (assignments.length > 0 ? "35%" : "0%") : "65%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#FF9000]/80 to-[#FF9000]" 
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 text-right">
                    {user ? (assignments.length > 0 ? "In Progress" : "All Clear") : "65% Completed"}
                  </p>
                </div>
              </motion.div>

              {/* Widget 4: Notes/Library */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="col-span-1 row-span-1 bg-[#151515] border border-[#222222] rounded-xl p-5 flex items-center gap-5 hover:border-[#333333] hover:-translate-y-[2px] hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
              >
                {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Preview</div>}
                <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-zinc-400 shrink-0 group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-semibold text-white tracking-tight"
                  >
                    {user ? metrics.notesUploaded : "143"}
                  </motion.p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{user ? "Your Notes" : "Indexed Resources"}</p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Overview Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col items-center max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Core Modules</h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Everything you need to manage your academic lifecycle, engineered into a single seamless workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
          {/* Left Column: Feature Selection */}
          <div className="lg:col-span-5 flex flex-col gap-2 relative">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = activeFeature === idx;
              return (
                <button
                  key={feat.title}
                  onClick={() => setActiveFeature(idx)}
                  className={`group relative flex flex-col items-start p-6 rounded-xl text-left transition-all duration-200 border ${
                    isActive
                      ? "bg-[#111111] border-[#333333] shadow-soft"
                      : "bg-transparent border-transparent hover:bg-[#0A0A0A] hover:border-[#222222]"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      isActive ? "bg-white text-black" : "bg-[#111111] text-zinc-400 group-hover:text-zinc-200"
                    }`}>
                      <Icon size={20} />
                    </div>
                    <h3 className={`text-lg font-semibold transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                      {feat.title}
                    </h3>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="text-sm text-zinc-400 leading-relaxed pl-14">
                      {feat.description}
                    </p>
                    <ul className="mt-4 pl-14 space-y-2">
                      {feat.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-2 text-xs text-zinc-500">
                          <CheckCircle size={12} className="text-[#FF9000]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Premium Mockup Display */}
          <div className="lg:col-span-7 bg-[#050505] rounded-2xl border border-[#222222] p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden shadow-soft">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                
                {/* Assignments Mockup */}
                {features[activeFeature].mockup.type === "assignments" && (
                  <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] shadow-xl overflow-hidden relative">
                    {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">Preview</div>}
                    <div className="border-b border-[#222222] bg-[#111111] px-5 py-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Tasks</span>
                      <span className="text-xs font-medium px-2 py-1 bg-white text-black rounded">{user ? `${metrics.pendingAssignments} Active` : '3 Active'}</span>
                    </div>
                    <div className="p-2 space-y-1 h-[300px] overflow-y-auto">
                      {user ? (
                        assignments.map((item: any) => (
                          <div
                            key={item._id}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#111111] transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                item.status === 'Submitted' ? 'bg-[#FF9000] border-[#FF9000]' : 'border-[#444444] group-hover:border-[#666666]'
                              }`}>
                                {item.status === 'Submitted' && <CheckCircle size={10} className="text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-medium transition-colors ${item.status === 'Submitted' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                  {item.title}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">{item.module?.name || item.module}</p>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-500">{new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>
                        ))
                      ) : (
                        mockAssignments.map((item) => (
                          <div
                            key={item.id}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#111111] transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                item.status === 'Submitted' ? 'bg-[#FF9000] border-[#FF9000]' : 'border-[#444444]'
                              }`}>
                                {item.status === 'Submitted' && <CheckCircle size={10} className="text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-medium transition-colors ${item.status === 'Submitted' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                  {item.title}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">{item.weight} of final grade</p>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-500">{item.due}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Attendance Mockup */}
                {features[activeFeature].mockup.type === "attendance" && (() => {
                  const attPct = user ? metrics.attendancePercentage : 92;
                  const isSafe = attPct >= 75;
                  return (
                    <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] shadow-xl p-6 relative overflow-hidden">
                      {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Preview</div>}
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-semibold text-white">Attendance Overview</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isSafe ? 'Safe' : 'Action Required'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative flex items-center justify-center h-32 w-32">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" className="stroke-[#111111] fill-none" strokeWidth="8" />
                            <circle
                              cx="64" cy="64" r="56"
                              className="stroke-[#FF9000] fill-none transition-all duration-1000 ease-out"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - attPct / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="text-center">
                            <span className="text-3xl font-semibold text-white block">{attPct > 0 ? `${attPct.toFixed(1)}%` : "0%"}</span>
                            <span className="text-[10px] text-zinc-500">Present</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          disabled
                          className="py-2.5 bg-[#111111] border border-[#222222] rounded-lg text-xs font-medium text-zinc-500 opacity-50 cursor-not-allowed"
                        >
                          Mark Present
                        </button>
                        <button
                          disabled
                          className="py-2.5 bg-[#111111] border border-[#222222] rounded-lg text-xs font-medium text-zinc-500 opacity-50 cursor-not-allowed"
                        >
                          Mark Absent
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Library Mockup */}
                {features[activeFeature].mockup.type === "library" && (() => {
                  const dataList = user ? recentNotes : features[activeFeature].mockup.files;
                  const filteredFiles = dataList?.filter((file: any) =>
                    (file.name || file.title || "").toLowerCase().includes(librarySearch.toLowerCase())
                  ) || [];
                  return (
                    <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] shadow-xl overflow-hidden relative">
                      {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">Preview</div>}
                      <div className="p-4 border-b border-[#222222] bg-[#111111]">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            value={librarySearch}
                            onChange={(e) => setLibrarySearch(e.target.value)}
                            placeholder="Search digital library..."
                            className="w-full bg-[#050505] border border-[#333333] rounded pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FF9000] transition-colors"
                          />
                        </div>
                      </div>
                      <div className="p-2 h-[260px] overflow-y-auto">
                        {filteredFiles.map((file: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#111111] transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                <FileText size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{file.name || file.title}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{file.tag || file.module?.name} • {file.size || "PDF"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredFiles.length === 0 && (
                          <p className="text-xs text-zinc-500 text-center py-4">No notes found</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* AI Studio Mockup */}
                {features[activeFeature].mockup.type === "ai" && (
                  <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] shadow-xl flex flex-col h-[360px] relative overflow-hidden">
                    {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">Preview</div>}
                    <div className="p-4 border-b border-[#222222] bg-[#111111] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#FF9000]" />
                      <span className="text-sm font-semibold text-white">AI Studio</span>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {aiConversation.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-white text-black rounded-br-none font-medium' 
                              : 'bg-[#111111] border border-[#222222] text-zinc-300 rounded-bl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-3 border-t border-[#222222] flex gap-2">
                      {["Explain BST", "What is semaphore?"].map((prompt) => (
                        <button
                          key={prompt}
                          disabled
                          className="text-xs bg-[#111111] border border-[#333333] hover:border-[#666666] text-zinc-300 px-3 py-2 rounded-lg transition-colors flex-1 cursor-default opacity-80"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PYQ Analyzer Mockup */}
                {features[activeFeature].mockup.type === "pyq" && (
                  <div className="bg-[#0A0A0A] rounded-xl border border-[#222222] shadow-xl p-6 relative overflow-hidden">
                    {!user && <div className="absolute top-0 right-0 bg-[#FF9000]/20 text-[#FF9000] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">Preview</div>}
                    <div className="flex items-center gap-3 mb-8">
                      <Brain size={20} className="text-[#FF9000]" />
                      <h4 className="text-sm font-semibold text-white">Pattern Recognition</h4>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#111111] border border-[#222222] rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-zinc-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{user ? "PYQ_2023_Final.pdf" : "DBMS_2023_Final.pdf"}</p>
                          <p className="text-[10px] text-zinc-500">{user ? "Processing Ready" : "Scan Complete"}</p>
                        </div>
                      </div>
                      <span className="text-[#FF9000]">
                        <CheckCircle size={18} />
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Topics</h5>
                      {features[activeFeature].mockup.topics?.map((topic: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{topic.name}</span>
                          <span className="text-white font-medium">{topic.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="py-32 bg-black border-t border-[#111111] px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-zinc-500 text-base">Everything you need to know about the StuHub platform.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${ 
                  activeFaq === idx 
                    ? 'border-[#333333] bg-[#0A0A0A]' 
                    : 'border-[#222222] bg-transparent hover:border-[#333333] hover:bg-[#050505]' 
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center group"
                >
                  <span className={`font-medium transition-colors ${activeFaq === idx ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                    {item.q}
                  </span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    activeFaq === idx ? 'border-[#FF9000] text-[#FF9000]' : 'border-[#333333] text-zinc-500 group-hover:border-[#555555]'
                  }`}>
                    <span className="text-sm leading-none mt-[-2px]">{activeFaq === idx ? "−" : "+"}</span>
                  </div>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 border-t border-[#111111] bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#222222] px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">All systems operational</span>
          </div>
          <p className="text-sm text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} Stuhub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 6. Authentic Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-5 sm:p-6 rounded border border-outline bg-surface shadow-lg text-zinc-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-white">
                  {modalMode === "login" ? "Sign in to Stuhub" : "Create Account"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {modalMode === "login"
                    ? "Enter your credentials to access your student portal"
                    : "Fill in the details to start your workspace"}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {modalMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-mono">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-mono">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-mono">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded border border-outline bg-surface-container px-3 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>

                {error && <p className="text-xs text-red-400 font-bold p-3 bg-red-500/10 rounded border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded bg-primary text-sm font-bold text-black flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Authenticating..." : modalMode === "login" ? "Enter Workspace" : "Create Account"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Social Logins */}
              <div className="mt-4 space-y-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-outline"></div>
                  <span className="flex-shrink mx-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider font-mono">or continue with</span>
                  <div className="flex-grow border-t border-outline"></div>
                </div>
                
                {/* Official Google Sign-In Button Container */}
                <div id="google-signin-btn" className="w-full flex justify-center overflow-hidden min-h-[44px]"></div>
                
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  className="w-full h-11 rounded border border-outline bg-surface-container flex items-center justify-center gap-2 text-sm font-semibold text-white hover:bg-surface-container-high hover:border-[#52525B] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  Continue with GitHub
                </button>
                
                <button
                  type="button"
                  onClick={handleLinkedinLogin}
                  className="w-full h-11 rounded border border-[#0a66c2] bg-[#0a66c2]/10 flex items-center justify-center gap-2 text-sm font-semibold text-[#0a66c2] hover:bg-[#0a66c2]/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Continue with LinkedIn
                </button>
              </div>

              <p className="text-xs text-center text-zinc-400 mt-6">
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

