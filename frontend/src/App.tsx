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
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={user ? <AppShell /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path=":module" element={<ModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
