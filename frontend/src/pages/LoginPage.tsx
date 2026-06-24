import { useState, FormEvent } from "react";
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
  HelpCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login, register } = useAuth();
  
  // Navigation & UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auth Form States
  const [name, setName] = useState("Riya Sharma");
  const [email, setEmail] = useState("student@collegeos.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login("student@collegeos.edu", "password123");
      setIsModalOpen(false);
    } catch (err) {
      setError("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Prompt login modal to access searched feature
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
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-white text-lg">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">Stuhub</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-500 font-bold block -mt-1">Student Portal</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Workspace Overview</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setModalMode("login");
            }}
            className="focus-ring h-10 px-5 rounded-lg bg-brand-500 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-95"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative min-h-[85vh] flex items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background Image with JobLuxe Blurred Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/workspace_background.png"
            alt="Collaborative Workspace Background"
            className="w-full h-full object-cover filter brightness-[0.28] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl text-center space-y-8">
          {/* Active Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500 select-none">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            STUHUB STUDENT ENVIRONMENT IS ACTIVE
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
            Find Your Dream Study <br />
            <span className="text-brand-500">Build Your Future</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-300">
            A beautiful, fully responsive workspace built to scale. Organize assignments, track class attendance, access libraries, and plan your schedules with intelligence.
          </p>

          {/* Search Box */}
          <form onSubmit={triggerSearch} className="max-w-lg mx-auto bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/10 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-3 text-slate-400">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules or features..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-brand-500 text-sm font-bold text-white flex items-center gap-1.5 transition hover:bg-brand-600 active:scale-95"
            >
              Search <ArrowRight size={16} />
            </button>
          </form>

          {/* Checkmarks */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-200 font-semibold select-none">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-brand-500" size={18} />
              Assignments Tracker
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-brand-500" size={18} />
              Attendance Watch
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-brand-500" size={18} />
              Digital Library Repo
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-brand-500" size={18} />
              Smart AI Plan
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Overview Section */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-brand-500 font-extrabold">Workspace Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Overview of the Workspace</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Explore the clean baseline elements built to structure your college academic operations.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-brand-500/30 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Assignments</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track tasks, create deadlines, submit works, and check scores within a highly organized layout.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-brand-500/30 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Attendance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Maintain an active presence checklist for your subjects and monitor your overall semester attendance.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-brand-500/30 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Library size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Digital Library</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload study materials, filter notes, access previous papers, and search textbook files instantly.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-brand-500/30 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Studio</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leverage custom LLM chats, summarize note files, and calculate target study planners with smart algorithms.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="py-20 bg-slate-900/10 border-t border-white/5 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
              <HelpCircle className="text-brand-500" size={28} /> FAQ
            </h2>
            <p className="text-slate-400 text-sm">Have any questions? Find answers to commonly asked inquiries here.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/5 bg-slate-900/20 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 font-bold text-slate-200 hover:text-white transition flex justify-between items-center"
                >
                  {item.q}
                  <span className="text-slate-400">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Stuhub. All rights reserved.</p>
      </footer>

      {/* 6. Authentic Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl text-slate-900 dark:text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
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

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-white">
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

              {/* Demo Login Button */}
              {modalMode === "login" && (
                <div className="mt-4">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">or</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>
                  <button
                    onClick={handleDemoLogin}
                    className="w-full h-11 rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-500 text-sm font-bold transition hover:bg-brand-500/20"
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
    </div>
  );
}
