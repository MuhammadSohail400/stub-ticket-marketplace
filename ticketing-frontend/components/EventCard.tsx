import Link from "next/link";
import Image from "next/image";
import { EventItem } from "@/types";
import { formatEventDate, formatPKR } from "@/lib/utils";

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
        className="h-32 flex items-end p-4 relative overflow-hidden"
        style={{ backgroundColor: event.bannerColor || "#14213D" }}
      >
        {event.bannerImage?.url && (
          <Image
            src={event.bannerImage.url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <span className="relative z-10 text-[11px] font-stub uppercase tracking-widest text-paper/90 bg-black/40 backdrop-blur-xs rounded-full px-2.5 py-1 border border-white/20">
          {CATEGORY_LABEL[event.category] || event.category}
        </span>
        {event.listingCount !== undefined && (
          <span className="relative z-10 absolute top-3 right-3 text-[11px] font-stub text-paper/80 bg-black/40 backdrop-blur-xs rounded-full px-2 py-0.5 border border-white/10">
            {event.listingCount} listed
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-stamp transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-muted mt-1 line-clamp-1">
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
