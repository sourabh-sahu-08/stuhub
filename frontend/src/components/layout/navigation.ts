import {
  Bot,
  CalendarDays,
  ClipboardCheck,
  Home,
  Library,
  MessageSquare,
  Settings,
  Sparkles
} from "lucide-react";


export const navItems = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Assignments", path: "/assignments", icon: ClipboardCheck },
  { label: "Attendance", path: "/attendance", icon: CalendarDays },
  { label: "Digital Library", path: "/library", icon: Library },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "AI Studio", path: "/ai", icon: Bot },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Smart Plan", path: "/planner", icon: Sparkles }
] satisfies Array<{ label: string; path: string; icon: typeof Home }>;
