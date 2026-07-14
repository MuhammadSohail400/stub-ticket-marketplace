import EventCard from "@/components/EventCard";
import { events } from "@/lib/mockData";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8">
        <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
          {events.length} events with tickets on resale
        </p>
        <h1 className="font-display font-bold text-3xl">Browse events</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {["All", "Concert", "Sports", "Conference", "Festival"].map((c, i) => (
          <button
            key={c}
            className={`text-sm font-medium rounded-full px-4 py-1.5 border transition-colors ${
              i === 0
                ? "bg-ink text-paper border-ink"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
