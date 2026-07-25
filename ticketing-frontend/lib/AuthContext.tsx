"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  AuthUser,
  getStoredUser,
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
} from "./auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "buyer" | "seller"
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Concept: "loading" exists because on first render, we haven't
  // checked localStorage yet — without this flag, a protected page
  // would flash "please log in" for a split second even for an
  // already-logged-in user, before the useEffect below finishes.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const loggedInUser = await loginApi(email, password);
    setUser(loggedInUser); // Concept: THIS line is what makes Navbar update instantly
    return loggedInUser;
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    role?: "buyer" | "seller"
  ) {
    const newUser = await signupApi(name, email, password, role);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Concept: this hook is how any component reads/uses auth state —
// `const { user, logout } = useAuth();` — without needing to know
// anything about localStorage or the Context API directly.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
