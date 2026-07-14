"use client";

import { useState } from "react";
import { events } from "@/lib/mockData";

export default function CreateListingPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <span className="stamp inline-block text-verified border-2 border-verified rounded px-4 py-2 font-bold text-lg mb-6">
          LISTED
        </span>
        <h1 className="font-display font-bold text-2xl mb-2">Your ticket is live</h1>
        <p className="text-muted text-sm">
          Buyers can now find it on the event page. You'll be notified the moment someone
          purchases it — funds stay in escrow until you transfer the ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-stub uppercase tracking-widest text-muted mb-2">
        Sell a ticket
      </p>
      <h1 className="font-display font-bold text-3xl mb-8">List your ticket for resale</h1>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Field label="Event">
          <select required className="input">
            <option value="">Select an event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} — {e.city}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Section">
            <input required type="text" placeholder="e.g. Gold Enclosure" className="input" />
          </Field>
          <Field label="Seat info">
            <input required type="text" placeholder="e.g. Row C, Seat 12" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Face value (Rs)">
            <input required type="number" min={0} placeholder="6000" className="input" />
          </Field>
          <Field label="Asking price (Rs)">
            <input required type="number" min={0} placeholder="6500" className="input" />
          </Field>
        </div>

        <Field label="Quantity">
          <input required type="number" min={1} defaultValue={1} className="input" />
        </Field>

        <Field label="Proof of ticket">
          <div className="border border-dashed border-line rounded-md px-4 py-8 text-center text-sm text-muted">
            Upload a screenshot or PDF of your original ticket
            <br />
            <span className="text-xs">(wired up once file storage is added in Phase 2)</span>
          </div>
        </Field>

        <button
          type="submit"
          className="mt-2 font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors"
        >
          List ticket
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
