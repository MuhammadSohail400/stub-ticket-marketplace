import api from "./api";
import { OrderItem, PaginatedResult } from "@/types";

function mapOrder(raw: any): OrderItem {
  return {
    id: raw._id || raw.id,
    ticketListing: raw.ticketListing
      ? {
          id: raw.ticketListing._id || raw.ticketListing.id,
          section: raw.ticketListing.section,
          seatInfo: raw.ticketListing.seatInfo,
          price: raw.ticketListing.price,
        }
      : null,
    buyer: {
      id: raw.buyer?._id || raw.buyer?.id,
      name: raw.buyer?.name || "Buyer",
      email: raw.buyer?.email || "",
    },
    seller: {
      id: raw.seller?._id || raw.seller?.id,
      name: raw.seller?.name || "Seller",
      email: raw.seller?.email || "",
    },
    amount: raw.amount,
    platformFee: raw.platformFee,
    status: raw.status,
    escrowStatus: raw.escrowStatus,
    stripePaymentIntentId: raw.stripePaymentIntentId,
    createdAt: raw.createdAt,
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
}

export async function getMyOrders(filters?: OrderFilters): Promise<OrderItem[]> {
  const { data } = await api.get("/orders/mine", { params: filters });
  const rawList = Array.isArray(data.orders) ? data.orders : [];
  return rawList.map(mapOrder);
}

export async function getPaginatedMyOrders(
  filters?: OrderFilters
): Promise<PaginatedResult<OrderItem>> {
  const { data } = await api.get("/orders/mine", { params: filters });
  const rawList = Array.isArray(data.orders) ? data.orders : [];
  return {
    success: data.success ?? true,
    total: data.total ?? rawList.length,
    page: data.page ?? 1,
    pages: data.pages ?? 1,
    items: rawList.map(mapOrder),
  };
}

export async function getOrderById(id: string): Promise<OrderItem | null> {
  try {
    const { data } = await api.get(`/orders/${id}`);
    if (!data.order) return null;
    return mapOrder(data.order);
  } catch (error) {
    return null;
  }
}

export async function createOrder(ticketListingId: string): Promise<{
  order: OrderItem;
  clientSecret: string;
}> {
  const { data } = await api.post("/orders", { ticketListingId });
  return {
    order: mapOrder(data.order),
    clientSecret: data.clientSecret,
  };
}

export async function updateOrderStatus(id: string, status: string): Promise<OrderItem> {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return mapOrder(data.order);
}
