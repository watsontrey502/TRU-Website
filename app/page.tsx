"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

/* ── Hero images for crossfade slideshow ─────────────────────── */

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1400&q=85",
    alt: "Friends socializing at an evening event",
  },
  {
    src: "https://images.unsplash.com/photo-1470753937643-efeb931202a9?w=1400&q=85",
    alt: "Elegant candlelit dinner table",
  },
  {
    src: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1400&q=85",
    alt: "People laughing together at a cocktail bar",
  },
  {
    src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1400&q=85",
    alt: "Stylish venue interior with warm lighting",
  },
];

const CROSSFADE_DURATION = 6000; // ms per image

/* ── Fade-in-up wrapper ──────────────────────────────────────── */

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

/* ── Split text reveal — letters animate in ──────────────────── */

function SplitTextReveal({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      className={className}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            },
          }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.04,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/* ── Scroll progress bar ─────────────────────────────────────── */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress fixed top-0 left-0 right-0 h-[2px] z-50"
      style={{ scaleX }}
    />
  );
}

/* ── Infinite marquee ────────────────────────────────────────── */

const MARQUEE_ITEMS = [
  "CURATED",
  "NASHVILLE",
  "MEMBERS-ONLY",
  "REAL CONNECTION",
  "BEAUTIFUL VENUES",
  "THE OFFLINE ERA",
  "DOUBLE TAKE",
  "NO AWKWARD ANYTHING",
];

function Marquee() {
  return (
    <div className="overflow-hidden py-8 md:py-12 border-y border-white/[0.06]">
      <div className="marquee-track">
        {/* Duplicate the list for seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 px-8 text-[13px] md:text-[15px] font-medium tracking-[0.25em] uppercase whitespace-nowrap"
          >
            <span className="text-white/30">{item}</span>
            <span className="text-gold/40 text-[8px]">&#10022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── 3D Tilt card ────────────────────────────────────────────── */

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateX.set(y * -10);
      rotateY.set(x * 10);
    },
    [rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
      className={`tilt-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Parallax image section ──────────────────────────────────── */

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

/* ── Staggered photo mosaic ──────────────────────────────────── */

const MOSAIC_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85",
    alt: "Fine dining atmosphere",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    alt: "Craft cocktails",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80",
    alt: "Rooftop drinks at golden hour",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
    alt: "Friends sharing a great night out",
    span: "md:col-span-2",
  },
];

function PhotoMosaic() {
  const captions = ["The Table", "The Drinks", "The Rooftop", "The Company"];
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <FadeUp className="mb-14 md:mb-20">
          <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
            The Atmosphere
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
            Where the night takes you.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {MOSAIC_IMAGES.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`group relative overflow-hidden rounded-xl ${img.span} ${
                i === 0 ? "aspect-square" : i === 3 ? "aspect-[2.2/1]" : "aspect-[3/4]"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes={i === 0 || i === 3 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <p className="text-white/90 text-[11px] md:text-xs font-medium tracking-[0.15em] uppercase">
                  {captions[i]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function Home() {
  /* ── Hero crossfade state ── */
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, CROSSFADE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <ScrollProgress />

      {/* ═══ 1. HERO — crossfading slideshow, cinematic ═══ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        {/* Crossfading images with Ken Burns */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" },
              scale: { duration: CROSSFADE_DURATION / 1000, ease: "linear" },
            }}
          >
            <Image
              src={HERO_IMAGES[currentImage].src}
              alt={HERO_IMAGES[currentImage].alt}
              fill
              className="object-cover"
              priority={currentImage === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 z-[1]" />

        {/* Film grain */}
        <div className="grain absolute inset-0 z-[2]" />

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

          <SplitTextReveal
            text="The Offline Era."
            delay={0.5}
            className="font-serif text-[52px] md:text-[72px] lg:text-[80px] font-bold text-white leading-[1.02] tracking-tight max-w-[12ch]"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-6 text-[16px] md:text-[18px] text-white/50 max-w-md leading-relaxed font-sans"
          >
            Curated events for interesting people who happen to be single. Real
            venues. Real conversation. Real connection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
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

        {/* Image indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentImage
                  ? "w-8 bg-gold"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══ MARQUEE — brand energy ═══ */}
      <Marquee />

      {/* ═══ 2. MANIFESTO — bold brand statement ═══ */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Large watermark for depth */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-serif text-[180px] md:text-[280px] lg:text-[360px] font-bold text-white/[0.02] tracking-tight">
            TR&Uuml;
          </span>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-6 md:px-8 text-center">
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
                <span className="text-gold">A great night out</span> where
                everyone{" "}
                happens to be single.
              </motion.span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. HOW IT WORKS — 2x2 grid with 3D tilt ═══ */}
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
                icon: "✎",
                title: "Apply",
                desc: "Tell us what makes you interesting. It takes about 2 minutes.",
              },
              {
                num: "02",
                icon: "✓",
                title: "Get Approved",
                desc: "We curate every guest list. You\u2019ll hear back within 48 hours.",
              },
              {
                num: "03",
                icon: "♦",
                title: "Attend",
                desc: "RSVP to events at Nashville\u2019s best venues. Come alone or bring a friend.",
              },
              {
                num: "04",
                icon: "♡",
                title: "Double Take",
                desc: "Tell us who caught your eye. If it\u2019s mutual, we\u2019ll introduce you.",
              },
            ].map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.08}>
                <TiltCard>
                  <div className="group/card rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 flex items-start gap-5 cursor-default hover:border-gold/20 transition-all duration-300 relative overflow-hidden">
                    {/* Subtle corner glow on hover */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-gold/0 group-hover/card:bg-gold/[0.06] rounded-full blur-2xl transition-all duration-500" />
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/10">
                      <span className="text-gold text-lg">
                        {step.icon}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-gold/40 text-[11px] font-mono tracking-wider">{step.num}</span>
                        <div className="w-6 h-px bg-gold/20" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-white/45 text-[14px] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </TiltCard>
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

      {/* ═══ 5. WHY TRU — three pillars ═══ */}
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
                num: "01",
                title: "Not a dating event",
                desc: "A social club where everyone happens to be single. The vibe is a great night out \u2014 not a mixer with name tags.",
              },
              {
                num: "02",
                title: "Every room is curated",
                desc: "We review every application and balance every guest list. Interesting people, great ratio, no randos.",
              },
              {
                num: "03",
                title: "No pressure. Real follow-up.",
                desc: "Double Take lets you privately share interest after the event. If it\u2019s mutual, we connect you. No awkward anything.",
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.1}>
                <TiltCard>
                  <div className="group/why rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-7 md:p-9 flex flex-col h-full cursor-default hover:border-gold/25 transition-all duration-300 relative overflow-hidden">
                    {/* Large faded number in background */}
                    <span className="absolute -top-4 -right-2 font-serif text-[120px] font-bold text-white/[0.02] group-hover/why:text-white/[0.04] transition-colors duration-500 leading-none select-none pointer-events-none">
                      {item.num}
                    </span>
                    {/* Gold top accent line */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: 32 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                      className="h-0.5 bg-gradient-to-r from-gold to-gold/30 mb-6"
                    />
                    <h3 className="text-white font-semibold text-[17px] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/45 text-[14px] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. PHOTO MOSAIC — replaces second parallax ═══ */}
      <PhotoMosaic />

      {/* ═══ 7. SECOND MARQUEE — momentum ═══ */}
      <Marquee />

      {/* ═══ 8. FINAL CTA — full commitment ═══ */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        {/* Radial glow behind CTA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-0.5 bg-gradient-to-r from-gold to-sand mx-auto mb-10"
            />
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase mb-6">
              Now accepting applications
            </p>
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white mb-6 leading-[1.08]">
              Your next great night out starts here.
            </h2>
            <p className="text-white/45 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Apply to join Nashville&apos;s most curated room. The application
              takes about 2 minutes.
            </p>
            <Link
              href="/apply"
              className="btn-shimmer inline-flex items-center justify-center px-12 py-4.5 rounded-full text-white text-[15px] font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(200,169,126,0.35)]"
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
