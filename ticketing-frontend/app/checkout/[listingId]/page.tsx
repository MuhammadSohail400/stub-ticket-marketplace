import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getListingById } from "@/lib/listings";
import { formatPKR, formatEventDate } from "@/lib/utils";
import { getEventById } from "@/lib/events";
import TicketStub from "@/components/TicketStub";
import CheckoutClient from "@/components/CheckoutClient";
import RequireAuth from "@/components/RequireAuth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingId: string }>;
}): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getListingById(listingId);
  if (!listing) return { title: "Checkout — Stub" };
  const event = await getEventById(listing.eventId);
  return {
    title: `Checkout: ${event?.title || "Ticket"} — Stub`,
  };
}

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
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
          Review & Complete Payment
        </p>
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

        <TicketStub listing={listing} eventTitle={event.title} />

        <div className="mt-8 border border-line rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg mb-4">Order summary</h2>
          <div className="flex justify-between text-sm py-2">
            <span className="text-muted">Ticket price</span>
            <span className="font-medium">{formatPKR(listing.price)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-dashed border-line">
            <span className="text-muted">Platform fee (5%)</span>
            <span className="font-medium">{formatPKR(platformFee)}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg pt-3">
            <span>Total</span>
            <span className="text-verified">{formatPKR(total)}</span>
          </div>

          <div className="mt-6 rounded-lg bg-paper-dim border border-line p-4 text-xs text-muted leading-relaxed flex items-start gap-2">
            <span className="text-base leading-none">🛡️</span>
            <span>
              <strong>Escrow Protection:</strong> Your payment is held securely. It is only released to the seller after the ticket transfer is completed and you confirm receipt.
            </span>
          </div>

          <CheckoutClient listingId={listing.id} totalDisplay={formatPKR(total)} />

          <p className="text-[11px] text-muted text-center mt-4 font-stub uppercase tracking-wide">
            {event.title} · {formatEventDate(event.eventDate)}
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
