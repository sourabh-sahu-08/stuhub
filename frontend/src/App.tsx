import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ModulePage } from "./pages/ModulePage";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./context/AuthContext";
import { LoadingScreen } from "./components/ui/LoadingScreen";

export function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen label="Opening College OS" />;

  return (
    <Routes>
      {/* Root landing and overview page */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Dashboard workspace nested under /dashboard */}
      <Route
        path="/dashboard"
        element={user ? <AppShell /> : <Navigate to="/" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path=":module" element={<ModulePage />} />
      </Route>

      {/* Redirect all unmatched routes to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
