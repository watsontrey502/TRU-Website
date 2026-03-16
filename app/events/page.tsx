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

/* ── Event data ────────────────────────────────────────────────── */

const EVENTS = [
  {
    id: "rooftop-social",
    name: "Rooftop Social",
    venue: "L.A. Jackson",
    date: "Coming soon",
    time: "7 PM",
    guests: "40 guests",
    detail: "50/50",
    dress: "Smart casual",
    spotsLeft: null,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=85",
  },
  {
    id: "wine-night",
    name: "Wine Night",
    venue: "Bastion",
    date: "Coming soon",
    time: "8 PM",
    guests: "20 guests",
    detail: "Intimate",
    dress: null,
    spotsLeft: null,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  },
  {
    id: "dinner-series",
    name: "Dinner Series",
    venue: "Henrietta Red",
    date: "Coming soon",
    time: "7:30 PM",
    guests: "12 guests",
    detail: "Long table",
    dress: "Premium ($120)",
    spotsLeft: null,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  },
  {
    id: "coffee-hike",
    name: "Coffee + Hike",
    venue: "Radnor Lake",
    date: "Coming soon",
    time: "8:30 AM",
    guests: "24 guests",
    detail: "Athleisure",
    dress: null,
    spotsLeft: null,
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
  const featured = EVENTS.find((e) => e.featured)!;
  const secondary = EVENTS.filter((e) => !e.featured);

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
            Upcoming
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight max-w-[18ch]"
          >
            What&apos;s coming up.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/40 text-base md:text-lg mt-5 max-w-lg"
          >
            Join the waitlist to get early access when tickets drop.
          </motion.p>
        </div>
      </section>

      {/* ═══ FEATURED EVENT ═══ */}
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
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                  {featured.name}
                </h2>

                <div className="flex flex-wrap gap-2">
                  <Tag>{featured.venue}</Tag>
                  <Tag>{featured.date}</Tag>
                  <Tag>{featured.time}</Tag>
                  <Tag>{featured.guests}</Tag>
                  <Tag>{featured.detail}</Tag>
                  {featured.dress && <Tag>{featured.dress}</Tag>}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ SECONDARY EVENTS ═══ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {secondary.map((event, i) => (
              <FadeUp key={event.id} delay={i * 0.1}>
                <div className="relative rounded-3xl overflow-hidden aspect-[5/2]">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 560px"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-3">
                      {event.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <Tag>{event.venue}</Tag>
                      <Tag>{event.date}</Tag>
                      <Tag>{event.time}</Tag>
                      <Tag>{event.guests}</Tag>
                      <Tag>{event.detail}</Tag>
                      {event.dress && <Tag>{event.dress}</Tag>}
                    </div>
                  </div>
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
              Events are members-only. Apply to join the waitlist.
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

      {/* Spacing before footer */}
      <div className="h-8" />
    </>
  );
}
