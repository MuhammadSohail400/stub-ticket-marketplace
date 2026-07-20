const Stripe = require("stripe");

// Concept: we initialize the Stripe client once here, using our secret
// key. This file is the ONLY place in the codebase that talks to the
// Stripe SDK directly — controllers call these functions, never
// `stripe.paymentIntents.create()` themselves. If we ever switch payment
// providers, only this file changes.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Concept: Stripe amounts are always in the SMALLEST currency unit —
// for PKR that's paisa (1 rupee = 100 paisa), same idea as cents for
// USD. If we passed `amount` directly as rupees, Stripe would interpret
// 6500 as "65.00" of whatever currency, undercharging by 100x. We
// multiply by 100 here so every caller can keep thinking in whole rupees.
async function createPaymentIntent(amountInRupees) {
  const amountInPaisa = Math.round(amountInRupees * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaisa,
    currency: "pkr",
    automatic_payment_methods: { enabled: true },
  });

  return paymentIntent;
}

// Concept: this verifies that a webhook request genuinely came from
// Stripe (not someone forging a POST request claiming "payment
// succeeded"). It uses the raw request body + the Stripe-Signature
// header + our webhook secret to recompute a signature and compare —
// this is why the webhook route needs the UNPARSED raw body, not JSON
// already parsed into an object.
function constructWebhookEvent(rawBody, signatureHeader) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signatureHeader,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

module.exports = { createPaymentIntent, constructWebhookEvent };