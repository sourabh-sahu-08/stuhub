import {
  Bot,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  Library,
  MessageSquare,
  Settings,
  Sparkles
} from "lucide-react";
import type { Role } from "../../types";

export const navItems = [
  { label: "Dashboard", path: "/", icon: Home, roles: ["student", "teacher", "admin"] },
  { label: "Assignments", path: "/assignments", icon: ClipboardCheck, roles: ["student", "teacher"] },
  { label: "Attendance", path: "/attendance", icon: CalendarDays, roles: ["student", "teacher"] },
  { label: "Grades", path: "/grades", icon: GraduationCap, roles: ["student", "teacher"] },
  { label: "Digital Library", path: "/library", icon: Library, roles: ["student", "teacher", "admin"] },
  { label: "Messages", path: "/messages", icon: MessageSquare, roles: ["student", "teacher", "admin"] },
  { label: "AI Studio", path: "/ai", icon: Bot, roles: ["student", "teacher", "admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["student", "teacher", "admin"] },
  { label: "Smart Plan", path: "/planner", icon: Sparkles, roles: ["student"] }
] satisfies Array<{ label: string; path: string; icon: typeof Home; roles: Role[] }>;
