"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── FAQ data ──────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "What is TR\u00dc?",
    a: "TR\u00dc is a members-only social club where everyone happens to be single. We host curated events at Nashville\u2019s best venues. It\u2019s not a dating event \u2014 it\u2019s a great night out where meeting people feels natural.",
  },
  {
    q: "How is this different from a dating app?",
    a: "No swiping. No algorithms. No profiles to scroll through. You show up to an incredible event, meet real people in person, and use Double Take afterward to reconnect with anyone who caught your eye.",
  },
  {
    q: "What is Double Take?",
    a: "After each event, you can select up to 3 people you\u2019d like to see again. If someone you selected also selected you, chat unlocks for 7 days. Your selections are completely private \u2014 no one sees who you picked unless it\u2019s mutual.",
  },
  {
    q: "Who gets accepted?",
    a: "We review every application. We\u2019re looking for interesting, warm, accomplished people who want to meet other interesting people. We don\u2019t vet for pedigree \u2014 we vet for quality and intention.",
  },
  {
    q: "What\u2019s the gender ratio?",
    a: "We strive for a 50/50 ratio at every event and actively manage the guest list to keep it balanced.",
  },
  {
    q: "What should I wear?",
    a: "Each event has a dress code (smart casual, cocktail attire, etc.) communicated when you RSVP. Think: the kind of outfit you\u2019d wear to a nice dinner with friends.",
  },
  {
    q: "How much does it cost?",
    a: "Membership starts at $25/month. Individual event tickets range from $10\u2013$60 depending on the event and format. Founding members lock in their pricing forever.",
  },
  {
    q: "What cities are you in?",
    a: "We\u2019re launching in Nashville. Austin, Dallas, Miami, NYC, and LA are on the roadmap.",
  },
];

/* ── Fade-in-up wrapper ────────────────────────────────────────── */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Chevron icon ──────────────────────────────────────────────── */

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-shrink-0 text-gold"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5"
          >
            FAQ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight max-w-[18ch]"
          >
            Questions &amp; answers.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-white/40 text-base md:text-lg mt-5 max-w-lg"
          >
            Everything you need to know before you apply.
          </motion.p>
        </div>
      </section>

      {/* ═══ ACCORDION ═══ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="divide-y divide-white/[0.06]">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <FadeUp key={i} delay={i * 0.05}>
                  <div
                    className={`transition-all duration-300 ${
                      isOpen ? "border-l-2 border-l-gold pl-5 -ml-5" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center justify-between py-6 md:py-7 text-left cursor-pointer group"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`font-medium text-base md:text-lg pr-6 transition-colors duration-300 ${
                          isOpen
                            ? "text-white"
                            : "text-white/70 group-hover:text-white"
                        }`}
                      >
                        {faq.q}
                      </span>
                      <Chevron open={isOpen} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 md:pb-7 text-white/40 text-[15px] md:text-base leading-relaxed max-w-2xl">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase mb-6">
              Still curious?
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Let&apos;s talk.
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-3 max-w-md mx-auto">
              Reach out anytime. We&apos;ll get back within 24 hours.
            </p>
            <a
              href="mailto:hello@trudating.com"
              className="inline-block text-gold hover:text-gold/80 font-medium text-base transition-colors mb-10"
            >
              hello@trudating.com
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/apply"
                className="btn-shimmer inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
              >
                Apply to Join
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full text-white/80 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
              >
                Browse Events
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="h-8" />
    </>
  );
}
