"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-forest-dark to-forest-light flex flex-col items-center justify-center px-6 py-20">
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center mb-12"
      >
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white tracking-wider mb-3">
          TRÜ
        </h1>
        <p className="text-copper-light text-lg font-sans font-medium tracking-wide">
          Experience a TRÜ Event
        </p>
        <p className="text-white/60 text-sm font-sans mt-2 max-w-md mx-auto">
          Walk through the complete event experience — from host controls to attendee view — with zero setup.
        </p>
      </motion.div>

      {/* Full Demo CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-2xl w-full mb-6"
      >
        <Link href="/demo/apply" className="group block">
          <div className="bg-gradient-to-r from-copper to-copper-dark rounded-2xl p-8 border border-copper/30 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-semibold text-white mb-1">
                  Start the Full Demo
                </h2>
                <p className="text-white/80 text-sm font-sans leading-relaxed">
                  Experience the complete journey — apply, browse your dashboard, RSVP to an event, and join live.
                </p>
              </div>
              <div className="text-white text-lg font-sans font-medium group-hover:translate-x-1 transition-transform flex-shrink-0">
                &rarr;
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Host & Attendee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Host card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/demo/host" className="group block">
            <div className="bg-gray-950 rounded-2xl p-8 border border-gray-800 hover:border-copper/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
              <div className="w-14 h-14 rounded-2xl bg-copper/15 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-white mb-2">
                I&apos;m the Host
              </h2>
              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                Control the event — check in attendees, advance phases, manage timers, and generate groups in real-time.
              </p>
              <div className="mt-6 text-copper text-sm font-sans font-medium group-hover:translate-x-1 transition-transform">
                Open Host Controls &rarr;
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Attendee card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/demo/attendee" className="group block">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-forest/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
              <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-dark mb-2">
                I&apos;m an Attendee
              </h2>
              <p className="text-muted text-sm font-sans leading-relaxed">
                See the live event as an attendee — watch phases update, view your groups, and discover matches.
              </p>
              <div className="mt-6 text-forest text-sm font-sans font-medium group-hover:translate-x-1 transition-transform">
                Open Attendee View &rarr;
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-white/40 text-xs font-sans text-center mt-10 max-w-sm"
      >
        Tip: For the host + attendee demo, open both in side-by-side windows.
      </motion.p>
    </div>
  );
}
