import { TicketListing } from "@/types";

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
  {
    id: "lst-003",
    eventId: "evt-atif-karachi",
    seller: { id: "u3", name: "Bilal M.", verified: false, trustScore: 3.9, salesCompleted: 2 },
    section: "Gold Enclosure",
    seatInfo: "Row F, Seat 4",
    price: 7000,
    faceValue: 6000,
    quantity: 1,
    status: "reserved",
  },
  {
    id: "lst-004",
    eventId: "evt-psl-final",
    seller: { id: "u4", name: "Sara N.", verified: true, trustScore: 5.0, salesCompleted: 41 },
    section: "Premium Stand",
    seatInfo: "Block D, Row 2",
    price: 5500,
    faceValue: 5000,
    quantity: 4,
    status: "listed",
  },
  {
    id: "lst-005",
    eventId: "evt-psl-final",
    seller: { id: "u5", name: "Usman T.", verified: true, trustScore: 4.2, salesCompleted: 8 },
    section: "General Stand",
    seatInfo: "Block A",
    price: 3000,
    faceValue: 3000,
    quantity: 2,
    status: "listed",
  },
  {
    id: "lst-006",
    eventId: "evt-coke-fest",
    seller: { id: "u6", name: "Zara F.", verified: true, trustScore: 4.6, salesCompleted: 15 },
    section: "VIP Deck",
    seatInfo: "Standing, VIP zone",
    price: 5200,
    faceValue: 4000,
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

export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}