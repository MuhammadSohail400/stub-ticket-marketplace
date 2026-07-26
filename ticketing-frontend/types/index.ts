export type ListingStatus =
  | "listed"
  | "reserved"
  | "paid"
  | "transferred"
  | "completed"
  | "cancelled"
  | "disputed";

export type OrderStatus =
  | "pending"
  | "paid"
  | "transferred"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

export type EventCategory = "concert" | "sports" | "conference" | "theatre" | "festival";

export interface EventImage {
  url: string;
  public_id: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  venue: string;
  city: string;
  eventDate: string;
  bannerImage?: EventImage;
  bannerColor?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  lowestPrice?: number;
  listingCount?: number;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  verified?: boolean;
  trustScore?: number;
  salesCompleted?: number;
}

export interface TicketListing {
  id: string;
  eventId: string;
  event?: EventItem;
  seller: Seller;
  section: string;
  seatInfo: string;
  price: number;
  faceValue: number;
  quantity: number;
  proofImage?: EventImage;
  status: ListingStatus;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  ticketListing: {
    id: string;
    section: string;
    seatInfo: string;
    price?: number;
  } | null;
  buyer: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
  amount: number;
  platformFee: number;
  status: OrderStatus;
  escrowStatus: "held" | "released" | "refunded";
  stripePaymentIntentId?: string | null;
  createdAt: string;
}

export interface TicketTransfer {
  id: string;
  orderId: string;
  token: string;
  qrCodeImage: EventImage;
  transferredAt: string;
  confirmedByBuyer: boolean;
  confirmedAt?: string | null;
  isUsed: boolean;
}

export interface PaginatedResult<T> {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  items: T[];
}
