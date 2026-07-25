import api from "./api";
import { TicketListing } from "@/types";

// Concept: same adapter pattern as lib/events.ts — the backend's raw
// shape (populated event/seller sub-documents, Mongo _id) gets mapped
// into the shape our components already expect.
function mapListing(raw: any): TicketListing {
  return {
    id: raw._id,
    eventId: typeof raw.event === "string" ? raw.event : raw.event?._id,
    seller: {
      id: raw.seller?._id,
      name: raw.seller?.name,
      // Concept: our backend's populate("seller", "name email") only
      // sends back name/email — verified/trustScore/salesCompleted were
      // mock-only convenience fields. Left undefined here; components
      // already handle that gracefully (see types/index.ts).
      verified: false,
      trustScore: 0,
      salesCompleted: 0,
    },
    section: raw.section,
    seatInfo: raw.seatInfo,
    price: raw.price,
    faceValue: raw.faceValue,
    quantity: raw.quantity,
    status: raw.status,
  };
}

export async function getListingsForEvent(eventId: string): Promise<TicketListing[]> {
  const { data } = await api.get("/listings", { params: { event: eventId } });
  return data.listings.map(mapListing);
}

export async function getListingById(id: string): Promise<TicketListing | null> {
  try {
    const { data } = await api.get(`/listings/${id}`);
    return mapListing(data.listing);
  } catch (error) {
    return null;
  }
}

// Concept: this takes a FormData object (not a plain object) because
// the backend now expects multipart/form-data — it contains a real
// File for proofImage alongside the text fields.
export async function createListing(formData: FormData): Promise<TicketListing> {
  const { data } = await api.post("/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapListing(data.listing);
}
