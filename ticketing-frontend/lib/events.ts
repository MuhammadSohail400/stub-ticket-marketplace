import api from "./api";
import { EventItem, PaginatedResult } from "@/types";
import { categoryColor } from "./utils";

function mapEvent(raw: any): EventItem {
  return {
    id: raw._id || raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    venue: raw.venue,
    city: raw.city,
    eventDate: raw.eventDate,
    bannerImage: raw.bannerImage?.url
      ? { url: raw.bannerImage.url, public_id: raw.bannerImage.public_id }
      : undefined,
    bannerColor: categoryColor(raw.category),
    createdBy: raw.createdBy
      ? {
          id: raw.createdBy._id || raw.createdBy.id,
          name: raw.createdBy.name,
          email: raw.createdBy.email,
        }
      : undefined,
    createdAt: raw.createdAt,
    lowestPrice: raw.lowestPrice,
    listingCount: raw.listingCount,
  };
}

export interface EventFilters {
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getEvents(filters?: EventFilters): Promise<EventItem[]> {
  const { data } = await api.get("/events", { params: filters });
  const rawList = Array.isArray(data.events) ? data.events : [];
  return rawList.map(mapEvent);
}

export async function getPaginatedEvents(
  filters?: EventFilters
): Promise<PaginatedResult<EventItem>> {
  const { data } = await api.get("/events", { params: filters });
  const rawList = Array.isArray(data.events) ? data.events : [];
  return {
    success: data.success ?? true,
    total: data.total ?? rawList.length,
    page: data.page ?? 1,
    pages: data.pages ?? 1,
    items: rawList.map(mapEvent),
  };
}

export async function getEventById(id: string): Promise<EventItem | null> {
  try {
    const { data } = await api.get(`/events/${id}`);
    if (!data.event) return null;
    return mapEvent(data.event);
  } catch (error) {
    return null;
  }
}
