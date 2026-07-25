"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/lib/orders";
import { useAuth } from "@/lib/AuthContext";
import { formatPKR } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import RequireAuth from "@/components/RequireAuth";
import { OrderItem } from "@/types";

// Concept: this page is a Client Component (not async, uses useEffect)
// because it needs the JWT from localStorage to make an authenticated
// request — that's only available in the browser, not during
// server-side rendering. Compare this to app/events/page.tsx, which
// stays a Server Component because browsing events needs no auth.
export default function BuyerDashboardPage() {
  return (
    <RequireAuth>
      <BuyerDashboard />
    </RequireAuth>
  );
}

function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getMyOrders();
        // Concept: /orders/mine returns orders where you're EITHER
        // buyer or seller — this page only cares about the ones where
        // the logged-in user is the buyer (their purchases).
        setOrders(all.filter((o) => o.buyer.id === user?.id));
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
        Dashboard
      </p>
      <h1 className="font-display font-bold text-3xl mb-8">My orders</h1>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted text-sm">You haven&apos;t bought any tickets yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border border-line rounded-lg bg-white p-4"
            >
              <div>
                <p className="font-display font-semibold">
                  {o.ticketListing?.section ?? "Listing no longer available"}
                </p>
                <p className="text-sm text-muted">{o.ticketListing?.seatInfo}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatPKR(o.amount)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
