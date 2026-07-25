import { notFound } from "next/navigation";
import { getListingById } from "@/lib/listings";
import { formatPKR, formatEventDate } from "@/lib/mockData";
import { getEventById } from "@/lib/events";
import TicketStub from "@/components/TicketStub";
import CheckoutClient from "@/components/CheckoutClient";
import RequireAuth from "@/components/RequireAuth";

// Concept: these pages fetch live data from the backend on every
// request instead of being statically generated at build time —
// necessary since events/orders change constantly and build time
// happens before the backend even has this data.
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await getListingById(listingId);
  if (!listing) notFound();
  const event = await getEventById(listing.eventId);
  if (!event) notFound();

  const platformFee = Math.round(listing.price * 0.05);
  const total = listing.price + platformFee;

  return (
    // Concept: CheckoutPage is a Server Component (it fetches
    // listing/event before rendering), but it can still render
    // RequireAuth — a Client Component — and pass this server-rendered
    // JSX as `children`. RequireAuth checks login state client-side and
    // redirects to /login if needed, exactly like it does for the
    // "sell a ticket" page.
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
          Step 1 of 2 · Review order
        </p>
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

        <TicketStub listing={listing} eventTitle={event.title} />

        <div className="mt-8 border border-line rounded-xl bg-white p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Order summary</h2>
          <div className="flex justify-between text-sm py-2">
            <span className="text-muted">Ticket price</span>
            <span>{formatPKR(listing.price)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-dashed border-line">
            <span className="text-muted">Platform fee (5%)</span>
            <span>{formatPKR(platformFee)}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg pt-3">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>

          <div className="mt-6 rounded-lg bg-paper-dim border border-line p-4 text-xs text-muted leading-relaxed">
            Your payment is held in escrow. It's released to the seller only after the ticket
            is transferred and you confirm receipt — you're never paying blind.
          </div>

          <CheckoutClient listingId={listing.id} totalDisplay={formatPKR(total)} />

          <p className="text-[11px] text-muted text-center mt-2 font-stub uppercase tracking-wide">
            {event.title} · {formatEventDate(event.eventDate)}
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
