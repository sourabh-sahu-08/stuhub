import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

export interface WorkspaceMetrics {
  notesUploaded: number;
  pyqsUploaded: number;
  pendingAssignments: number;
  attendancePercentage: number;
}

export interface Bookmark {
  id: string;
  title: string;
  type: 'note' | 'pyq' | 'assignment' | 'resource';
  subject?: string;
  url?: string;
  createdAt: string;
}

interface WorkspaceContextType {
  metrics: WorkspaceMetrics;
  assignments: any[];
  recentNotes: any[];
  bookmarks: Bookmark[];
  loading: boolean;
  refreshMetrics: () => Promise<void>;
  updateLocalAttendance: () => void;
  toggleBookmark: (item: Omit<Bookmark, 'createdAt'>) => void;
  isBookmarked: (id: string) => boolean;
}

const defaultMetrics: WorkspaceMetrics = {
  notesUploaded: 0,
  pyqsUploaded: 0,
  pendingAssignments: 0,
  attendancePercentage: 0,
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<WorkspaceMetrics>(defaultMetrics);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load bookmarks on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("stuhub-bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        setBookmarks([]);
      }
    }
  }, []);

  const toggleBookmark = (item: Omit<Bookmark, 'createdAt'>) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === item.id);
      let newBookmarks;
      if (exists) {
        newBookmarks = prev.filter(b => b.id !== item.id);
      } else {
        newBookmarks = [{ ...item, createdAt: new Date().toISOString() }, ...prev];
      }
      localStorage.setItem("stuhub-bookmarks", JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(b => b.id === id);
  };

  // Helper to read attendance from localStorage to ensure immediate global sync
  const getLocalAttendance = () => {
    const savedSubjects = localStorage.getItem("stuhub-attendance-subjects-v2");
    const savedLogs = localStorage.getItem("stuhub-attendance-logs-v2");
    if (!savedSubjects) return 0;
    
    try {
      const subjects = JSON.parse(savedSubjects);
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      let totalAttended = 0;
      let totalConducted = 0;

      subjects.forEach((sub: any) => {
        const subLogs = logs.filter((l: any) => l.subjectId === sub.id);
        const attendedLogs = subLogs.filter((l: any) => l.status === "attended").length;
        const bunkedLogs = subLogs.filter((l: any) => l.status === "bunked").length;
        totalAttended += (sub.baselineAttended ?? 0) + attendedLogs;
        totalConducted += (sub.baselineTotal ?? 0) + attendedLogs + bunkedLogs;
      });

      return totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
    } catch (e) {
      return 0;
    }
  };

  const refreshMetrics = async () => {
    if (!user) {
      setMetrics(defaultMetrics);
      setAssignments([]);
      setRecentNotes([]);
      setLoading(false);
      return;
    }

    try {
      const [metricsRes, assignmentsRes, notesRes] = await Promise.all([
        api.get("/dashboard/metrics").catch(() => ({ data: { metrics: defaultMetrics } })),
        api.get("/assignments/recent").catch(() => ({ data: [] })),
        api.get("/notes/recent").catch(() => ({ data: [] }))
      ]);

      setAssignments(assignmentsRes.data);
      setRecentNotes(notesRes.data);
      
      setMetrics({
        ...metricsRes.data.metrics,
        attendancePercentage: getLocalAttendance(),
        pendingAssignments: 0
      });
    } catch (err) {
      console.error("Failed to fetch workspace metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalAttendance = () => {
    setMetrics(prev => ({
      ...prev,
      attendancePercentage: getLocalAttendance()
    }));
  };

  useEffect(() => {
    refreshMetrics();
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        metrics,
        assignments,
        recentNotes,
        bookmarks,
        loading,
        refreshMetrics,
        updateLocalAttendance,
        toggleBookmark,
        isBookmarked
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
