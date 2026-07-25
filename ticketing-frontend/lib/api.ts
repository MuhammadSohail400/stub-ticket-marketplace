import axios from "axios";

// Concept: NEXT_PUBLIC_ prefix is required for any env var that needs to
// be readable in the BROWSER (client components), not just on the
// server. Server Components could read a non-prefixed var too, but
// since Phase F2 (auth) and F5 (Stripe) will need this same api client
// from client components, we use NEXT_PUBLIC_ from the start for
// consistency — one api instance, usable everywhere in the app.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Concept: this interceptor runs before EVERY request this instance
// makes. Instead of manually adding `Authorization: Bearer <token>` to
// every single api.post()/api.get() call across the whole app, we do it
// once, here — any component that needs an authenticated request just
// uses `api` normally and this handles the header automatically.
//
// The `typeof window` check matters because this same `api` instance is
// also used from Server Components (e.g. lib/events.ts, called during
// server-side rendering) — localStorage doesn't exist there, so we skip
// attaching a token in that context (those are public GET requests anyway).
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
