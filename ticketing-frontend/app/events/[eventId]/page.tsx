import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getListingsForEvent, formatEventDate, formatPKR } from "@/lib/mockData";
import TicketStub from "@/components/TicketStub";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getEventById(eventId);
  if (!event) notFound();

  const eventListings = getListingsForEvent(eventId);

  return (
    <div>
      <div className="h-40 sm:h-56" style={{ backgroundColor: event.bannerColor }} />
      <div className="mx-auto max-w-6xl px-5">
        <div className="-mt-10 sm:-mt-14 bg-white border border-line rounded-xl p-6 shadow-sm">
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted">
            {event.category}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-1">{event.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-muted">
            <span>{event.venue}, {event.city}</span>
            <span>{formatEventDate(event.eventDate)}</span>
            <span>
              {eventListings.length} listing{eventListings.length !== 1 && "s"} · from{" "}
              <span className="text-verified font-semibold">{formatPKR(event.lowestPrice)}</span>
            </span>
          </div>
        </div>

        <div className="py-10">
          <h2 className="font-display font-bold text-xl mb-5">Available tickets</h2>
          <div className="flex flex-col gap-4">
            {eventListings.map((listing) => (
              <TicketStub
                key={listing.id}
                listing={listing}
                eventTitle={event.title}
                action={
                  listing.status === "listed" ? (
                    <Link
                      href={`/checkout/${listing.id}`}
                      className="mt-2 text-xs font-semibold bg-ink text-paper rounded-md px-3 py-1.5 hover:bg-stamp hover:text-ink transition-colors"
                    >
                      Buy
                    </Link>
                  ) : (
                    <span className="mt-2 text-xs font-stub uppercase text-muted">
                      Not available
                    </span>
                  )
                }
              />
            ))}
            {eventListings.length === 0 && (
              <p className="text-muted text-sm">
                No resale tickets listed yet for this event. Check back soon, or{" "}
                <Link href="/listings/create" className="text-stamp font-medium">
                  be the first to sell one
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
