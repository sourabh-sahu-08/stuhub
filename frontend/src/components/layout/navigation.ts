import {
  Home,
  CalendarDays,
  BookOpen,
  Brain,
  Calendar,
  Bell,
  Bookmark,
  User,
  Settings
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
      { label: "Notes", path: "/dashboard/library", icon: BookOpen, materialIcon: "folder" },
      { label: "PYQs", path: "/dashboard/pyq", icon: Brain, materialIcon: "psychology" }
    ]
  },
  {
    groupName: "CAMPUS",
    items: [
      { label: "Events", path: "/dashboard/events", icon: Calendar, materialIcon: "event" },
      { label: "Announcements", path: "/dashboard/messages", icon: Bell, materialIcon: "notifications" }
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

