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
  height = "h-[60vh] md:h-[75vh]",
  children,
}: {
  src: string;
  alt: string;
  height?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section ref={ref} className={`relative ${height} overflow-hidden`}>
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

/* ═════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <>
      {/* ═══ 1. HERO — full viewport, cinematic ═══ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        {/* Ken Burns slow zoom */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 25, ease: "linear" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1400&q=85"
            alt="Friends socializing at an evening event"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        {/* Film grain */}
        <div className="grain absolute inset-0 z-[1]" />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 pb-20 md:pb-28">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/70 text-[11px] md:text-xs font-medium tracking-[0.25em] uppercase mb-6"
          >
            Nashville&apos;s members-only social club
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-[52px] md:text-[72px] lg:text-[80px] font-bold text-white leading-[1.02] tracking-tight max-w-[12ch]"
          >
            The Offline Era.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-6 text-[16px] md:text-[18px] text-white/50 max-w-md leading-relaxed font-sans"
          >
            Curated events for interesting people who happen to be single. Real venues. Real conversation. Real connection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/apply"
              className="btn-shimmer inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-[15px] font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(200,169,126,0.3)]"
            >
              Apply to Join
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full text-white/70 text-[15px] font-medium bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white transition-all"
            >
              How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. MANIFESTO — bold brand statement ═══ */}
      <section className="py-24 md:py-36">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0"
          >
            {/* Animated gold bar */}
            <motion.div
              variants={{
                hidden: { width: 0, opacity: 0 },
                visible: { width: 48, opacity: 1 },
              }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-0.5 bg-gradient-to-r from-gold to-sand mx-auto mb-10"
            />

            <p className="font-serif text-[26px] md:text-[38px] lg:text-[44px] font-bold leading-[1.2] tracking-tight">
              <motion.span
                className="block text-white"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Not a dating app.
              </motion.span>
              <motion.span
                className="block text-white"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Not a mixer.
              </motion.span>
              <motion.span
                className="block text-white"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="text-gold">A great night out</span> where everyone{" "}
                happens to be single.
              </motion.span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. HOW IT WORKS — 2x2 grid ═══ */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-14 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              Four steps. One great night.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[
              {
                num: "01",
                title: "Apply",
                desc: "Tell us what makes you interesting. It takes about 2 minutes.",
              },
              {
                num: "02",
                title: "Get Approved",
                desc: "We curate every guest list. You\u2019ll hear back within 48 hours.",
              },
              {
                num: "03",
                title: "Attend",
                desc: "RSVP to events at Nashville\u2019s best venues. Come alone or bring a friend.",
              },
              {
                num: "04",
                title: "Double Take",
                desc: "Tell us who caught your eye. If it\u2019s mutual, we\u2019ll introduce you.",
              },
            ].map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: "rgba(200,169,126,0.25)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 flex items-start gap-5 cursor-default"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-gold font-semibold text-sm">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-white/45 text-[14px] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. FULL-BLEED IMAGE — cocktails ═══ */}
      <ParallaxImage
        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1400&q=85"
        alt="Cocktails at a Nashville bar"
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
              A great night out first. Everything else second.
            </p>
          </FadeUp>
        </div>
      </ParallaxImage>

      {/* ═══ 5. WHY TRÜ — three pillars ═══ */}
      <section className="py-24 md:py-36">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-14 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              Why TR&Uuml;
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              What makes this different.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: "\u2726",
                title: "Not a dating event",
                desc: "A social club where everyone happens to be single. The vibe is a great night out \u2014 not a mixer with name tags.",
              },
              {
                icon: "\u2726",
                title: "Every room is curated",
                desc: "We review every application and balance every guest list. Interesting people, great ratio, no randos.",
              },
              {
                icon: "\u2726",
                title: "No pressure. Real follow-up.",
                desc: "Double Take lets you privately share interest after the event. If it\u2019s mutual, we connect you. No awkward anything.",
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: "rgba(200,169,126,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-7 md:p-9 flex flex-col h-full cursor-default"
                >
                  <span className="text-gold text-lg mb-4">{item.icon}</span>
                  <h3 className="text-white font-semibold text-[17px] mb-2.5">{item.title}</h3>
                  <p className="text-white/45 text-[14px] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. SECOND IMAGE — group energy ═══ */}
      <ParallaxImage
        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1400&q=85"
        alt="Friends sharing a meal at a long table"
        height="h-[50vh] md:h-[65vh]"
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
              The kind of room you want to be in.
            </p>
          </FadeUp>
        </div>
      </ParallaxImage>

      {/* ═══ 7. FINAL CTA — full commitment ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase mb-6">
              Now accepting applications
            </p>
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white mb-6 leading-[1.08]">
              Your next great night out starts here.
            </h2>
            <p className="text-white/45 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Apply to join Nashville&apos;s most curated room. The application takes about 2 minutes.
            </p>
            <Link
              href="/apply"
              className="btn-shimmer inline-flex items-center justify-center px-12 py-4.5 rounded-full text-white text-[15px] font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(200,169,126,0.3)]"
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
