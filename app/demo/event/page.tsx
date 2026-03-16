"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEMO_EVENT, DEMO_ATTENDEES } from "@/lib/demo-data";

const RSVP_KEY = "tru-demo-rsvp";

export default function DemoEventPage() {
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    try {
      setAttending(sessionStorage.getItem(RSVP_KEY) === "true");
    } catch { /* noop */ }
  }, []);

  const handleRSVP = () => {
    try { sessionStorage.setItem(RSVP_KEY, "true"); } catch { /* noop */ }
    setAttending(true);
  };

  const attendeePreview = DEMO_ATTENDEES.slice(0, 3).map((a) => a.first_name);
  const otherCount = DEMO_ATTENDEES.length - attendeePreview.length;

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Demo banner */}
      <div className="bg-black/5 border-b border-black/10 px-4 py-2 text-center">
        <p className="text-xs text-black font-medium">
          Demo Mode — Event detail page
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link href="/demo/dashboard" className="inline-flex items-center gap-2 text-stone hover:text-black text-sm font-medium transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
          {/* Event header */}
          <div className="bg-black p-6">
            <p className="text-sand text-xs uppercase tracking-[0.15em] font-medium mb-2">
              {DEMO_EVENT.date} &middot; {DEMO_EVENT.time}
            </p>
            <h1 className="font-serif text-3xl font-semibold text-white mb-2">
              {DEMO_EVENT.name}
            </h1>
            <p className="text-white/70 text-sm">
              {DEMO_EVENT.venue} &middot; {DEMO_EVENT.neighborhood}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Price", value: `$${DEMO_EVENT.price}` },
                { label: "Age Range", value: DEMO_EVENT.age_range },
                { label: "Dress Code", value: DEMO_EVENT.dress_code },
                { label: "Attending", value: `${DEMO_ATTENDEES.length} people` },
              ].map((item) => (
                <div key={item.label} className="bg-cream rounded-xl p-4 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-stone mb-1">{item.label}</p>
                  <p className="font-semibold text-black text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {DEMO_EVENT.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-black mb-3">About</h2>
                <p className="text-stone leading-relaxed">{DEMO_EVENT.description}</p>
              </div>
            )}

            {/* Attendee preview */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-black mb-3">Who&apos;s Going</h2>
              <p className="text-stone text-sm">
                {attendeePreview.join(", ")}
                {otherCount > 0 && `, and ${otherCount} other${otherCount > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!attending ? (
                <motion.button
                  onClick={handleRSVP}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="flex-1 py-4 rounded-xl bg-gold text-white font-semibold text-base tracking-wide transition-colors hover:bg-gold cursor-pointer shadow-lg shadow-gold/15"
                >
                  RSVP &mdash; ${DEMO_EVENT.price}
                </motion.button>
              ) : (
                <>
                  <div className="flex-1 py-4 rounded-xl bg-black/5 border border-black/20 text-black font-semibold text-base text-center">
                    You&apos;re attending
                  </div>
                  <Link
                    href="/demo/attendee"
                    className="flex-1 py-4 rounded-xl bg-black text-white font-semibold text-base text-center tracking-wide hover:bg-black/90 transition-colors shadow-lg shadow-black/15 animate-pulse"
                  >
                    Join Live Event
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
