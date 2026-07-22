import api from "./api";
import { EventItem } from "@/types";

function mapEvent(raw: any): EventItem {
  return {
    id: raw._id,
    title: raw.title,
    category: raw.category,
    venue: raw.venue,
    city: raw.city,
    eventDate: raw.eventDate,
    bannerColor: categoryColor(raw.category),
  };
}

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
    return null;
  }
}