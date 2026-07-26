"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function RequireAuth({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: "buyer" | "seller" | "admin";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center text-muted text-sm flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && user.role !== requireRole && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="rounded-xl border border-line bg-white p-8 shadow-sm">
          <p className="text-danger font-semibold text-lg mb-2">Access Restricted</p>
          <p className="text-muted text-sm">
            This section requires an account with the &quot;{requireRole}&quot; role.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 font-semibold bg-ink text-paper rounded-md px-5 py-2 text-sm hover:bg-stamp hover:text-ink transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
