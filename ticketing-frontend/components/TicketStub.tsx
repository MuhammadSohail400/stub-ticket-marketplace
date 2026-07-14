import { TicketListing } from "@/types";
import { formatPKR } from "@/lib/mockData";
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
  const markup = Math.round(((listing.price - listing.faceValue) / listing.faceValue) * 100);

  return (
    <div className="perforated flex rounded-xl border border-line bg-white overflow-hidden">
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
              listing.seller.verified ? "bg-verified text-paper" : "bg-line text-muted"
            }`}
            aria-hidden
          >
            {listing.seller.name.charAt(0)}
          </div>
          <span className="text-sm font-medium">{listing.seller.name}</span>
          {listing.seller.verified && (
            <span className="text-[11px] font-stub uppercase text-verified tracking-wide">
              Verified · {listing.seller.salesCompleted} sales
            </span>
          )}
        </div>
      </div>

      {/* tear-off counterfoil */}
      <div className="w-[28%] shrink-0 p-4 flex flex-col items-center justify-center gap-1 bg-paper-dim relative">
        {markup > 0 && (
          <span className="stamp absolute top-2 right-2 text-[10px] font-bold text-danger border border-danger rounded px-1.5 py-0.5">
            +{markup}%
          </span>
        )}
        <p className="text-[10px] font-stub uppercase tracking-widest text-muted">Price</p>
        <p className="font-display font-bold text-xl text-ink">{formatPKR(listing.price)}</p>
        <p className="text-[11px] text-muted line-through">{formatPKR(listing.faceValue)}</p>
        <p className="text-[10px] font-stub text-muted mt-1">
          {listing.quantity} {listing.quantity > 1 ? "tickets" : "ticket"} left
        </p>
        {action}
      </div>
    </div>
  );
}
