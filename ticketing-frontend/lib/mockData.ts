import { TicketListing } from "@/types";
export { formatPKR, formatEventDate } from "./utils";

/**
 * Legacy mock listings file retained for fallback testing.
 * All live components now interact with the real backend API services in lib/events.ts, lib/listings.ts, lib/orders.ts, and lib/transfers.ts.
 */

export const listings: TicketListing[] = [
  {
    id: "lst-001",
    eventId: "evt-atif-karachi",
    seller: { id: "u1", name: "Hassan R.", verified: true, trustScore: 4.8, salesCompleted: 23 },
    section: "Gold Enclosure",
    seatInfo: "Row C, Seats 12-13",
    price: 6500,
    faceValue: 6000,
    quantity: 2,
    status: "listed",
  },
  {
    id: "lst-002",
    eventId: "evt-atif-karachi",
    seller: { id: "u2", name: "Ayesha K.", verified: true, trustScore: 4.5, salesCompleted: 11 },
    section: "Silver Standing",
    seatInfo: "General Admission",
    price: 4500,
    faceValue: 4500,
    quantity: 1,
    status: "listed",
  },
];

export function getListingsForEvent(eventId: string): TicketListing[] {
  return listings.filter((l) => l.eventId === eventId);
}

export function getListingById(id: string): TicketListing | undefined {
  return listings.find((l) => l.id === id);
}
