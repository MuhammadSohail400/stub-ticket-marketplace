import Link from "next/link";
import { EventItem } from "@/types";
import { formatEventDate, formatPKR } from "@/lib/mockData";

const CATEGORY_LABEL: Record<string, string> = {
  concert: "Concert",
  sports: "Sports",
  conference: "Conference",
  theatre: "Theatre",
  festival: "Festival",
};

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-xl border border-line bg-white overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
    >
      <div
        className="h-28 flex items-end p-4 relative"
        style={{ backgroundColor: event.bannerColor }}
      >
        <span className="text-[11px] font-stub uppercase tracking-widest text-paper/80 bg-black/20 rounded-full px-2 py-1">
          {CATEGORY_LABEL[event.category]}
        </span>
        {event.listingCount !== undefined && (
          <span className="absolute top-3 right-3 text-[11px] font-stub text-paper/70">
            {event.listingCount} listed
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-stamp transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted mt-1">
          {event.venue}, {event.city}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-line">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">
            {formatEventDate(event.eventDate)}
          </span>
          {event.lowestPrice !== undefined && (
            <span className="text-sm font-semibold">
              from <span className="text-verified">{formatPKR(event.lowestPrice)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}