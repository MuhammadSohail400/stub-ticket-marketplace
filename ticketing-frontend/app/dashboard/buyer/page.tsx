import { listings, formatPKR } from "@/lib/mockData";
import { getEvents } from "@/lib/events";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function BuyerDashboard() {
  const myOrders = listings.slice(0, 2);
  const events = await getEvents();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
        Dashboard
      </p>
      <h1 className="font-display font-bold text-3xl mb-8">My orders</h1>

      <div className="flex flex-col gap-3">
        {myOrders.map((l) => {
          const event = events.find((e) => e.id === l.eventId);
          return (
            <div
              key={l.id}
              className="flex items-center justify-between border border-line rounded-lg bg-white p-4"
            >
              <div>
                <p className="font-display font-semibold">{event?.title ?? l.eventId}</p>
                <p className="text-sm text-muted">
                  {l.section} · {l.seatInfo}
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