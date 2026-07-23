"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

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