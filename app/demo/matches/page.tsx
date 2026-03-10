"use client";

import { motion } from "framer-motion";
import { DEMO_MATCHES, DEMO_EVENT } from "@/lib/demo-data";

export default function DemoMatchesPage() {
  return (
    <div className="min-h-screen pt-14 pb-24 px-6">
      <div className="max-w-2xl mx-auto pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl font-semibold text-dark mb-2">Your Matches</h1>
          <p className="text-muted text-sm font-sans">
            {DEMO_MATCHES.length} mutual {DEMO_MATCHES.length === 1 ? "connection" : "connections"}
          </p>
        </motion.div>

        {/* Grouped by event */}
        {DEMO_MATCHES.length > 0 ? (
          <section>
            {/* Event group header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-2 mb-4"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide font-sans">
                {DEMO_EVENT.name}
              </h2>
            </motion.div>

            {/* Match cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_MATCHES.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] text-center">
                    <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-copper font-serif font-bold text-lg">
                        {match.first_name[0]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-dark text-sm">{match.first_name}</h3>
                    <p className="text-copper text-sm font-sans font-medium mt-1">
                      @{match.instagram.replace("@", "")}
                    </p>
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-forest/10 text-forest">
                      It&apos;s mutual!
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-10 border border-gray-100 shadow-[var(--shadow-card)] text-center"
          >
            <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-semibold text-dark mb-2">No matches yet</h2>
            <p className="text-muted text-sm font-sans max-w-xs mx-auto">
              After completing Double Take at an event, your mutual connections will appear here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
