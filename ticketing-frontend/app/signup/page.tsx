"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function SignupPage() {
  const router = useRouter();
    const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password, role);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Sign up</h1>
      <p className="text-sm text-muted mb-8">Create your Stub account.</p>

      {error && (
        <div className="mb-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Full name</span>
          <input
            type="text"
            required
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
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
            minLength={6}
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">
            I want to...
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`flex-1 text-sm font-medium rounded-md px-4 py-2 border transition-colors ${
                role === "buyer"
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Buy tickets
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`flex-1 text-sm font-medium rounded-md px-4 py-2 border transition-colors ${
                role === "seller"
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Sell tickets
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}