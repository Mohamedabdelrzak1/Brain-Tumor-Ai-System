import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { useGetMe } from "@workspace/api-client-react";

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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  
  // Custom fetch automatically sends cookies if backend supports it, 
  // but if we use Bearer token, we need a way. In this workspace, customFetch 
  // usually checks localStorage implicitly if properly configured, or we rely on session cookies.
  // We'll store token anyway for client-side state.
  
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newUser.role);
    setToken(newToken);
    
    if (newUser.role === "admin") setLocation("/admin/dashboard");
    else if (newUser.role === "doctor") setLocation("/doctor/dashboard");
    else setLocation("/student/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function RoleGuard({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
