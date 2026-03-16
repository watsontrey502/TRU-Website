"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

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

/* ── Parallax image section ────────────────────────────────────── */

function ParallaxImage({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section ref={ref} className="relative h-[50vh] md:h-[65vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      {children}
    </section>
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
    price: "From $50",
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
    price: "From $55",
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
    price: "From $85",
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
    price: "From $30",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  },
];

/* ── Tag pill ──────────────────────────────────────────────────── */

function Tag({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide backdrop-blur-sm ${
        gold
          ? "bg-gold/15 text-gold"
          : "bg-white/[0.08] text-white/60"
      }`}
    >
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5"
          >
            Events
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight max-w-[18ch]"
          >
            What to expect.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
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
            <motion.div
              whileHover="hover"
              className="relative rounded-3xl overflow-hidden aspect-[3/4] md:aspect-[16/9] cursor-default group"
            >
              {/* Ken Burns zoom */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 20, ease: "linear" }}
                variants={{ hover: { scale: 1.08 } }}
              >
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1152px"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-10">
                <h2 className="font-serif text-xl md:text-5xl font-bold text-white mb-2 md:mb-3">
                  {featured.name}
                </h2>
                <p className="text-white/45 text-[13px] md:text-base leading-relaxed mb-3 md:mb-4 max-w-lg line-clamp-3 md:line-clamp-none">
                  {featured.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <Tag gold>{featured.price}</Tag>
                  <Tag>{featured.guests}</Tag>
                  <Tag>{featured.vibe}</Tag>
                  <Tag>{featured.dress}</Tag>
                </div>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ SECONDARY FORMATS ═══ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {secondary.map((format, i) => (
              <FadeUp key={format.id} delay={i * 0.1}>
                <motion.div
                  whileHover="hover"
                  className="relative rounded-3xl overflow-hidden aspect-[3/4] cursor-default group"
                >
                  <motion.div
                    className="absolute inset-0"
                    variants={{
                      hover: { scale: 1.05 },
                    }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Image
                      src={format.image}
                      alt={format.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 370px"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-2">
                      {format.name}
                    </h3>
                    <p className="text-white/45 text-[13px] leading-relaxed mb-3">
                      {format.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Tag gold>{format.price}</Tag>
                      <Tag>{format.guests}</Tag>
                      <Tag>{format.vibe}</Tag>
                      <Tag>{format.dress}</Tag>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <ParallaxImage
        src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1400&q=85"
        alt="Candlelit evening at a Nashville venue"
      >
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-6xl mx-auto px-6 md:px-8 pb-14 md:pb-20">
          <FadeUp>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-0.5 bg-gradient-to-r from-gold to-sand mb-5"
            />
            <p className="font-serif text-2xl md:text-4xl font-bold text-white leading-snug max-w-md">
              Every detail is intentional.
            </p>
          </FadeUp>
        </div>
      </ParallaxImage>

      {/* ═══ HOW EVERY EVENT WORKS ═══ */}
      <section className="py-24 md:py-36">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-14 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              Every event
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              What you can count on.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              {
                icon: "\u2726",
                title: "Balanced guest list",
                desc: "We manage the ratio and mix for every event. You\u2019ll be in a room of interesting, vetted people.",
              },
              {
                icon: "\u2726",
                title: "Guided icebreakers",
                desc: "No standing awkwardly with a drink. Every event has a format that makes it easy to meet everyone.",
              },
              {
                icon: "\u2726",
                title: "Beautiful venues",
                desc: "We partner with Nashville\u2019s best restaurants, rooftops, and private spaces. Every setting is intentional.",
              },
              {
                icon: "\u2726",
                title: "Double Take after",
                desc: "After the event, privately tell us who caught your eye. If it\u2019s mutual, we\u2019ll introduce you.",
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: "rgba(200,169,126,0.25)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 cursor-default"
                >
                  <span className="text-gold text-lg mb-3 block">{item.icon}</span>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm md:text-[15px] leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase mb-6">
              Now accepting applications
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Want in?
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto">
              Our first events are launching soon. Apply now to be first in line.
            </p>
            <Link
              href="/apply"
              className="btn-shimmer inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
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
