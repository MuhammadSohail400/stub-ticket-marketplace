import Link from "next/link";
import { listings, formatPKR } from "@/lib/mockData";
import { getEvents } from "@/lib/events";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
  const myListings = listings.slice(2, 6);
  const events = await getEvents();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
            Dashboard
          </p>
          <h1 className="font-display font-bold text-3xl">My listings</h1>
        </div>
        <Link
          href="/listings/create"
          className="text-sm font-semibold bg-ink text-paper rounded-md px-4 py-2 hover:bg-stamp hover:text-ink transition-colors"
        >
          + New listing
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {myListings.map((l) => {
          const event = events.find((e) => e.id === l.eventId);
          return (
            <div
              key={l.id}
              className="flex items-center justify-between border border-line rounded-lg bg-white p-4"
            >
              <div>
                <p className="font-display font-semibold">{event?.title ?? l.eventId}</p>
                <p className="text-sm text-muted">
                  {l.section} · {l.seatInfo} · Qty {l.quantity}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatPKR(l.price)}</span>
                <StatusBadge status={l.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}