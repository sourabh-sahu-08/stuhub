import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ModulePage } from "./pages/ModulePage";
import { PyqPage } from "./pages/PyqPage";
import { PyqAnalyzerPage } from "./pages/PyqAnalyzerPage";
import { NotesPage } from "./pages/NotesPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { AppShell } from "./components/layout/AppShell";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminContent } from "./pages/admin/AdminContent";
import { AdminFeedback } from "./pages/admin/AdminFeedback";
import { useAuth } from "./context/AuthContext";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { AiChatWidget } from "./components/chat/AiChatWidget";

export function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen label="Opening Stuhub" />;

  return (
    <>
      <Routes>
        {/* Root landing and overview page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Dashboard workspace nested under /dashboard */}
        <Route
          path="/dashboard"
          element={user ? <AppShell /> : <Navigate to="/" replace />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="pyq" element={<PyqPage />} />
          <Route path="pyq-analyzer" element={<PyqAnalyzerPage />} />
          <Route path="library" element={<NotesPage />} />
          <Route path=":module" element={<ModulePage />} />
        </Route>

        {/* Dedicated Admin CMS */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>

        {/* Redirect all unmatched routes to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AiChatWidget />
    </>
  );
}
