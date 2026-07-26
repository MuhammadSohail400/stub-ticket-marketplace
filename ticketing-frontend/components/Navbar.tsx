"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 font-medium text-sm">
          <Link href="/events" className="hover:text-stamp transition-colors">
            Browse events
          </Link>
          <Link href="/listings/create" className="hover:text-stamp transition-colors">
            Sell a ticket
          </Link>
          <Link href="/validate" className="hover:text-stamp transition-colors text-muted">
            Gate Scanner
          </Link>
          {user && (
            <Link
              href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
              className="hover:text-stamp transition-colors"
            >
              {user.role === "seller" ? "My listings & sales" : "My orders"}
            </Link>
          )}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm font-medium">Hi, {user.name}</span>
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
                className="text-sm font-medium hover:text-stamp transition-colors"
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

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-line rounded-md text-ink hover:bg-paper-dim focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-5 py-4 flex flex-col gap-4 animate-fade-in">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium hover:text-stamp py-1"
          >
            Browse events
          </Link>
          <Link
            href="/listings/create"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium hover:text-stamp py-1"
          >
            Sell a ticket
          </Link>
          <Link
            href="/validate"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-muted hover:text-stamp py-1"
          >
            Gate Scanner
          </Link>
          {user && (
            <Link
              href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium hover:text-stamp py-1"
            >
              {user.role === "seller" ? "My listings & sales" : "My orders"}
            </Link>
          )}

          <div className="border-t border-line pt-3 flex flex-col gap-3">
            {loading ? null : user ? (
              <>
                <span className="text-sm font-medium">Signed in as {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-sm font-semibold border border-ink rounded-md px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium border border-line rounded-md px-4 py-2 hover:border-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-semibold bg-ink text-paper rounded-md px-4 py-2 hover:bg-stamp hover:text-ink"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
