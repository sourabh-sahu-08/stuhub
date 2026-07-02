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
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CompleteProfileModal } from "../components/auth/CompleteProfileModal";

export function LoginPage() {
  const { user, login, register, socialLogin } = useAuth();
  
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
          email: "sourabh_github@collegeos.edu",
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
      <section id="home" className="relative min-h-[85vh] flex items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background Image with Blurred Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/workspace_background.png"
            alt="Collaborative Workspace"
            className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl text-center space-y-8">
          {/* Active Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500 select-none shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            STUHUB STUDENT ENVIRONMENT IS ACTIVE
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
            Find Your Dream Study <br />
            <span className="text-brand-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.2)]">Build Your Future</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-350">
            A beautiful, fully responsive workspace built to scale. Organize assignments, track class attendance, access libraries, and plan your schedules with intelligence.
          </p>

          {/* Search Box */}
          <form onSubmit={triggerSearch} className="max-w-lg mx-auto bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/10 flex items-center gap-2 shadow-2xl focus-within:border-brand-500/50 transition-all duration-300">
            <div className="flex items-center gap-2 flex-1 px-3 text-slate-400">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules or features..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-400 focus:ring-0"
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
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-200 font-semibold select-none pt-2">
            {["Assignments Tracker", "Attendance Watch", "Digital Library Repo", "Smart AI Plan"].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-slate-900/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle2 className="text-brand-500" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Platform Overview Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-500 font-extrabold">Workspace Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Overview of the Workspace</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Explore the clean baseline elements built to structure your college academic operations.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Assignments", text: "Track tasks, create deadlines, submit works, and check scores within a highly organized layout.", icon: ClipboardCheck },
            { title: "Attendance", text: "Maintain an active presence checklist for your subjects and monitor your overall semester attendance.", icon: Calendar },
            { title: "Digital Library", text: "Upload study materials, filter notes, access previous papers, and search textbook files instantly.", icon: Library },
            { title: "AI Studio", text: "Leverage custom LLM chats, summarize note files, and calculate target study planners with smart algorithms.", icon: Sparkles }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="group relative p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-brand-500/45 hover:bg-slate-900/50 transition-all duration-300 space-y-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.08)]">
                <div className="h-12 w-12 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-500 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
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
