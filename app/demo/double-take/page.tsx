"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_ATTENDEES, DEMO_USER_ID, DEMO_EVENT } from "@/lib/demo-data";

const others = DEMO_ATTENDEES.filter((a) => a.id !== DEMO_USER_ID);

export default function DemoDoubleTakePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Post-submit confirmation
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pb-24">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-dark mb-2">Selections locked in!</h1>
          <p className="text-muted font-sans mb-6 max-w-xs mx-auto">
            We&apos;ll notify you when your matches are ready. Fingers crossed!
          </p>
          <motion.button
            onClick={() => router.push("/demo/matches")}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="inline-block px-8 py-3.5 rounded-xl bg-copper text-white font-sans font-semibold hover:bg-copper-dark transition-colors cursor-pointer shadow-lg shadow-copper/15"
          >
            View Your Matches
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 pb-32 px-6">
      <div className="max-w-2xl mx-auto pt-6">
        {/* Back button */}
        <Link href="/demo/event" className="inline-flex items-center gap-2 text-muted hover:text-dark text-sm font-medium transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-semibold text-dark mb-2">Double Take</h1>
          <p className="text-muted text-sm font-sans">
            Select anyone you&apos;d like to connect with. If they selected you too, it&apos;s a match!
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {others.map((a) => {
            const isSelected = selected.has(a.id);
            return (
              <motion.button
                key={a.id}
                onClick={() => toggle(a.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-copper bg-copper/5 shadow-md"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? "bg-copper text-white" : "bg-gray-100"
                }`}>
                  <span className={`font-serif font-bold text-xl ${
                    isSelected ? "text-white" : "text-gray-400"
                  }`}>
                    {a.first_name[0]}
                  </span>
                </div>
                <span className={`text-sm font-sans font-medium ${isSelected ? "text-dark" : "text-muted"}`}>
                  {a.first_name}
                </span>

                {/* Check mark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-copper flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sticky submit button — always visible */}
      <div className="fixed bottom-20 left-0 right-0 z-[60] p-4 bg-gradient-to-t from-cream via-cream to-cream/0 bottom-nav-safe">
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={handleSubmit}
            disabled={selected.size === 0}
            whileHover={selected.size > 0 ? { scale: 1.015 } : {}}
            whileTap={selected.size > 0 ? { scale: 0.985 } : {}}
            className={`w-full py-4 rounded-2xl font-sans font-semibold text-base tracking-wide transition-colors cursor-pointer ${
              selected.size > 0
                ? "bg-copper text-white hover:bg-copper-dark shadow-lg shadow-copper/20"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selected.size > 0
              ? `Lock in ${selected.size} selection${selected.size > 1 ? "s" : ""}`
              : "Select someone to continue"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
