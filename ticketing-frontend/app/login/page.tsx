"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
 
   const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Log in</h1>
      <p className="text-sm text-muted mb-8">Welcome back to Stub.</p>

      {error && (
        <div className="mb-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Email</span>
          <input
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Password</span>
          <input
            type="password"
            required
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}