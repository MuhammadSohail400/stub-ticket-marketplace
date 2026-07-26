import { TicketListing } from "@/types";
import { formatPKR } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

export default function TicketStub({
  listing,
  eventTitle,
  action,
}: {
  listing: TicketListing;
  eventTitle: string;
  action?: React.ReactNode;
}) {
  const markup = listing.faceValue > 0
    ? Math.round(((listing.price - listing.faceValue) / listing.faceValue) * 100)
    : 0;

  const sellerName = listing.seller?.name || "Seller";

  return (
    <div className="perforated flex flex-col sm:flex-row rounded-xl border border-line bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* main stub */}
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-stub uppercase tracking-widest text-muted">
              {listing.section}
            </p>
            <h4 className="font-display font-semibold text-lg mt-0.5">{eventTitle}</h4>
            <p className="text-sm text-muted mt-0.5">{listing.seatInfo}</p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              listing.seller?.verified ? "bg-verified text-paper" : "bg-line text-muted"
            }`}
            aria-hidden
          >
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{sellerName}</span>
          {listing.seller?.verified && (
            <span className="text-[11px] font-stub uppercase text-verified tracking-wide">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* tear-off counterfoil */}
      <div className="sm:w-[28%] shrink-0 p-4 flex flex-col items-center justify-center gap-1 bg-paper-dim border-t sm:border-t-0 sm:border-l border-dashed border-line relative">
        {markup > 0 && (
          <span className="stamp absolute top-2 right-2 text-[10px] font-bold text-danger border border-danger/40 rounded px-1.5 py-0.5 bg-danger/5">
            +{markup}%
          </span>
        )}
        <p className="text-[10px] font-stub uppercase tracking-widest text-muted">Price</p>
        <p className="font-display font-bold text-xl text-ink">{formatPKR(listing.price)}</p>
        {listing.faceValue > 0 && (
          <p className="text-[11px] text-muted line-through">{formatPKR(listing.faceValue)}</p>
        )}
        <p className="text-[10px] font-stub text-muted mt-1">
          {listing.quantity} {listing.quantity > 1 ? "tickets" : "ticket"} left
        </p>
        {action}
      </div>
    </div>
  );
}
