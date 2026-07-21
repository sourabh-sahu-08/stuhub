import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(payload: { name: string; email: string; password: string; role: Role }): Promise<void>;
  socialLogin(idToken: string): Promise<void>;
  completeProfile(payload: { name: string; rollNumber: string; department?: string; semester?: number }): Promise<void>;
  logout(): void;
  setAuthSession(token: string, user: User): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("stuhub-token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api.get("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem("stuhub-token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    async login(email, password) {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("stuhub-token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    },
    async register(payload) {
      const response = await api.post("/auth/register", payload);
      localStorage.setItem("stuhub-token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    },
    async socialLogin(idToken) {
      const response = await api.post("/auth/social-login", { idToken });
      localStorage.setItem("stuhub-token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    },
    async completeProfile(payload) {
      const response = await api.put("/auth/complete-profile", payload);
      localStorage.setItem("stuhub-token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    },
    logout() {
      localStorage.removeItem("stuhub-token");
      setToken(null);
      setUser(null);
    },
    setAuthSession(newToken, newUser) {
      localStorage.setItem("stuhub-token", newToken);
      setToken(newToken);
      setUser(newUser);
    }
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
