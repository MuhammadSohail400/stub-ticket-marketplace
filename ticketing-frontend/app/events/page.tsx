import Link from "next/link";
import EventCard from "@/components/EventCard";
import { getPaginatedEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Events — Stub Marketplace",
  description: "Discover live concerts, sports, conferences, and festivals with resale tickets.",
};

const CATEGORIES = ["All", "Concert", "Sports", "Conference", "Theatre", "Festival"];
const CITIES = ["All Cities", "Karachi", "Lahore", "Islamabad", "Rawalpindi"];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const activeCity = params.city || "All Cities";
  const currentPage = parseInt(params.page || "1", 10);

  const queryFilters: { city?: string; category?: string; page?: number; limit?: number } = {
    page: currentPage,
    limit: 12,
  };

  if (activeCategory !== "All") {
    queryFilters.category = activeCategory.toLowerCase();
  }
  if (activeCity !== "All Cities") {
    queryFilters.city = activeCity;
  }

  const { items: events, total, pages } = await getPaginatedEvents(queryFilters);

  function buildUrl(cat: string, city: string, pageNum: number) {
    const p = new URLSearchParams();
    if (cat !== "All") p.set("category", cat);
    if (city !== "All Cities") p.set("city", city);
    if (pageNum > 1) p.set("page", pageNum.toString());
    const q = p.toString();
    return `/events${q ? `?${q}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
            {total} {total === 1 ? "event" : "events"} available
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl">Browse events</h1>
        </div>

        {/* City Filter Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">City:</span>
          <div className="flex gap-1.5 flex-wrap">
            {CITIES.map((c) => {
              const isActive = activeCity === c;
              return (
                <Link
                  key={c}
                  href={buildUrl(activeCategory, c, 1)}
                  className={`text-xs font-medium rounded-md px-3 py-1.5 border transition-colors ${
                    isActive
                      ? "bg-ink text-paper border-ink"
                      : "border-line text-muted hover:border-ink hover:text-ink bg-white"
                  }`}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-line pb-4">
        {CATEGORIES.map((c) => {
          const isActive = activeCategory.toLowerCase() === c.toLowerCase() || (c === "All" && activeCategory === "All");
          return (
            <Link
              key={c}
              href={buildUrl(c, activeCity, 1)}
              className={`text-sm font-medium rounded-full px-4 py-1.5 border transition-colors ${
                isActive
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-muted hover:border-ink hover:text-ink bg-white"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 bg-white border border-line rounded-xl p-8">
          <p className="font-display font-bold text-xl mb-2">No matching events found</p>
          <p className="text-muted text-sm max-w-md mx-auto mb-6">
            There are currently no tickets listed for this filter combination. Try clearing your search filters or browse all events.
          </p>
          <Link
            href="/events"
            className="font-semibold bg-ink text-paper rounded-md px-5 py-2.5 text-sm hover:bg-stamp hover:text-ink transition-colors inline-block"
          >
            Clear Filters
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildUrl(activeCategory, activeCity, currentPage - 1)}
              className="text-sm font-medium border border-line rounded-md px-4 py-2 hover:border-ink transition-colors"
            >
              ← Previous
            </Link>
          )}

          <span className="text-xs font-stub text-muted px-3">
            Page {currentPage} of {pages}
          </span>

          {currentPage < pages && (
            <Link
              href={buildUrl(activeCategory, activeCity, currentPage + 1)}
              className="text-sm font-medium border border-line rounded-md px-4 py-2 hover:border-ink transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
