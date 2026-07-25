"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Concept: these can briefly be null while Stripe.js is still
    // loading in the background — guard against submitting too early.
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    // Concept: confirmPayment() is where the actual charge attempt
    // happens — Stripe.js reads the card details the user typed into
    // <PaymentElement>, sends them directly to Stripe (never touching
    // our server), and attempts to complete the Payment Intent we
    // created back in POST /api/orders. On success, Stripe redirects
    // the browser to return_url — our webhook (Phase B6) is what
    // actually flips the order to "paid" on the backend, independent
    // of this redirect.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/buyer`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
    // No `else` needed — a successful confirmPayment() navigates the
    // browser away via return_url, so there's nothing further to do here.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
      <PaymentElement />

      {error && (
        <div className="rounded-md bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50"
      >
        {processing ? "Processing..." : "Confirm payment"}
      </button>
    </form>
  );
}
