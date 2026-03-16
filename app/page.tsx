"use client";

import Image from "next/image";
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
      desc: "Browse the calendar and RSVP to curated events at Nashville\u2019s best venues. Come alone or bring a friend \u2014 either way, you\u2019ll meet everyone.",
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

      {/* ═══ 7. WHY TRÜ ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-16">
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
                title: "It\u2019s not a dating event",
                desc: "It\u2019s a social club where everyone happens to be single. The vibe is a great night out \u2014 not a mixer.",
              },
              {
                title: "Every room is curated",
                desc: "We review every application and balance every guest list. The result is a room full of people you\u2019d actually want to meet.",
              },
              {
                title: "No pressure, real follow-up",
                desc: "Double Take lets you privately share interest after the event. If it\u2019s mutual, we connect you. No awkward exchanges in the moment.",
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.12}>
                <div className="rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-6 md:p-8 flex flex-col h-full">
                  <h3 className="text-white font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-white/50 text-[15px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5">
              Now accepting applications
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Ready to meet interesting people?
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto">
              Apply to join Nashville&apos;s members-only social club. It takes about 2 minutes.
            </p>
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
            >
              Apply to Join
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 9. FOOTER SPACING ═══ */}
      <div className="h-8" />
    </>
  );
}
