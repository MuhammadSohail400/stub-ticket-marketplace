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
  eventDate: string; // ISO
  bannerColor: string; // fallback token for banner art
  lowestPrice: number;
  listingCount: number;
}

export interface Seller {
  id: string;
  name: string;
  verified: boolean;
  trustScore: number; // 0-5
  salesCompleted: number;
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
