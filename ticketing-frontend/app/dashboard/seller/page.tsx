"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getMyOrders } from "@/lib/orders";
import { initiateTransfer, getTransferByOrder } from "@/lib/transfers";
import { useAuth } from "@/lib/AuthContext";
import { formatPKR, formatEventDate } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import RequireAuth from "@/components/RequireAuth";
import TransferModal from "@/components/TransferModal";
import { OrderItem, TicketTransfer } from "@/types";

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
  const [activeTab, setActiveTab] = useState<"listings" | "orders">("listings");
  
  const [listings, setListings] = useState<MyListing[]>([]);
  const [soldOrders, setSoldOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Transfer Modal State
  const [selectedTransfer, setSelectedTransfer] = useState<TicketTransfer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadData() {
    try {
      // Fetch seller's listings
      const { data: listingData } = await api.get("/listings");
      const mineListings: MyListing[] = (listingData.listings || [])
        .filter((l: any) => l.seller?._id === user?.id || l.seller?.id === user?.id)
        .map((l: any) => ({
          id: l._id || l.id,
          eventTitle: l.event?.title ?? "Event",
          section: l.section,
          seatInfo: l.seatInfo,
          price: l.price,
          quantity: l.quantity,
          status: l.status,
        }));
      setListings(mineListings);

      // Fetch seller's sold orders
      const allOrders = await getMyOrders();
      const mineOrders = allOrders.filter((o) => o.seller?.id === user?.id);
      setSoldOrders(mineOrders);
    } catch (err) {
      console.error("Failed to load seller dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function handleInitiateTransfer(orderId: string) {
    setActionLoadingId(orderId);
    try {
      const transfer = await initiateTransfer(orderId);
      setSelectedTransfer(transfer);
      setModalOpen(true);
      await loadData(); // Reload orders to update status to "transferred"
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to initiate transfer.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleViewTransfer(orderId: string) {
    setActionLoadingId(orderId);
    try {
      const transfer = await getTransferByOrder(orderId);
      if (transfer) {
        setSelectedTransfer(transfer);
        setModalOpen(true);
      } else {
        alert("Transfer pass not found.");
      }
    } catch (err) {
      alert("Failed to fetch transfer pass.");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
            Seller Dashboard
          </p>
          <h1 className="font-display font-bold text-3xl">Listings & Ticket Transfers</h1>
        </div>
        <Link
          href="/listings/create"
          className="text-sm font-semibold bg-ink text-paper rounded-lg px-4 py-2.5 hover:bg-stamp hover:text-ink transition-colors self-start sm:self-auto shadow-xs"
        >
          + Create New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-6 gap-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "listings"
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Active Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Sold Orders ({soldOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted text-sm flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          Loading dashboard data...
        </div>
      ) : activeTab === "listings" ? (
        /* Listings Tab */
        listings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-line rounded-xl p-8">
            <p className="font-display font-bold text-lg mb-1">No active listings</p>
            <p className="text-muted text-sm mb-4">You haven&apos;t listed any tickets yet.</p>
            <Link
              href="/listings/create"
              className="font-semibold bg-ink text-paper rounded-md px-5 py-2 text-sm hover:bg-stamp hover:text-ink transition-colors inline-block"
            >
              List a Ticket
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between border border-line rounded-xl bg-white p-4 shadow-xs"
              >
                <div>
                  <p className="font-display font-semibold text-lg">{l.eventTitle}</p>
                  <p className="text-sm text-muted">
                    {l.section} · {l.seatInfo} · Qty: {l.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-ink">{formatPKR(l.price)}</span>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Orders & Transfers Tab */
        soldOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-line rounded-xl p-8">
            <p className="font-display font-bold text-lg mb-1">No sales yet</p>
            <p className="text-muted text-sm">When buyers purchase your listings, orders will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {soldOrders.map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border border-line rounded-xl bg-white p-5 gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-lg">
                      {o.ticketListing?.section ?? "Sold Ticket"}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {o.ticketListing?.seatInfo} · Buyer: {o.buyer?.name} ({o.buyer?.email})
                  </p>
                  <p className="text-xs text-muted/70 mt-1 font-stub uppercase">
                    Ordered: {formatEventDate(o.createdAt)} · Escrow: {o.escrowStatus}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
                  <div className="text-right">
                    <span className="text-xs text-muted block">Payout</span>
                    <span className="font-bold text-lg text-verified">{formatPKR(o.amount)}</span>
                  </div>

                  {o.status === "paid" && (
                    <button
                      onClick={() => handleInitiateTransfer(o.id)}
                      disabled={actionLoadingId === o.id}
                      className="font-semibold text-xs bg-stamp text-ink rounded-lg px-4 py-2.5 hover:bg-amber-400 transition-colors shadow-xs"
                    >
                      {actionLoadingId === o.id ? "Initiating..." : "Initiate Ticket Transfer"}
                    </button>
                  )}

                  {(o.status === "transferred" || o.status === "completed") && (
                    <button
                      onClick={() => handleViewTransfer(o.id)}
                      disabled={actionLoadingId === o.id}
                      className="font-semibold text-xs bg-ink text-paper rounded-lg px-4 py-2.5 hover:bg-stamp hover:text-ink transition-colors shadow-xs"
                    >
                      {actionLoadingId === o.id ? "Loading..." : "View Generated Pass"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Transfer Pass Modal */}
      <TransferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transfer={selectedTransfer}
        isBuyer={false}
      />
    </div>
  );
}
