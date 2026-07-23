import api from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TOKEN_KEY = "stub_token";
const USER_KEY = "stub_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role?: "buyer" | "seller"
): Promise<AuthUser> {
  const { data } = await api.post("/auth/signup", { name, email, password, role });
  saveSession(data.token, data.user);
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post("/auth/login", { email, password });
  saveSession(data.token, data.user);
  return data.user;
}

export function logout() {
  clearSession();
}