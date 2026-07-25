import api from "./api";
import { EventItem } from "@/types";

// Concept: this is the "adapter" layer — it takes whatever shape the
// backend sends (MongoDB's `_id`, snake/camel field names, etc.) and
// maps it into the EventItem shape our components already expect. If
// the backend's response shape ever changes, only this function needs
// updating — not every component that renders an event.
function mapEvent(raw: any): EventItem {
  return {
    id: raw._id,
    title: raw.title,
    category: raw.category,
    venue: raw.venue,
    city: raw.city,
    eventDate: raw.eventDate,
    bannerImage: raw.bannerImage,

    bannerColor: categoryColor(raw.category),
    // lowestPrice / listingCount intentionally omitted — see types/index.ts.
    // Phase F4 will populate these once Listings are connected.
  };
}

// Concept: bannerColor was always a frontend/design concern, not real
// domain data — the backend has no opinion on what color an event's
// card should be. We derive it from category here instead.
function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    concert: "#14213D",
    sports: "#2F6B4F",
    conference: "#E8A33D",
    festival: "#C1443C",
    theatre: "#14213D",
  };
  return colors[category] || "#14213D";
}

export async function getEvents(filters?: { city?: string; category?: string }): Promise<EventItem[]> {
  const { data } = await api.get("/events", { params: filters });
  return data.events.map(mapEvent);
}

export async function getEventById(id: string): Promise<EventItem | null> {
  try {
    const { data } = await api.get(`/events/${id}`);
    return mapEvent(data.event);
  } catch (error) {
    // Concept: axios throws on any non-2xx response (like our 404 when
    // an event isn't found). We catch it here and return null instead,
    // so the calling page can use Next.js's notFound() the same way it
    // already did with the mock data's `undefined` return.
    return null;
  }
}
