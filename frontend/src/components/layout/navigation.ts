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
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Assignments", path: "/dashboard/assignments", icon: ClipboardCheck },
  { label: "Attendance", path: "/dashboard/attendance", icon: CalendarDays },
  { label: "Digital Library", path: "/dashboard/library", icon: Library },
  { label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
  { label: "AI Studio", path: "/dashboard/ai", icon: Bot },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
  { label: "Smart Plan", path: "/dashboard/planner", icon: Sparkles }
] satisfies Array<{ label: string; path: string; icon: typeof Home }>;
