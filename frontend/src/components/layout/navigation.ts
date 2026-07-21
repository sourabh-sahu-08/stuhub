import {
  Home,
  CalendarDays,
  BookOpen,
  Brain,
  Calendar,
  Bell,
  Bookmark,
  User,
  Settings,
  Sparkles,
  ClipboardList,
  MessageSquare
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  materialIcon: string;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    groupName: "STUDY",
    items: [
      { label: "Home", path: "/dashboard", icon: Home, materialIcon: "home" },
      { label: "Attendance", path: "/dashboard/attendance", icon: CalendarDays, materialIcon: "calendar_today" },
      { label: "Assignments", path: "/dashboard/assignments", icon: ClipboardList, materialIcon: "assignment" },
      { label: "Notes", path: "/dashboard/library", icon: BookOpen, materialIcon: "folder" },
      { label: "PYQs", path: "/dashboard/pyq", icon: Brain, materialIcon: "psychology" },
      { label: "AI PYQ Analyzer", path: "/dashboard/pyq-analyzer", icon: Sparkles, materialIcon: "psychology_alt" },
      { label: "AI Chat", path: "/dashboard/ai-chat", icon: MessageSquare, materialIcon: "chat" }
    ]
  },

  {
    groupName: "PERSONAL",
    items: [
      { label: "Saved", path: "/dashboard/saved", icon: Bookmark, materialIcon: "bookmark" },
      { label: "Profile", path: "/dashboard/profile", icon: User, materialIcon: "person" },
      { label: "Settings", path: "/dashboard/settings", icon: Settings, materialIcon: "settings" }
    ]
  }
];

export const navItems = navGroups.flatMap((group) => group.items);

