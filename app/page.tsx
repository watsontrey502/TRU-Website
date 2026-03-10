"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Button from "@/components/Button";
import { eventTypes, testimonials, pressLogos } from "@/lib/constants";

/* ── Animated counter ──────────────────────────────────────────── */

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate(count, target, { duration: 2, ease: "easeOut" });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, target, hasAnimated]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`;
    });
    return unsub;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

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

/* ── Section wrapper ───────────────────────────────────────────── */

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-32 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">{children}</div>
    </section>
  );
}

/* ── Section heading ───────────────────────────────────────────── */

function Heading({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <FadeUp className="text-center mb-16 md:mb-20">
      <h2
        className={`font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-5 leading-tight ${
          light ? "text-white" : "text-dark"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${light ? "text-white/70" : "text-muted"}`}>
          {subtitle}
        </p>
      )}
      <div className={`w-16 h-0.5 mx-auto mt-8 ${light ? "bg-copper-light" : "bg-copper"}`} />
    </FadeUp>
  );
}

/* ── SVG Icons ─────────────────────────────────────────────────── */

function KeyIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="text-copper">
      <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M22 12a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4Zm0 18c-4.42 0-8-1.79-8-4v-2c0-2.21 3.58-4 8-4s8 1.79 8 4v2c0 2.21-3.58 4-8 4Z" fill="currentColor" />
    </svg>
  );
}

function GlassIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="text-copper">
      <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M15 12h14l-3 12h-8l-3-12Zm4 12v8m-3 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="text-copper">
      <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M22 13l2.5 5.5L30 21l-5.5 2.5L22 29l-2.5-5.5L14 21l5.5-2.5L22 13Z" fill="currentColor" />
    </svg>
  );
}

/* ── Testimonial Carousel ──────────────────────────────────────── */

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  const t = testimonials[current];

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer z-10"
        aria-label="Previous testimonial"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer z-10"
        aria-label="Next testimonial"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Quote */}
      <div className="min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center px-8 md:px-12"
          >
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-white italic leading-snug">
              {"\u201C"}{t.quote}{"\u201D"}
            </p>
            <p className="mt-6 text-white/60 text-base tracking-wide">
              {"\u2014"} {t.name}, {t.age}, {t.neighborhood}
            </p>
            <p className="text-copper-light/60 text-sm mt-1">
              {t.event}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? "bg-copper-light w-6" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function Home() {
  const howItWorks = [
    {
      icon: <KeyIcon />,
      title: "Apply & Get Accepted",
      desc: "Submit your application. We curate our community to ensure quality connections.",
    },
    {
      icon: <GlassIcon />,
      title: "Attend Curated Events",
      desc: "Rooftop wine tastings, morning hikes, cocktail masterclasses \u2014 not happy hours.",
    },
    {
      icon: <SparkleIcon />,
      title: "Connect with Double Take",
      desc: "After every event, tell us who caught your eye. Mutual matches unlock private chat.",
    },
  ];

  const appDrawbacks = [
    "Endless swiping",
    "Paradox of choice",
    "Ghosting",
    "Profile fatigue",
    "Screen-based connection",
  ];

  const truBenefits = [
    "Curated events",
    "20\u201340 quality people",
    "Real conversations",
    "Shared experiences",
    "Face-to-face chemistry",
  ];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=80"
          alt="Friends enjoying a night out"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/40" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-copper-light text-xs md:text-sm font-medium tracking-[0.25em] uppercase mb-6"
          >
            Welcome to the Offline Era
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-tight"
          >
            Stop Swiping.
            <br />
            Start Living.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed"
          >
            Nashville&apos;s most interesting singles, meeting in person &mdash; over wine, under city lights. No apps. No algorithms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <Button variant="primary" href="/apply" className="!py-4 !px-10 !text-base">
              Join the Waitlist
            </Button>
            <Button variant="secondary" href="/events" className="!py-4 !px-10 !text-base">
              View Upcoming Events
            </Button>
          </motion.div>

          {/* Compact social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex items-center justify-center gap-6 md:gap-10 text-white/60 text-sm"
          >
            <div className="text-center">
              <span className="text-copper-light font-semibold text-lg md:text-xl">
                <AnimatedCounter target={500} suffix="+" />
              </span>
              <p className="text-xs uppercase tracking-wider mt-0.5">Singles</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-copper-light font-semibold text-lg md:text-xl">
                <AnimatedCounter target={92} suffix="%" />
              </span>
              <p className="text-xs uppercase tracking-wider mt-0.5">Return Rate</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-copper-light font-semibold text-lg md:text-xl">
                <AnimatedCounter target={40} suffix="+" />
              </span>
              <p className="text-xs uppercase tracking-wider mt-0.5">Matches</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRESS BAR ═══ */}
      <section className="bg-white py-8 md:py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
            <p className="text-xs tracking-[0.2em] uppercase text-muted/50 font-medium whitespace-nowrap">
              As Featured In
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {pressLogos.map((name) => (
                <span
                  key={name}
                  className="text-muted/30 font-serif text-lg md:text-xl font-semibold whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section className="bg-cream">
        <Heading title="Three Steps. Zero Swiping." subtitle="Real connection starts here." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, i) => (
            <FadeUp key={step.title} delay={i * 0.15} className="h-full">
              <div className="bg-white rounded-2xl p-8 lg:p-10 text-center h-full flex flex-col items-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500 border border-gray-100">
                <div className="w-12 h-1 bg-copper rounded-full mb-8" />
                <div className="mb-6">{step.icon}</div>
                <h3 className="font-serif text-2xl font-semibold text-dark mb-3">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ═══ EVENT TYPES ═══ */}
      <Section className="bg-white">
        <Heading title="Experiences, Not Mixers" subtitle="Every event is designed for real connection — not small talk." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {eventTypes.map((et, i) => (
            <FadeUp key={et.name} delay={i * 0.08}>
              <div className="group relative rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-500">
                <div className="h-52 relative">
                  {et.image ? (
                    <>
                      <Image
                        src={et.image}
                        alt={et.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${et.gradient}`} />
                  )}
                  <div className="absolute inset-0 flex items-end p-6">
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-forest font-medium text-xs tracking-wide uppercase px-3 py-1.5 rounded-full">
                      {et.price}
                    </span>
                    <div className="relative z-10">
                      <h3 className="font-serif text-2xl font-semibold text-white">{et.name}</h3>
                      <p className="text-white/80 text-sm mt-1 leading-relaxed">{et.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ═══ SOCIAL PROOF / TESTIMONIAL CAROUSEL ═══ */}
      <section className="bg-forest py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-tight">
              Don&apos;t Take Our Word for It
            </h2>
            <div className="w-16 h-0.5 mx-auto bg-copper-light" />
          </FadeUp>

          <FadeUp delay={0.15}>
            <TestimonialCarousel />
          </FadeUp>

          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mt-16">
            {[
              { value: 500, suffix: "+", label: "Singles Applied" },
              { value: 92, suffix: "%", label: "Would Attend Again" },
              { value: 40, suffix: "+", label: "Matches Made" },
            ].map((stat, i) => (
              <FadeUp key={stat.label} delay={0.3 + i * 0.15}>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-8 px-4 text-center">
                  <p className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-copper-light">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-white/60 mt-2 text-xs md:text-sm uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE DIFFERENCE ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-dark/95 via-forest/90 to-black/95" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,115,51,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(44,74,62,0.3),transparent_60%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-tight">
              Everything Dating Apps Aren&apos;t
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-white/60">
              The offline era is here. We built TR{"\u00dc"} for people who want something real.
            </p>
            <div className="w-16 h-0.5 mx-auto mt-8 bg-copper-light" />
          </FadeUp>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dating Apps column */}
              <FadeUp>
                <div className="h-full backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8 md:p-10">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-8">
                    Dating Apps
                  </h3>
                  <div className="space-y-5">
                    {appDrawbacks.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9 3L3 9M3 3l6 6" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="text-white/30 line-through decoration-white/15 text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* TRÜ column */}
              <FadeUp delay={0.15}>
                <div className="h-full backdrop-blur-xl bg-copper/[0.08] border border-copper/20 rounded-2xl p-8 md:p-10 shadow-[0_0_60px_-12px_rgba(184,115,51,0.15)]">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-copper-light mb-8">
                    TR{"\u00dc"} Dating
                  </h3>
                  <div className="space-y-5">
                    {truBenefits.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-copper/20 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#D4935A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-white font-medium text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight">
              Your Next Great Night Out Starts Here
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              The offline era starts now. Join in 2 minutes.
            </p>
            <Button variant="primary" href="/apply" className="!text-base !px-12 !py-5">
              Join the Waitlist
            </Button>
            <p className="mt-8 text-white/50 text-sm">
              Already a member?{" "}
              <a href="/login" className="text-copper-light hover:text-copper transition-colors underline underline-offset-4">
                Sign in
              </a>
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
