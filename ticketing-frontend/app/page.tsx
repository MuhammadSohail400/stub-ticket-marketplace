import Link from "next/link";
import EventCard from "@/components/EventCard";
import { events } from "@/lib/mockData";

export default function Home() {
  const featured = events.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-[11px] font-stub uppercase tracking-[0.2em] text-muted border border-line rounded-full px-3 py-1 mb-6">
            Karachi · Lahore · Islamabad
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Can&apos;t make it?
            <br />
            <span className="text-stamp">Hand off the ticket.</span>
          </h1>
          <p className="text-muted text-lg mt-5 max-w-md">
            Stub connects fans who can&apos;t use a ticket with fans who want one —
            verified sellers, escrow-held payment, and a real transfer before anyone pays out.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/events"
              className="font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors"
            >
              Browse events
            </Link>
            <Link
              href="/listings/create"
              className="font-semibold border border-ink rounded-md px-6 py-3 hover:bg-ink hover:text-paper transition-colors"
            >
              Sell a ticket
            </Link>
          </div>
        </div>

        {/* signature ticket-stub visual */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="perforated flex rounded-xl border border-line bg-white shadow-xl rotate-2">
            <div className="flex-1 p-6">
              <p className="text-xs font-stub uppercase tracking-widest text-muted">
                Gold Enclosure
              </p>
              <h3 className="font-display font-bold text-2xl mt-1">Atif Aslam</h3>
              <p className="text-sm text-muted mt-1">Expo Centre, Karachi</p>
              <p className="text-sm text-muted">Sat, 12 Sep 2026 · 7:00 PM</p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-verified text-paper flex items-center justify-center text-xs font-bold">
                  H
                </div>
                <span className="text-sm font-medium">Hassan R.</span>
                <span className="text-[11px] font-stub uppercase text-verified tracking-wide">
                  Verified
                </span>
              </div>
            </div>
            <div className="w-[30%] shrink-0 p-4 flex flex-col items-center justify-center gap-1 bg-paper-dim">
              <p className="text-[10px] font-stub uppercase tracking-widest text-muted">Seat</p>
              <p className="font-display font-bold text-lg">C-12</p>
              <div className="mt-2 flex flex-col gap-0.5" aria-hidden>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-0.5 bg-ink"
                    style={{ width: `${20 + ((i * 7) % 20)}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 -z-10 w-full h-full rounded-xl border border-line bg-paper-dim -rotate-3" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-paper-dim">
        <div className="mx-auto max-w-6xl px-5 py-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display font-bold text-2xl">Escrow-held</p>
            <p className="text-xs text-muted mt-1 font-stub uppercase tracking-wide">
              Payment releases only after transfer
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-2xl">QR-verified</p>
            <p className="text-xs text-muted mt-1 font-stub uppercase tracking-wide">
              Every stub has a single-use code
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-2xl">Real sellers</p>
            <p className="text-xs text-muted mt-1 font-stub uppercase tracking-wide">
              Trust scores from past sales
            </p>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">Selling fast</h2>
          <Link href="/events" className="text-sm font-semibold hover:text-stamp">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featured.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
