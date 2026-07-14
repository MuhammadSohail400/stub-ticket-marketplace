import Link from "next/link";

export default function Navbar() {
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
          <Link href="/dashboard/buyer" className="hover:text-stamp transition-colors">
            My orders
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  );
}
