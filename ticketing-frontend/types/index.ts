export type ListingStatus =
  | "listed"
  | "reserved"
  | "paid"
  | "transferred"
  | "completed"
  | "cancelled"
  | "disputed";

export type EventCategory = "concert" | "sports" | "conference" | "theatre" | "festival";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  city: string;
  eventDate: string;
  bannerImage?: {
  url: string;
  public_id: string;
}; // ISO
  bannerColor: string; // fallback token for banner art
  // Concept: these two are computed from Listings, not stored on Event
  // itself. The mock data had them ready-made; the real backend
  // requires a separate query/aggregation (Phase F4), so they're
  // optional here until that's wired up.

  lowestPrice?: number;
  listingCount?: number;
}

export interface Seller {
  id: string;
  name: string;
  verified?: boolean;
  trustScore?: number; // 0-5
  salesCompleted?: number;
}

export interface TicketListing {
  id: string;
  eventId: string;
  seller: Seller;
  section: string;
  seatInfo: string;
  price: number;
  faceValue: number;
  quantity: number;
  status: ListingStatus;
}

// Concept: Order has its own status set — it overlaps with
// ListingStatus but isn't identical ("pending" and "refunded" exist
// for orders, "listed"/"reserved" don't apply to an order).
export type OrderStatus =
  | "pending"
  | "paid"
  | "transferred"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

export interface OrderItem {
  id: string;
  ticketListing: {
    id: string;
    section: string;
    seatInfo: string;
  } | null; // null-safe: a listing could theoretically be deleted later
  buyer: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
  amount: number;
  platformFee: number;
  status: OrderStatus;
  escrowStatus: "held" | "released" | "refunded";
  createdAt: string;
}
