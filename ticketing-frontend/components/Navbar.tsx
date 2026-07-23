"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="font-display font-bold text-xl tracking-tight text-ink group-hover:text-stamp transition-colors"
            aria-hidden
          >
            STUB
          </span>
          <span className="hidden sm:inline text-[11px] font-stub uppercase tracking-[0.2em] text-muted border border-line rounded-full px-2 py-0.5">
            admit one
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-medium text-sm">
          <Link href="/events" className="hover:text-stamp transition-colors">
            Browse events
          </Link>
          <Link href="/listings/create" className="hover:text-stamp transition-colors">
            Sell a ticket
          </Link>
          {user && (
            <Link
              href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
              className="hover:text-stamp transition-colors"
            >
              {user.role === "seller" ? "My listings" : "My orders"}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm font-medium hidden sm:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold border border-ink rounded-md px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-stamp transition-colors hidden sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-ink text-paper rounded-md px-4 py-2 hover:bg-stamp hover:text-ink transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}