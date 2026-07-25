"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { createListing } from "@/lib/listings";
import { EventItem } from "@/types";
import RequireAuth from "@/components/RequireAuth";

export default function CreateListingPage() {
  return (
    <RequireAuth requireRole="seller">
      <CreateListingForm />
    </RequireAuth>
  );
}

function CreateListingForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await api.get("/events");
        const mapped: EventItem[] = data.events.map((e: any) => ({
          id: e._id,
          title: e.title,
          category: e.category,
          venue: e.venue,
          city: e.city,
          eventDate: e.eventDate,
          bannerColor: "#14213D",
        }));
        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  // Concept: instead of tracking every field in separate useState
  // variables, we read all of them at once from the submitted <form>
  // element using the browser's built-in FormData API — it collects
  // every input by its `name` attribute automatically, including the
  // file input, which is exactly the shape our backend's multer
  // middleware expects (multipart/form-data).
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createListing(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <span className="stamp inline-block text-verified border-2 border-verified rounded px-4 py-2 font-bold text-lg mb-6">
          LISTED
        </span>
        <h1 className="font-display font-bold text-2xl mb-2">Your ticket is live</h1>
        <p className="text-muted text-sm mb-6">
          Buyers can now find it on the event page. You'll be notified the moment someone
          purchases it — funds stay in escrow until you transfer the ticket.
        </p>
        <button
          onClick={() => router.push("/dashboard/seller")}
          className="font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors"
        >
          Go to my listings
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
        Sell a ticket
      </p>
      <h1 className="font-display font-bold text-3xl mb-8">List your ticket for resale</h1>

      {error && (
        <div className="mb-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Field label="Event">
          <select name="event" required className="input" disabled={loadingEvents}>
            <option value="">
              {loadingEvents ? "Loading events..." : "Select an event"}
            </option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} — {e.city}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Section">
            <input
              name="section"
              required
              type="text"
              placeholder="e.g. Gold Enclosure"
              className="input"
            />
          </Field>
          <Field label="Seat info">
            <input
              name="seatInfo"
              required
              type="text"
              placeholder="e.g. Row C, Seat 12"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Face value (Rs)">
            <input
              name="faceValue"
              required
              type="number"
              min={0}
              placeholder="6000"
              className="input"
            />
          </Field>
          <Field label="Asking price (Rs)">
            <input
              name="price"
              required
              type="number"
              min={0}
              placeholder="6500"
              className="input"
            />
          </Field>
        </div>

        <Field label="Quantity">
          <input
            name="quantity"
            required
            type="number"
            min={1}
            defaultValue={1}
            className="input"
          />
        </Field>

        <Field label="Proof of ticket">
          <input
            name="proofImage"
            required
            type="file"
            accept="image/*"
            className="input"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors disabled:opacity-50"
        >
          {submitting ? "Listing..." : "List ticket"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-stub uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
