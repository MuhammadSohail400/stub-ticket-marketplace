"use client";

import { useState } from "react";
import { validateTicket } from "@/lib/transfers";

export default function ValidateTicketPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await validateTicket(token.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.response?.data?.message || "Invalid ticket or server error.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <div className="text-center mb-8">
        <span className="text-[11px] font-stub uppercase tracking-widest text-muted border border-line rounded-full px-3 py-1 inline-block mb-3">
          Gate Scanner Simulator
        </span>
        <h1 className="font-display font-bold text-3xl">Validate Entry Pass</h1>
        <p className="text-sm text-muted mt-2">
          Enter or scan a single-use ticket transfer token to grant admission.
        </p>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleValidate} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-stub uppercase tracking-wide text-muted">
              Ticket Token ID
            </span>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 4f89a2b719..."
              className="input font-mono text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="font-semibold bg-ink text-paper rounded-lg px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? "Verifying..." : "Validate Pass"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-6 p-6 rounded-xl border text-center animate-fade-in ${
              result.success
                ? "bg-verified/10 border-verified/30 text-verified"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            <div className="text-3xl mb-2">{result.success ? "🎟️ ✅" : "🛑 ❌"}</div>
            <p className="font-display font-bold text-xl">
              {result.success ? "ENTRY GRANTED" : "ENTRY DENIED"}
            </p>
            <p className="text-sm mt-1">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
