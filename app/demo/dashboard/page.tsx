"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEMO_EVENT, DEMO_USER, DEMO_MATCHES } from "@/lib/demo-data";

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Demo banner */}
      <div className="bg-black/5 border-b border-black/10 px-4 py-2 text-center">
        <p className="text-xs text-black font-medium">
          Demo Mode — Lauren&apos;s dashboard after approval
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-semibold text-black mb-2">
            Welcome back, {DEMO_USER.first_name}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-stone">Your TR{"\u00dc"} dashboard</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/10 text-black">
              approved
            </span>
          </div>
        </div>

        {/* Your Upcoming Events */}
        <section className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-black mb-4">
            Your Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/demo/event">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              >
                <p className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
                  {DEMO_EVENT.date} &middot; {DEMO_EVENT.time}
                </p>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">
                  {DEMO_EVENT.name}
                </h3>
                <p className="text-stone text-sm">{DEMO_EVENT.venue} &middot; {DEMO_EVENT.neighborhood}</p>
                <span className="inline-flex items-center mt-3 text-gold text-sm font-medium">
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
              <h2 className="font-serif text-xl font-semibold text-black">
                Recent Matches
              </h2>
              <Link href="/demo/matches" className="text-gold text-sm font-medium hover:text-gold transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_MATCHES.map((match) => (
                <div key={match.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-gold font-serif font-bold text-lg">
                      {match.first_name[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-black text-sm">{match.first_name}</h3>
                  <p className="text-stone text-xs mt-1">{DEMO_EVENT.name}</p>
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/10 text-black">
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
