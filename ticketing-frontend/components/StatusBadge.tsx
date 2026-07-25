// Concept: this component now renders statuses for BOTH TicketListing
// and Order — the two sets overlap but aren't identical ("pending"/
// "refunded" only exist on Order; "listed"/"reserved" only on Listing).
// Rather than maintaining two near-duplicate badge components, we widen
// the accepted type to a plain `string` and fall back to a neutral
// style for anything not explicitly listed — safer than crashing if a
// new status value is ever added on the backend before this map is updated.
const STYLES: Record<string, { label: string; className: string }> = {
  listed: { label: "Available", className: "bg-verified/10 text-verified" },
  reserved: { label: "Reserved", className: "bg-stamp/20 text-[#8a5a12]" },
  pending: { label: "Pending", className: "bg-stamp/20 text-[#8a5a12]" },
  paid: { label: "Paid", className: "bg-ink/10 text-ink" },
  transferred: { label: "Transferred", className: "bg-ink/10 text-ink" },
  completed: { label: "Completed", className: "bg-verified/10 text-verified" },
  cancelled: { label: "Cancelled", className: "bg-danger/10 text-danger" },
  disputed: { label: "Disputed", className: "bg-danger/10 text-danger" },
  refunded: { label: "Refunded", className: "bg-danger/10 text-danger" },
};

const DEFAULT_STYLE = { label: "Unknown", className: "bg-line/40 text-muted" };

export default function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] || DEFAULT_STYLE;
  return (
    <span
      className={`text-[11px] font-stub uppercase tracking-wide rounded-full px-2.5 py-1 whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
}
