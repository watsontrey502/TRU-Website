"use client";

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

export default function AboutPage() {
  const steps = [
    {
      num: "01",
      title: "Apply",
      desc: "Fill out a short application telling us what makes you interesting. It takes about 2 minutes. We ask about your work, your interests, and what you\u2019re looking for \u2014 not your height or zodiac sign.",
    },
    {
      num: "02",
      title: "Get Approved",
      desc: "We review every application personally. We\u2019re looking for interesting, genuine people who bring energy to a room. You\u2019ll hear back within 48 hours with your status.",
    },
    {
      num: "03",
      title: "Attend",
      desc: "Browse the calendar and RSVP to events at Nashville\u2019s best venues. Every event has a balanced guest list, guided icebreakers, and a format designed so you meet everyone in the room. Show up solo \u2014 that\u2019s the whole point.",
    },
    {
      num: "04",
      title: "Double Take",
      desc: "After the event, tell us who caught your eye. If the feeling is mutual, we\u2019ll introduce you privately. No awkward DMs, no guessing. Just mutual interest, confirmed.",
    },
  ];

  const eventTypes = [
    {
      title: "Rooftop Social",
      guests: "40\u201360 guests",
      desc: "Our flagship format. Drinks, conversation, and guided icebreakers on Nashville\u2019s best rooftops. Big enough to meet someone new, small enough that everyone matters.",
    },
    {
      title: "Wine Night",
      guests: "20 guests",
      desc: "Intimate and curated. A sommelier-led tasting with structured conversation rounds. The kind of evening where you remember every name.",
    },
    {
      title: "Dinner Series",
      guests: "12 guests",
      desc: "Long-table dining at premium restaurants. Chef\u2019s menu, assigned seating that rotates between courses. $80\u2013$150 per person. Our most exclusive format.",
    },
    {
      title: "Activity Events",
      guests: "20\u201330 guests",
      desc: "Cooking classes, golf simulators, art workshops. A shared activity reduces the pressure and gives you something to bond over besides small talk.",
    },
  ];

  return (
    <>
      {/* ═══ 1. HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5"
          >
            About TR&Uuml;
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight max-w-[18ch]"
          >
            The social club Nashville didn&apos;t know it needed.
          </motion.h1>
        </div>
      </section>

      {/* ═══ 2. WHAT IS TRÜ ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp>
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              What is TR&Uuml;
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="max-w-3xl">
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                TR&Uuml; is a members-only social club where everyone happens to be single.
                It is not a dating event. It&apos;s not a mixer. It&apos;s a high-quality social
                environment where interesting, polished people meet naturally.
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed mt-5">
                Romance happens organically &mdash; and the Double Take system allows people
                to reconnect privately after the event. No pressure during. No awkwardness after.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 3. THE PHILOSOPHY ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp>
            <div className="rounded-2xl bg-dark-glass border border-dark-border p-8 md:p-14">
              <div className="w-12 h-0.5 bg-gradient-to-r from-gold to-sand mb-8" />
              <h2 className="font-serif text-2xl md:text-4xl font-bold text-white leading-snug mb-6">
                A great night out first.<br />
                Everything else second.
              </h2>
              <div className="max-w-2xl">
                <p className="text-white/50 text-[15px] md:text-base leading-relaxed">
                  TR&Uuml; is designed to feel like the kind of night you&apos;d attend regardless
                  of your relationship status. A beautiful venue. A balanced room of interesting
                  people. A warm atmosphere where conversation flows naturally. The fact that
                  everyone happens to be single is just the subtext &mdash; never the headline.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 4. HOW IT WORKS ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-16 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              From application to connection.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {steps.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <span className="text-gold font-semibold text-sm">{step.num}</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg md:text-xl">{step.title}</h3>
                  </div>
                  <p className="text-white/50 text-sm md:text-[15px] leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. DOUBLE TAKE ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp>
            <div className="rounded-2xl bg-gradient-to-b from-gold/[0.06] to-transparent border border-gold/10 p-8 md:p-14">
              <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-5">
                Double Take
              </p>
              <h2 className="font-serif text-2xl md:text-4xl font-bold text-white leading-snug mb-6 max-w-xl">
                The event is the experience. Double Take is what happens after.
              </h2>
              <div className="max-w-2xl space-y-4">
                <p className="text-white/50 text-[15px] md:text-base leading-relaxed">
                  After every event, you have 48 hours to select up to 3 people
                  who caught your eye. No one sees your selections unless they picked you too.
                </p>
                <p className="text-white/50 text-[15px] md:text-base leading-relaxed">
                  When it&apos;s mutual, a private chat unlocks for 7 days &mdash; long enough
                  to make plans, short enough to keep the momentum. No endless texting. No ghosting
                  a match from three weeks ago. Just real follow-through on a real connection.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4 max-w-md">
                {[
                  { value: "3", label: "Max picks" },
                  { value: "48h", label: "Selection window" },
                  { value: "7 days", label: "Chat expires" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 text-center">
                    <p className="text-gold font-semibold text-lg">{stat.value}</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ 6. EVENT TYPES ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <FadeUp className="mb-16 md:mb-20">
            <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-4">
              Event formats
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
              Something for every vibe.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {eventTypes.map((evt, i) => (
              <FadeUp key={evt.title} delay={i * 0.1}>
                <div className="rounded-2xl bg-dark-glass border border-dark-border p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg md:text-xl">{evt.title}</h3>
                    <span className="text-gold/70 text-xs font-medium tracking-wide uppercase">{evt.guests}</span>
                  </div>
                  <p className="text-white/50 text-sm md:text-[15px] leading-relaxed">{evt.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA ═══ */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Ready?
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto">
              Apply to join Nashville&apos;s most curated room.
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

      {/* Spacing before footer */}
      <div className="h-8" />
    </>
  );
}
