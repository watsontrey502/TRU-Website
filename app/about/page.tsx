"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

const manifestoItems = [
  "We believe in face-to-face over FaceTime.",
  "We believe in quality over quantity.",
  "We believe your Saturday night should be worth getting dressed up for.",
  "We believe the right people in the right room changes everything.",
];

const comparisonData = [
  {
    app: "Endless swiping",
    tru: "Curated guest lists",
  },
  {
    app: "Awkward first-date small talk",
    tru: "Guided icebreakers & shared experiences",
  },
  {
    app: "Ghosting & dead-end DMs",
    tru: "Mutual matching with Double Take",
  },
  {
    app: "Staring at a screen alone",
    tru: "Meeting real people in real rooms",
  },
  {
    app: "Anyone can sign up",
    tru: "Application-based, intentional community",
  },
  {
    app: "One-size-fits-all",
    tru: "Age-balanced, ratio-managed events",
  },
];

export default function AboutPage() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative bg-forest pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=80"
          alt="Nashville evening atmosphere"
          fill
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/70 to-forest/90" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-copper-light text-sm font-medium tracking-widest uppercase mb-6"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6"
          >
            Why TR&Uuml; Exists
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-20 h-0.5 bg-copper-light mx-auto"
          />
        </div>
      </section>

      {/* Founder Story — 2-col with atmospheric photo */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Quote */}
            <AnimateOnScroll>
              <div className="relative">
                <div className="absolute -top-8 -left-4 text-copper/20 font-serif text-[120px] md:text-[160px] leading-none select-none">
                  &ldquo;
                </div>
                <blockquote className="relative z-10 font-serif text-2xl md:text-3xl text-dark leading-relaxed md:leading-relaxed font-normal italic">
                  I got tired of swiping. I got tired of first dates that felt like
                  job interviews. I started TR&Uuml; because Nashville deserves better
                  than dating apps. Our events bring together real people for real
                  experiences&nbsp;&mdash; the kind where you laugh, connect, and actually
                  remember someone&rsquo;s name the next day.
                </blockquote>
                <div className="mt-12 flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-copper" />
                  <p className="font-serif text-xl text-forest font-medium">
                    &mdash; Trey, Founder
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Photo */}
            <AnimateOnScroll delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-[var(--shadow-elevated)]">
                <Image
                  src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80"
                  alt="Nashville rooftop atmosphere"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* The TRU Manifesto */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="The TR&Uuml; Manifesto"
            subtitle="What we stand for."
          />
          <div className="mt-16 space-y-12 md:space-y-16">
            {manifestoItems.map((item, index) => (
              <AnimateOnScroll
                key={index}
                delay={index * 0.15}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <div className="relative group">
                  <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-0.5 bg-copper/30 group-hover:bg-copper transition-colors duration-500" />
                  <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-dark italic leading-snug md:leading-snug pl-4 md:pl-8">
                    {item}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="bg-forest py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <SectionHeading
            title="How We&rsquo;re Different"
            subtitle="This isn't another dating app. It's the alternative."
            light
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Column Headers */}
            <AnimateOnScroll delay={0}>
              <div className="text-center mb-4">
                <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
                  Dating Apps
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <div className="text-center mb-4">
                <p className="text-copper-light text-sm font-medium tracking-widest uppercase">
                  TR&Uuml;
                </p>
              </div>
            </AnimateOnScroll>

            {/* Comparison Rows */}
            {comparisonData.map((row, index) => (
              <div key={index} className="contents">
                <AnimateOnScroll delay={0.1 + index * 0.08} direction="left">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-white/50 text-lg font-light">{row.app}</p>
                  </div>
                </AnimateOnScroll>
                <AnimateOnScroll delay={0.15 + index * 0.08} direction="right">
                  <div className="bg-copper/10 border border-copper/30 rounded-2xl p-6 text-center">
                    <p className="text-white text-lg font-medium">{row.tru}</p>
                  </div>
                </AnimateOnScroll>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-dark mb-6">
              Ready to try something real?
            </h2>
            <p className="text-muted text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Join a community of Nashville singles who believe dating should be
              an experience, not an app.
            </p>
            <Button href="/apply" variant="primary">
              Join the Waitlist
            </Button>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
