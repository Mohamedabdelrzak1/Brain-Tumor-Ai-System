import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiFetchJson } from "./api7138";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "admin" | "doctor" | "student";
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isLoading = false;

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  // =========================
  // 🔐 LOGIN (FIXED 🔥)
  // =========================
  const login = (newToken: string, newUser: User) => {
    // 🔥 حل مشكلة الـ Role
    const fixedUser: User = {
      ...newUser,
      role: newUser.role.toLowerCase() as "admin" | "doctor" | "student",
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(fixedUser));

    setToken(newToken);
    setUser(fixedUser);

    // 🚀 Routing
    if (fixedUser.role === "admin") setLocation("/admin/dashboard");
    else if (fixedUser.role === "doctor") setLocation("/doctor/dashboard");
    else setLocation("/student/dashboard");
  };

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// =========================
// 🔁 HOOK
// =========================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// =========================
// 🔒 ROLE GUARD
// =========================
export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
      setLocation(`/${user.role}/dashboard`);
    }
  }, [user, isLoading, allowedRoles, setLocation]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}