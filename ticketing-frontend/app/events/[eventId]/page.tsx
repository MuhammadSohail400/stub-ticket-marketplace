import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEventById } from "@/lib/events";
import { getListingsForEvent } from "@/lib/listings";
import { formatEventDate, formatPKR } from "@/lib/utils";
import TicketStub from "@/components/TicketStub";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) return { title: "Event Not Found — Stub" };

  return {
    title: `${event.title} Tickets — Stub Marketplace`,
    description: `Buy and sell resale tickets for ${event.title} at ${event.venue}, ${event.city}.`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const eventListings = await getListingsForEvent(eventId);

  const bannerUrl = event.bannerImage?.url;

  return (
    <div>
      {/* Event Header Banner */}
      <div
        className="relative h-44 sm:h-64 overflow-hidden"
        style={{ backgroundColor: event.bannerColor || "#14213D" }}
      >
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt={event.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <div className="-mt-12 sm:-mt-16 relative z-10 bg-white border border-line rounded-xl p-6 shadow-md">
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted">
            {event.category}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-1">{event.title}</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">{event.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 pt-3 border-t border-line text-sm text-muted">
            <span>
              📍 <strong>Venue:</strong> {event.venue}, {event.city}
            </span>
            <span>
              📅 <strong>Date:</strong> {formatEventDate(event.eventDate)}
            </span>
            <span>
              🎟️ <strong>Available Listings:</strong> {eventListings.length}
            </span>
          </div>
        </div>

        <div className="py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl sm:text-2xl">Available tickets</h2>
            <Link
              href="/listings/create"
              className="text-xs font-semibold bg-ink text-paper rounded-md px-3.5 py-2 hover:bg-stamp hover:text-ink transition-colors"
            >
              + Sell your ticket
            </Link>
          </div>

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
                      className="mt-2 text-xs font-semibold bg-ink text-paper rounded-md px-4 py-2 hover:bg-stamp hover:text-ink transition-colors text-center"
                    >
                      Buy Now
                    </Link>
                  ) : (
                    <span className="mt-2 text-xs font-stub uppercase text-muted text-center border border-line rounded px-2 py-1">
                      {listing.status}
                    </span>
                  )
                }
              />
            ))}

            {eventListings.length === 0 && (
              <div className="text-center py-12 bg-white border border-line rounded-xl p-8 shadow-xs">
                <p className="font-display font-bold text-lg mb-1">No tickets listed yet</p>
                <p className="text-muted text-sm mb-4">
                  Be the first to list a ticket for this event on Stub Marketplace.
                </p>
                <Link
                  href="/listings/create"
                  className="font-semibold bg-stamp text-ink rounded-md px-5 py-2.5 text-sm hover:bg-amber-400 transition-colors inline-block"
                >
                  List a ticket
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
