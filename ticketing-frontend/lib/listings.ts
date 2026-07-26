import api from "./api";
import { TicketListing, PaginatedResult } from "@/types";

function mapListing(raw: any): TicketListing {
  return {
    id: raw._id || raw.id,
    eventId: typeof raw.event === "string" ? raw.event : (raw.event?._id || raw.event?.id),
    event: raw.event && typeof raw.event === "object"
      ? {
          id: raw.event._id || raw.event.id,
          title: raw.event.title,
          category: raw.event.category,
          venue: raw.event.venue,
          city: raw.event.city,
          eventDate: raw.event.eventDate,
          bannerImage: raw.event.bannerImage,
        }
      : undefined,
    seller: {
      id: raw.seller?._id || raw.seller?.id,
      name: raw.seller?.name || "Seller",
      email: raw.seller?.email,
      verified: raw.seller?.isVerified ?? false,
      trustScore: raw.seller?.trustScore ?? 0,
      salesCompleted: 0,
    },
    section: raw.section,
    seatInfo: raw.seatInfo,
    price: raw.price,
    faceValue: raw.faceValue,
    quantity: raw.quantity,
    proofImage: raw.proofImage,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

export interface ListingFilters {
  event?: string;
  page?: number;
  limit?: number;
}

export async function getListingsForEvent(eventId: string): Promise<TicketListing[]> {
  const { data } = await api.get("/listings", { params: { event: eventId } });
  const rawList = Array.isArray(data.listings) ? data.listings : [];
  return rawList.map(mapListing);
}

export async function getPaginatedListings(
  filters?: ListingFilters
): Promise<PaginatedResult<TicketListing>> {
  const { data } = await api.get("/listings", { params: filters });
  const rawList = Array.isArray(data.listings) ? data.listings : [];
  return {
    success: data.success ?? true,
    total: data.total ?? rawList.length,
    page: data.page ?? 1,
    pages: data.pages ?? 1,
    items: rawList.map(mapListing),
  };
}

export async function getListingById(id: string): Promise<TicketListing | null> {
  try {
    const { data } = await api.get(`/listings/${id}`);
    if (!data.listing) return null;
    return mapListing(data.listing);
  } catch (error) {
    return null;
  }
}

export async function createListing(formData: FormData): Promise<TicketListing> {
  const { data } = await api.post("/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapListing(data.listing);
}

export async function updateListing(id: string, formData: FormData): Promise<TicketListing> {
  const { data } = await api.put(`/listings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapListing(data.listing);
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}
