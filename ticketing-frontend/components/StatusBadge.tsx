import { ListingStatus } from "@/types";

const STYLES: Record<ListingStatus, { label: string; className: string }> = {
  listed: { label: "Available", className: "bg-verified/10 text-verified" },
  reserved: { label: "Reserved", className: "bg-stamp/20 text-[#8a5a12]" },
  paid: { label: "Paid", className: "bg-ink/10 text-ink" },
  transferred: { label: "Transferred", className: "bg-ink/10 text-ink" },
  completed: { label: "Completed", className: "bg-verified/10 text-verified" },
  cancelled: { label: "Cancelled", className: "bg-danger/10 text-danger" },
  disputed: { label: "Disputed", className: "bg-danger/10 text-danger" },
};

export default function StatusBadge({ status }: { status: ListingStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`text-[11px] font-stub uppercase tracking-wide rounded-full px-2.5 py-1 whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
}
