import api from "./api";
import { OrderItem } from "@/types";

function mapOrder(raw: any): OrderItem {
  return {
    id: raw._id,
    ticketListing: raw.ticketListing
      ? {
          id: raw.ticketListing._id,
          section: raw.ticketListing.section,
          seatInfo: raw.ticketListing.seatInfo,
        }
      : null,
    buyer: {
      id: raw.buyer?._id,
      name: raw.buyer?.name,
      email: raw.buyer?.email,
    },
    seller: {
      id: raw.seller?._id,
      name: raw.seller?.name,
      email: raw.seller?.email,
    },
    amount: raw.amount,
    platformFee: raw.platformFee,
    status: raw.status,
    escrowStatus: raw.escrowStatus,
    createdAt: raw.createdAt,
  };
}

// Concept: GET /api/orders/mine returns every order where the logged-in
// user is EITHER the buyer or the seller — the two dashboards below
// each filter this same result down to their specific side of the deal.
export async function getMyOrders(): Promise<OrderItem[]> {
  const { data } = await api.get("/orders/mine");
  return data.orders.map(mapOrder);
}
