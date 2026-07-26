import api from "./api";
import { TicketTransfer } from "@/types";

function mapTransfer(raw: any): TicketTransfer {
  return {
    id: raw._id || raw.id,
    orderId: typeof raw.order === "string" ? raw.order : (raw.order?._id || raw.order?.id),
    token: raw.token,
    qrCodeImage: {
      url: raw.qrCodeImage?.url || "",
      public_id: raw.qrCodeImage?.public_id || "",
    },
    transferredAt: raw.transferredAt || raw.createdAt,
    confirmedByBuyer: raw.confirmedByBuyer ?? false,
    confirmedAt: raw.confirmedAt || null,
    isUsed: raw.isUsed ?? false,
  };
}

export async function initiateTransfer(orderId: string): Promise<TicketTransfer> {
  const { data } = await api.post(`/transfers/${orderId}`);
  return mapTransfer(data.transfer);
}

export async function getTransferByOrder(orderId: string): Promise<TicketTransfer | null> {
  try {
    const { data } = await api.get(`/transfers/${orderId}`);
    if (!data.transfer) return null;
    return mapTransfer(data.transfer);
  } catch (error) {
    return null;
  }
}

export async function confirmTransfer(orderId: string): Promise<{
  message: string;
  transfer: TicketTransfer;
}> {
  const { data } = await api.patch(`/transfers/${orderId}/confirm`);
  return {
    message: data.message,
    transfer: mapTransfer(data.transfer),
  };
}

export async function validateTicket(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { data } = await api.post("/transfers/validate", { token });
  return {
    success: data.success,
    message: data.message,
  };
}
