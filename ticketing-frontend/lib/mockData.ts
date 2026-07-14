import { EventItem, TicketListing } from "@/types";

// NOTE: This file simulates what /api/events and /api/listings will return
// once the Express + MongoDB backend is built in Phase 2. Swap the getters
// below for real axios calls without changing any component code.

export const events: EventItem[] = [
  {
    id: "evt-atif-karachi",
    title: "Atif Aslam — Live in Concert",
    category: "concert",
    venue: "Expo Centre",
    city: "Karachi",
    eventDate: "2026-09-12T19:00:00+05:00",
    bannerColor: "#14213D",
    lowestPrice: 4500,
    listingCount: 14,
  },
  {
    id: "evt-psl-final",
    title: "PSL Final 2026",
    category: "sports",
    venue: "National Stadium",
    city: "Karachi",
    eventDate: "2026-06-21T18:00:00+05:00",
    bannerColor: "#2F6B4F",
    lowestPrice: 3000,
    listingCount: 27,
  },
  {
    id: "evt-tech-summit",
    title: "Karachi Tech Summit",
    category: "conference",
    venue: "Pearl Continental",
    city: "Karachi",
    eventDate: "2026-08-03T09:00:00+05:00",
    bannerColor: "#E8A33D",
    lowestPrice: 2000,
    listingCount: 6,
  },
  {
    id: "evt-coke-fest",
    title: "Coke Studio Fest",
    category: "festival",
    venue: "Beach Luxury Grounds",
    city: "Karachi",
    eventDate: "2026-10-05T17:00:00+05:00",
    bannerColor: "#C1443C",
    lowestPrice: 3500,
    listingCount: 19,
  },
  {
    id: "evt-ali-sethi",
    title: "Ali Sethi — Acoustic Night",
    category: "concert",
    venue: "Arts Council",
    city: "Lahore",
    eventDate: "2026-09-28T20:00:00+05:00",
    bannerColor: "#14213D",
    lowestPrice: 2800,
    listingCount: 9,
  },
  {
    id: "evt-startup-conf",
    title: "Startup Founders Conference",
    category: "conference",
    venue: "Alhamra Arts Centre",
    city: "Lahore",
    eventDate: "2026-07-30T10:00:00+05:00",
    bannerColor: "#E8A33D",
    lowestPrice: 1500,
    listingCount: 4,
  },
];

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

export function getEventById(id: string): EventItem | undefined {
  return events.find((e) => e.id === id);
}

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
