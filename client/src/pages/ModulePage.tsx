import { Bot, CalendarDays, CheckCircle2, FileText, Search, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Section } from "../components/ui/Section";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const copy: Record<string, { title: string; subtitle: string; endpoint?: string }> = {
  feed: { title: "Campus Feed", subtitle: "Announcements, department notices, achievements, and event highlights.", endpoint: "/feed" },
  assignments: { title: "Assignments", subtitle: "Create, submit, grade, and track coursework.", endpoint: "/assignments" },
  attendance: { title: "Attendance", subtitle: "Track attendance health and mark daily classes." },
  grades: { title: "Grades", subtitle: "Academic records, marks, GPA, and CGPA calculator." },
  library: { title: "Digital Library", subtitle: "E-books, notes, previous year papers, syllabus, and filtering.", endpoint: "/library" },
  placements: { title: "Placement Portal", subtitle: "Jobs, internships, company profiles, resume tools, and prep resources.", endpoint: "/placements" },
  events: { title: "Clubs & Events", subtitle: "Club discovery, event registration, calendar, and certificates.", endpoint: "/clubs" },
  alumni: { title: "Alumni Network", subtitle: "Mentorship requests, alumni directory, and career guidance.", endpoint: "/alumni" },
  messages: { title: "Messages", subtitle: "Announcements, student communication, and class channels." },
  ai: { title: "AI Studio", subtitle: "College chatbot, study planner, notes summarizer, and recommendations." },
  admin: { title: "Admin Control", subtitle: "Users, departments, courses, reports, moderation, and settings.", endpoint: "/admin/reports" },
  resources: { title: "Resources", subtitle: "Upload and manage study materials through Cloudinary-ready APIs." },
  settings: { title: "Settings", subtitle: "Profile, permissions, notifications, and system preferences." },
  planner: { title: "Smart Plan", subtitle: "AI assisted study plans from attendance, marks, and calendar load." }
};

export function ModulePage() {
  const { module = "feed" } = useParams();
  const { user } = useAuth();
  const meta = copy[module] ?? copy.feed;
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!meta.endpoint) return;
    api.get(meta.endpoint).then((response) => {
      const payload = response.data;
      setItems(Array.isArray(payload) ? payload : [...(payload.notices ?? []), ...(payload.events ?? []), ...(payload.riskSignals ?? [])]);
    }).catch(() => setItems([]));
  }, [meta.endpoint]);

  const cards = useMemo(() => featureCards(module, user?.role ?? "student"), [module, user?.role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-100">{user?.role} workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{meta.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Search"><Search size={18} /></button>
          <button className="focus-ring flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950"><Send size={16} /> New</button>
        </div>
      </div>

      {module === "ai" || module === "planner" ? <AIStudio /> : (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Section title="Tools">
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <article key={card.title} className="rounded-lg border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-brand-500 dark:border-slate-800">
                  <card.icon className="text-brand-600 dark:text-brand-100" size={20} />
                  <h2 className="mt-3 text-sm font-bold">{card.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.body}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Live Records">
            <div className="space-y-3">
              {items.slice(0, 8).map((item, index) => (
                <div key={item._id ?? item.label ?? index} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">
                    <FileText size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title ?? item.label ?? item.name ?? item.company}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.body ?? item.description ?? item.role ?? `${item.count ?? ""} records`}</p>
                  </div>
                </div>
              ))}
              {!items.length && <p className="text-sm text-slate-500">No live records yet. The API is ready for this module.</p>}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function AIStudio() {
  const [question, setQuestion] = useState("How should I prepare for DBMS internal assessment?");
  const [answer, setAnswer] = useState("");

  async function ask(event: FormEvent) {
    event.preventDefault();
    const response = await api.post("/ai/chat", { question });
    setAnswer(response.data.answer);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
      <Section title="College Chatbot">
        <form onSubmit={ask} className="space-y-3">
          <textarea className="focus-ring min-h-32 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900" value={question} onChange={(event) => setQuestion(event.target.value)} />
          <button className="focus-ring flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white"><Bot size={16} /> Ask AI</button>
        </form>
        {answer && <p className="mt-4 rounded-lg bg-brand-50 p-4 text-sm leading-6 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100">{answer}</p>}
      </Section>
      <Section title="Smart Recommendations">
        <div className="space-y-3">
          {["AI study planner", "AI note summarizer", "Study material recommendations", "Performance prediction", "Smart notification timing"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-bold dark:border-slate-800">
              <Sparkles size={17} className="text-brand-600" />
              {item}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function featureCards(module: string, role: string) {
  const base = [
    { title: "Role-aware permissions", body: `${role} actions are protected by API middleware and route guards.`, icon: CheckCircle2 },
    { title: "Realtime updates", body: "Socket.io channels push personal and campus notifications instantly.", icon: CalendarDays },
    { title: "Production storage", body: "Upload endpoints are prepared for Cloudinary file delivery.", icon: FileText },
    { title: "Analytics-ready", body: "Charts and reports expose performance, activity, and operations trends.", icon: Sparkles }
  ];
  if (module === "placements") return [{ title: "Resume builder", body: "Create structured resumes and run ATS-oriented checks.", icon: FileText }, ...base.slice(0, 3)];
  if (module === "library") return [{ title: "Search repository", body: "Filter notes, e-books, PYQs, videos, and syllabus files.", icon: Search }, ...base.slice(0, 3)];
  return base;
}
