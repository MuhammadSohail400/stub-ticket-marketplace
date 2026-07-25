"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { formatPKR } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import RequireAuth from "@/components/RequireAuth";

interface MyListing {
  id: string;
  eventTitle: string;
  section: string;
  seatInfo: string;
  price: number;
  quantity: number;
  status: string;
}

export default function SellerDashboardPage() {
  return (
    <RequireAuth requireRole="seller">
      <SellerDashboard />
    </RequireAuth>
  );
}

function SellerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Concept: the backend's GET /api/listings has no "only mine" filter
  // parameter — it's a public browse endpoint. So we fetch everything
  // and filter client-side by matching seller._id to the logged-in
  // user. This is fine at this project's scale; a production app with
  // thousands of listings would add a proper backend filter instead of
  // shipping every listing to every seller's browser.
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/listings");
        const mine: MyListing[] = data.listings
          .filter((l: any) => l.seller?._id === user?.id)
          .map((l: any) => ({
            id: l._id,
            eventTitle: l.event?.title ?? "Unknown event",
            section: l.section,
            seatInfo: l.seatInfo,
            price: l.price,
            quantity: l.quantity,
            status: l.status,
          }));
        setListings(mine);
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
            Dashboard
          </p>
          <h1 className="font-display font-bold text-3xl">My listings</h1>
        </div>
        <Link
          href="/listings/create"
          className="text-sm font-semibold bg-ink text-paper rounded-md px-4 py-2 hover:bg-stamp hover:text-ink transition-colors"
        >
          + New listing
        </Link>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted text-sm">You haven&apos;t listed any tickets yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between border border-line rounded-lg bg-white p-4"
            >
              <div>
                <p className="font-display font-semibold">{l.eventTitle}</p>
                <p className="text-sm text-muted">
                  {l.section} · {l.seatInfo} · Qty {l.quantity}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatPKR(l.price)}</span>
                <StatusBadge status={l.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
