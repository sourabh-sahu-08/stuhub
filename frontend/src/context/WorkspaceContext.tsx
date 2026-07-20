import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

export interface WorkspaceMetrics {
  notesUploaded: number;
  pyqsUploaded: number;
  pendingAssignments: number;
  attendancePercentage: number;
}

interface WorkspaceContextType {
  metrics: WorkspaceMetrics;
  assignments: any[];
  recentNotes: any[];
  loading: boolean;
  refreshMetrics: () => Promise<void>;
  updateLocalAttendance: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);

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
        api.get("/assignments").catch(() => ({ data: [] })),
        api.get("/notes/recent").catch(() => ({ data: [] })),
      ]);

      setAssignments(assignmentsRes.data);
      setRecentNotes(notesRes.data);
      
      setMetrics({
        ...metricsRes.data.metrics,
        attendancePercentage: getLocalAttendance(),
        pendingAssignments: assignmentsRes.data.filter((a: any) => a.status !== "Submitted").length
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
    <WorkspaceContext.Provider value={{ metrics, assignments, recentNotes, loading, refreshMetrics, updateLocalAttendance }}>
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
