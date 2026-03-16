"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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

/* ── Event formats ─────────────────────────────────────────────── */

const FORMATS = [
  {
    id: "rooftop-social",
    name: "Rooftop Social",
    desc: "Our flagship format. Drinks, conversation, and guided icebreakers on Nashville\u2019s best rooftops. Big enough to meet someone new, small enough that everyone matters.",
    guests: "40\u201360 guests",
    vibe: "Lively",
    dress: "Smart casual",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=85",
  },
  {
    id: "wine-night",
    name: "Wine Night",
    desc: "Intimate and curated. A sommelier-led tasting with structured conversation rounds. The kind of evening where you remember every name.",
    guests: "20 guests",
    vibe: "Intimate",
    dress: "Cocktail",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  },
  {
    id: "dinner-series",
    name: "Dinner Series",
    desc: "Long-table dining at premium restaurants. Chef\u2019s menu, assigned seating that rotates between courses. Our most exclusive format.",
    guests: "12 guests",
    vibe: "Exclusive",
    dress: "Cocktail attire",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  },
  {
    id: "coffee-hike",
    name: "Coffee + Hike",
    desc: "Start your morning with cold brew, fresh air, and rotating trail partners. The best conversations happen side by side, not across a table.",
    guests: "24 guests",
    vibe: "Active",
    dress: "Athleisure",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  },
];

/* ── Tag pill ──────────────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-white/[0.08] text-white/60 backdrop-blur-sm">
      {children}
    </span>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function EventsPage() {
  const featured = FORMATS.find((e) => e.featured)!;
  const secondary = FORMATS.filter((e) => !e.featured);

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5"
          >
            Events
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight max-w-[18ch]"
          >
            What to expect.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/40 text-base md:text-lg mt-5 max-w-lg"
          >
            Curated experiences at Nashville&apos;s best venues. Here are the formats we&apos;re planning for our founding members.
          </motion.p>
        </div>
      </section>

      {/* ═══ FEATURED FORMAT ═══ */}
      <section className="pb-6 md:pb-8">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9]">
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3">
                  {featured.name}
                </h2>
                <p className="text-white/50 text-sm md:text-base max-w-lg mb-4 leading-relaxed">
                  {featured.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tag>{featured.guests}</Tag>
                  <Tag>{featured.vibe}</Tag>
                  <Tag>{featured.dress}</Tag>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ SECONDARY FORMATS ═══ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {secondary.map((format, i) => (
              <FadeUp key={format.id} delay={i * 0.1}>
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4]">
                  <Image
                    src={format.image}
                    alt={format.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 370px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-2">
                      {format.name}
                    </h3>
                    <p className="text-white/45 text-[13px] leading-relaxed mb-3">
                      {format.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Tag>{format.guests}</Tag>
                      <Tag>{format.vibe}</Tag>
                      <Tag>{format.dress}</Tag>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW EVERY EVENT WORKS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-12 md:mb-16">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              Every event
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              What you can count on.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { title: "Balanced guest list", desc: "We manage the ratio and mix for every event. You\u2019ll be in a room of interesting, vetted people." },
              { title: "Guided icebreakers", desc: "No standing awkwardly with a drink. Every event has a format that makes it easy to meet everyone." },
              { title: "Beautiful venues", desc: "We partner with Nashville\u2019s best restaurants, rooftops, and private spaces. Every setting is intentional." },
              { title: "Double Take after", desc: "After the event, privately tell us who caught your eye. If it\u2019s mutual, we\u2019ll introduce you." },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8">
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm md:text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Want in?
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto">
              Our first events are launching soon. Apply now to be first in line.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
            >
              Apply to Join
            </Link>
          </FadeUp>
        </div>
      </section>

      <div className="h-8" />
    </>
  );
}
