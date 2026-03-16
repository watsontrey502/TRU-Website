"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/constants";

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

/* ── Waitlist form ─────────────────────────────────────────────── */

function WaitlistForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: "",
          email: email.trim(),
          instagram: instagram.trim() || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // silent fail — data may still be in Supabase
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">You&apos;re on the list.</h3>
        <p className="text-white/50 text-sm">We&apos;ll be in touch soon.</p>
      </motion.div>
    );
  }

  const inputClass =
    "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-4 px-4 text-white text-[15px] placeholder:text-white/[0.22] focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,169,126,0.15)] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Instagram (optional)"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl text-white font-medium text-[15px] bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting..." : "Join the Waitlist"}
      </button>
    </form>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function Home() {
  const howItWorks = [
    {
      num: "01",
      title: "Apply",
      desc: "Fill out a short application. Tell us what makes you interesting \u2014 takes about 2 minutes.",
    },
    {
      num: "02",
      title: "Get Approved",
      desc: "We review every application to curate the right mix of people. You\u2019ll hear back within 48 hours.",
    },
    {
      num: "03",
      title: "Attend",
      desc: "Browse the calendar and RSVP to curated events at Nashville\u2019s best venues. Show up solo \u2014 that\u2019s the point.",
    },
    {
      num: "04",
      title: "Double Take",
      desc: "After the event, tell us who caught your eye. If it\u2019s mutual, we\u2019ll introduce you. No awkward DMs.",
    },
  ];

  const featureTags = [
    "Beautiful venues",
    "Curated crowd",
    "Balanced rooms",
    "No pressure",
  ];

  return (
    <>
      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=85"
          alt="Candlelit evening at a Nashville venue"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 pb-16 md:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5"
          >
            Nashville
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-[46px] md:text-[64px] font-bold text-white leading-[1.05] tracking-tight max-w-[11ch]"
          >
            Welcome to The Offline Era.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-5 text-[15px] text-white/55 max-w-md leading-relaxed font-sans"
          >
            A private social club for interesting people who happen to be single.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
            >
              Apply to Join
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white/80 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
            >
              Explore
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. SOCIAL PROOF BAR ═══ */}
      <section className="py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp>
            <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 text-center bg-gradient-to-r from-gold/[0.04] via-transparent to-gold/[0.04]">
              <p className="text-white/60 text-sm md:text-base">
                <span className="text-gold font-semibold">
                  <AnimatedCounter target={847} />
                </span>
                {" people on the waitlist "}
                <span className="text-white/30 mx-2">&middot;</span>
                {" "}
                <span className="text-gold font-semibold">
                  <AnimatedCounter target={37} suffix="%" />
                </span>
                {" acceptance rate"}
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 3. STAT CARDS ═══ */}
      <section className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[
              { label: "Format", value: "Curated socials" },
              { label: "After", value: "Double Take" },
              { label: "City", value: "Nashville" },
            ].map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-5 md:p-8 text-center">
                  <p className="text-white/30 text-[10px] md:text-xs uppercase tracking-widest mb-2">
                    {stat.label}
                  </p>
                  <p className="text-white font-medium text-sm md:text-base">
                    {stat.value}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. HOW TRÜ WORKS ═══ */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-16 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              Four steps to your <br className="hidden md:block" />
              next great night out.
            </h2>
          </FadeUp>

          <div className="space-y-4 md:space-y-6">
            {howItWorks.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 flex items-start gap-5 md:gap-8">
                  <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-gold font-semibold text-sm md:text-base">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg md:text-xl mb-1.5">{step.title}</h3>
                    <p className="text-white/50 text-sm md:text-[15px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. VENUE IMAGE ═══ */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=85"
          alt="Cocktails at a Nashville bar"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-6xl mx-auto px-6 md:px-8 pb-16 md:pb-24">
          <FadeUp>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold to-sand mb-6" />
            <p className="font-serif text-2xl md:text-4xl font-bold text-white leading-snug max-w-lg">
              A great night out first. Everything else second.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 6. FEATURE TAGS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {featureTags.map((tag, i) => (
              <FadeUp key={tag} delay={i * 0.08}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 text-center">
                  <p className="text-white/80 text-sm md:text-base font-medium">
                    <span className="text-gold mr-2">{"\u2726"}</span>
                    {tag}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-16">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              From our members
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              What they&apos;re saying.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <div className="rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-6 md:p-8 flex flex-col h-full">
                  <p className="text-white/60 italic text-[15px] leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/[0.06]">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {t.name}, {t.age}
                      </p>
                      <p className="text-white/30 text-xs">{t.caption}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. WAITLIST CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-xl mx-auto px-6 md:px-8">
          <FadeUp>
            <div className="rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-8 md:p-12">
              <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
                Founding Members
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
                Join the Nashville waitlist.
              </h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                We&apos;re launching with a small founding class. Apply now to be first in line for events, early pricing, and the Double Take beta.
              </p>
              <WaitlistForm />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 9. FOOTER SPACING ═══ */}
      <div className="h-8" />
    </>
  );
}
