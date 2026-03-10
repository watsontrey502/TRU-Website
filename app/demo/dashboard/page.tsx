"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEMO_EVENT, DEMO_USER, DEMO_MATCHES } from "@/lib/demo-data";

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Demo banner */}
      <div className="bg-forest/5 border-b border-forest/10 px-4 py-2 text-center">
        <p className="text-xs text-forest font-medium">
          Demo Mode — Lauren&apos;s dashboard after approval
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-semibold text-dark mb-2">
            Welcome back, {DEMO_USER.first_name}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted">Your TR{"\u00dc"} dashboard</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest/10 text-forest">
              approved
            </span>
          </div>
        </div>

        {/* Your Upcoming Events */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-dark mb-4">
            Your Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/demo/event">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              >
                <p className="text-xs text-copper font-medium uppercase tracking-wide mb-1">
                  {DEMO_EVENT.date} &middot; {DEMO_EVENT.time}
                </p>
                <h3 className="font-serif text-lg font-semibold text-dark mb-1">
                  {DEMO_EVENT.name}
                </h3>
                <p className="text-muted text-sm">{DEMO_EVENT.venue} &middot; {DEMO_EVENT.neighborhood}</p>
                <span className="inline-flex items-center mt-3 text-copper text-sm font-medium">
                  View Details &rarr;
                </span>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Recent Matches */}
        {DEMO_MATCHES.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-dark">
                Recent Matches
              </h2>
              <Link href="/demo/matches" className="text-copper text-sm font-medium hover:text-copper-dark transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_MATCHES.map((match) => (
                <div key={match.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] text-center">
                  <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-copper font-serif font-bold text-lg">
                      {match.first_name[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-dark text-sm">{match.first_name}</h3>
                  <p className="text-muted text-xs mt-1">{DEMO_EVENT.name}</p>
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-forest/10 text-forest">
                    It&apos;s mutual!
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}
