"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import api from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutClient({
  listingId,
  totalDisplay,
}: {
  listingId: string;
  totalDisplay: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Concept: we don't create the order automatically on page load —
  // only when the buyer explicitly clicks "Pay." This matters because
  // creating an order has a real side-effect (it reserves the listing,
  // see Phase B5) — we don't want that happening just because someone
  // viewed the checkout page and left.
  async function startCheckout() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/orders", { ticketListingId: listingId });
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  }

  // Concept: <Elements> is a Context Provider (same pattern as our own
  // AuthContext) — it must wrap <CheckoutForm> so that useStripe()/
  // useElements() inside it can access the Stripe instance and this
  // specific clientSecret. It only mounts once we actually have a
  // clientSecret from the backend.
  if (clientSecret) {
    return (
      <Elements stripe={getStripe()} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}
      <button
        onClick={startCheckout}
        disabled={loading}
        className="mt-6 w-full font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50"
      >
        {loading ? "Starting checkout..." : `Pay ${totalDisplay} with Stripe`}
      </button>
    </div>
  );
}
