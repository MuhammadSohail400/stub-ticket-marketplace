"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

// Concept: this is a reusable "guard" component — wrap any page's
// content with <RequireAuth> and it handles the "must be logged in"
// (and optionally "must have this role") check in one place, instead
// of repeating the same useEffect/redirect logic on every protected page.
export default function RequireAuth({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: "buyer" | "seller";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Concept: we only redirect once `loading` is false — redirecting
    // while still loading would incorrectly bounce an already-logged-in
    // user to /login for a split second before their session is checked.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center text-muted text-sm">
        Loading...
      </div>
    );
  }

  if (!user) {
    // Concept: redirect is already in-flight (from the useEffect above);
    // we render nothing rather than the protected content for that
    // brief moment.
    return null;
  }

  if (requireRole && user.role !== requireRole && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-muted text-sm">
          This page is only available to accounts with the &quot;{requireRole}&quot; role.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
