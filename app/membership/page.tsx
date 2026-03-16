"use client";

import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

const features = [
  {
    title: "Curated Events",
    description:
      "Access to all TR\u00dc events at member pricing. Rooftop tastings, hikes, dinner parties, trivia nights, and more.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Double Take Matching",
    description:
      "Our post-event mutual matching system. Select who caught your eye \u2014 if it\u2019s mutual, you both get connected.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "A Real Community",
    description:
      "Join a vetted group of Nashville singles who actually show up. No flakes, no ghosts \u2014 just people ready to connect.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const doubleTakeSteps = [
  {
    step: "01",
    title: "Attend an Event",
    description: "Show up, be yourself, and enjoy the night. Every event is designed to help you meet everyone in the room.",
  },
  {
    step: "02",
    title: "Open Double Take",
    description: "After the event, open Double Take on your dashboard and select the people who caught your eye.",
  },
  {
    step: "03",
    title: "Get Matched",
    description: "If it's mutual, you both get connected. Your selections are never revealed unless they're mutual.",
  },
];

const eventExperience = [
  { time: "Arrival", activity: "Check in, grab your welcome drink, and settle into the vibe." },
  { time: "Icebreakers", activity: "Guided conversation starters that make meeting people feel effortless." },
  { time: "Rotations", activity: "Structured mingles so you connect with everyone — not just whoever's nearest." },
  { time: "Open Mingle", activity: "The structure fades and the real connections begin." },
  { time: "Double Take", activity: "After the event, tell us who caught your eye. We'll handle the rest." },
];

export default function MembershipPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-black pt-32 pb-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&q=80"
          alt="Nashville rooftop"
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black" />

        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 text-center">
          <AnimateOnScroll>
            <p className="text-sand text-sm uppercase tracking-[0.2em] font-medium mb-6">
              Membership
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6">
              Welcome to the<br />Offline Era
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              A membership for Nashville singles who are done swiping and ready
              for real connection. Curated events. Mutual matching. A community
              that actually shows up.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.3}>
            <div className="w-16 h-0.5 bg-sand mx-auto mt-8" />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-cream py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="Choose Your Plan"
            subtitle="Event tickets purchased separately ($30–$85). Cancel anytime."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Member Tier */}
            <AnimateOnScroll>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[var(--shadow-card)] border border-gray-100 text-center h-full flex flex-col">
                <p className="text-xs uppercase tracking-[0.15em] text-stone font-medium mb-2">
                  Member
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-serif text-5xl font-bold text-black">$25</span>
                  <span className="text-stone text-lg">/month</span>
                </div>
                <p className="text-stone text-sm mb-8">
                  Everything you need to get started
                </p>

                <div className="space-y-4 text-left mb-10 flex-1">
                  {[
                    "Access to all TR\u00dc events at member pricing",
                    "Double Take post-event matching",
                    "Member-only community access",
                    "Cancel anytime \u2014 no fees, no hassle",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-black text-[15px]">{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="dark" href="/apply" className="w-full">
                  Join the Waitlist
                </Button>
              </div>
            </AnimateOnScroll>

            {/* Inner Circle Tier */}
            <AnimateOnScroll delay={0.1}>
              <div className="bg-black rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-black text-center h-full flex flex-col relative overflow-hidden">
                {/* Popular badge */}
                <div className="absolute top-0 right-0 bg-gold text-white text-[10px] uppercase tracking-wider font-semibold px-4 py-1.5 rounded-bl-xl">
                  Most Popular
                </div>

                <p className="text-xs uppercase tracking-[0.15em] text-sand font-medium mb-2">
                  Inner Circle
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-serif text-5xl font-bold text-white">$65</span>
                  <span className="text-white/60 text-lg">/month</span>
                </div>
                <p className="text-white/60 text-sm mb-8">
                  For those who want the full experience
                </p>

                <div className="space-y-4 text-left mb-10 flex-1">
                  {[
                    "Everything in Member",
                    "48-hour early access to event RSVPs",
                    "1 guest pass per month",
                    "Intimate curated dinners (8\u201312 people)",
                    "Double Take do-over after matches reveal",
                    "Priority waitlist for sold-out events",
                  ].map((item, i) => (
                    <div key={item} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${i === 0 ? "text-white/40" : "text-sand"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[15px] ${i === 0 ? "text-white/40" : "text-white"}`}>{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="primary" href="/apply" className="w-full">
                  Join the Waitlist
                </Button>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={0.2}>
            <p className="text-center text-[11px] text-gray-300 mt-8">
              Membership opens with our Nashville launch. Apply now for priority access.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="What You Get"
            subtitle="Everything you need to meet someone worth meeting."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <AnimateOnScroll key={feature.title} delay={i * 0.1}>
                <div className="bg-cream rounded-2xl p-8 text-center h-full">
                  <div className="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-5 text-black">
                    {feature.icon}
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-stone leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Double Take Deep-Dive */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="How Double Take Works"
            subtitle="The post-event matching system that takes the guesswork out of 'did they like me too?'"
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doubleTakeSteps.map((item, i) => (
              <AnimateOnScroll key={item.step} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center mx-auto mb-5">
                    <span className="font-serif text-2xl font-bold text-sand">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={0.4}>
            <div className="mt-14 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
              <p className="text-white/80 text-lg font-serif italic">
                &ldquo;Your selections are never revealed unless they&rsquo;re mutual.&rdquo;
              </p>
              <p className="text-sand text-sm mt-3 font-medium">
                Privacy is at the core of Double Take
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Event Experience Preview */}
      <section className="bg-cream py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="A Night with TRU"
            subtitle="Here's what a typical event looks like."
          />

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gold/20" />

            {eventExperience.map((item, i) => (
              <AnimateOnScroll key={item.time} delay={i * 0.08}>
                <div className="relative flex items-start mb-10 last:mb-0">
                  <div className="absolute left-6 top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-cream -translate-x-1/2 z-10" />
                  <div className="ml-14">
                    <span className="text-gold font-semibold text-sm tracking-wide uppercase">
                      {item.time}
                    </span>
                    <p className="text-black mt-1 leading-relaxed">
                      {item.activity}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-black py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
              Ready to date differently?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-white/70 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Apply now and be first in line when membership opens in Nashville.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <Button variant="primary" href="/apply">
              Join the Waitlist
            </Button>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
