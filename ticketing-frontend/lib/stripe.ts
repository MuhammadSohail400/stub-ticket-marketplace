import { loadStripe, Stripe } from "@stripe/stripe-js";

// Concept: loadStripe() should only ever be called ONCE per publishable
// key — calling it repeatedly (e.g. inside a component that re-renders)
// creates redundant script loads. We create the promise once here, at
// module scope, and every component that needs it imports this same
// cached promise.
let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
  }
  return stripePromise;
}
