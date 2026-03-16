"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Button from "@/components/Button";
import { events } from "@/lib/constants";

const faqs = [
  {
    question: "What should I wear?",
    answer:
      "Each event has a specific dress code listed on the event page. As a general rule, dress like you\u2019re meeting someone you want to impress \u2014 because you might be. When in doubt, lean slightly more polished than you think you need to. It shows you care about the experience.",
  },
  {
    question: "Can I come alone?",
    answer:
      "Absolutely \u2014 and most people do. Our events are designed so you\u2019ll meet everyone naturally through guided icebreakers and rotations. You can also bring a friend if that\u2019s more your speed.",
  },
  {
    question: "What\u2019s Double Take?",
    answer:
      "Double Take is our post-event matching system. After every event, you\u2019ll privately tell us who caught your eye. If the feeling is mutual, we\u2019ll connect you both with a warm introduction. No awkward DMs, no uncertainty \u2014 just mutual interest, confirmed. It takes the guesswork out of \u201Cdid they like me too?\u201D",
  },
  {
    question: "What if I don\u2019t match with anyone?",
    answer:
      "That\u2019s completely okay and more common than you\u2019d think. Not every event will produce a match, and that\u2019s not a failure \u2014 it\u2019s just how genuine connection works. Many of our members attend multiple events before finding someone special. Each event is still a great night out, and many attendees end up making real friendships along the way.",
  },
];

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimateOnScroll delay={index * 0.05}>
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
        >
          <span className="font-serif text-xl md:text-2xl font-semibold text-black group-hover:text-black transition-colors pr-8">
            {question}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gold text-2xl font-light flex-shrink-0 leading-none"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <p className="text-stone leading-relaxed pb-6 max-w-2xl">
                {answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimateOnScroll>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center px-6">
          <AnimateOnScroll>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-black mb-4">
              Event Not Found
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-stone text-lg mb-8 max-w-md mx-auto">
              This event may have already happened or doesn&apos;t exist. Check
              out our upcoming events instead.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <Button variant="dark" href="/events">
              View All Events
            </Button>
          </AnimateOnScroll>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.venue + " Nashville TN"
  )}`;

  return (
    <>
      {/* Hero with Photo */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {event.image ? (
          <>
            <Image
              src={event.image}
              alt={event.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`} />
            <div className="absolute inset-0 bg-black/10" />
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.05),transparent_50%)]" />

        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
          <AnimateOnScroll>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium tracking-wide uppercase transition-colors mb-8"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All Events
            </Link>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6">
              {event.name}
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80 text-lg">
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {event.date}
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {event.time}
              </span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Info Cards — Frosted Glass */}
      <section className="bg-cream">
        <div className="max-w-4xl mx-auto px-6 md:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Venue */}
            <AnimateOnScroll delay={0}>
              <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 shadow-[var(--shadow-card)] border border-white/60 text-center col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-stone uppercase tracking-wide mb-1">
                  Venue
                </p>
                <p className="font-semibold text-black text-sm">{event.venue}</p>
                <p className="text-stone text-xs mb-2">{event.neighborhood}</p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold text-xs font-medium hover:text-gold transition-colors"
                >
                  Get Directions &rarr;
                </a>
              </div>
            </AnimateOnScroll>

            {/* Dress Code */}
            <AnimateOnScroll delay={0.05}>
              <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 shadow-[var(--shadow-card)] border border-white/60 text-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 3l3.057-3L12 3.5 15.943 0 19 3v6l-7 4-7-4V3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 13.5V22M8 22h8"
                    />
                  </svg>
                </div>
                <p className="text-xs text-stone uppercase tracking-wide mb-1">
                  Dress Code
                </p>
                <p className="font-semibold text-black text-sm">
                  {event.dressCode}
                </p>
              </div>
            </AnimateOnScroll>

            {/* Age Range */}
            <AnimateOnScroll delay={0.1}>
              <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 shadow-[var(--shadow-card)] border border-white/60 text-center">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-stone uppercase tracking-wide mb-1">
                  Age Range
                </p>
                <p className="font-semibold text-black text-sm">
                  {event.ageRange}
                </p>
              </div>
            </AnimateOnScroll>

            {/* Price */}
            <AnimateOnScroll delay={0.15}>
              <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 shadow-[var(--shadow-card)] border border-white/60 text-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-stone uppercase tracking-wide mb-1">
                  Price
                </p>
                <p className="font-semibold text-black text-sm">
                  ${event.price}
                </p>
              </div>
            </AnimateOnScroll>

            {/* Spots Left */}
            <AnimateOnScroll delay={0.2}>
              <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 shadow-[var(--shadow-card)] border border-white/60 text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    event.spotsLeft <= 6 ? "bg-gold/10" : "bg-black/10"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      event.spotsLeft <= 6 ? "text-gold" : "text-black"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-stone uppercase tracking-wide mb-1">
                  Spots Left
                </p>
                <p
                  className={`font-semibold text-sm ${
                    event.spotsLeft <= 6 ? "text-gold" : "text-black"
                  }`}
                >
                  {event.spotsLeft} remaining
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-cream py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-6">
              About This Event
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-stone text-lg leading-relaxed">
              {event.description}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.15}>
            <p className="text-stone text-lg leading-relaxed mt-6">
              Your ticket includes the full experience, your first drink, and
              access to our Double Take matching system. Arrive a few minutes
              early to check in and settle in before things get started.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* What to Expect / Timeline */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-4 text-center">
              What to Expect
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-stone text-center mb-14 max-w-lg mx-auto">
              Here&apos;s how the evening unfolds. Every moment is designed to
              make connection feel effortless.
            </p>
          </AnimateOnScroll>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 md:-translate-x-px" />

            {event.timeline.map((item, index) => {
              const isLeft = index % 2 === 0;

              return (
                <AnimateOnScroll
                  key={index}
                  delay={index * 0.08}
                  direction={isLeft ? "left" : "right"}
                >
                  <div
                    className={`relative flex items-start mb-10 last:mb-0 ${
                      isLeft
                        ? "md:flex-row"
                        : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Content card - mobile always right, desktop alternates */}
                    <div
                      className={`ml-16 md:ml-0 md:w-1/2 ${
                        isLeft ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                      }`}
                    >
                      <span className="text-gold font-semibold text-sm tracking-wide">
                        {item.time}
                      </span>
                      <h3 className="font-serif text-xl font-semibold text-black mt-1">
                        {item.activity}
                      </h3>
                    </div>

                    {/* Dot on the line */}
                    <div className="absolute left-6 md:left-1/2 top-1 w-3 h-3 rounded-full bg-gold border-2 border-white shadow-sm -translate-x-1/2" />

                    {/* Spacer for the other side on desktop */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Tickets CTA */}
      <section className="bg-black py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
              Ready to Join?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-white/70 text-lg mb-3">
              {event.spotsLeft <= 6
                ? `Only ${event.spotsLeft} spots remaining. Don\u2019t wait.`
                : `${event.spotsLeft} spots available. Secure yours now.`}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.15}>
            <p className="text-white/50 text-sm mb-10">
              ${event.price} per person &middot; Includes first drink & Double
              Take
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <Button variant="primary" href="/apply">
              Get Tickets &mdash; ${event.price}
            </Button>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-cream py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-4 text-center">
              Common Questions
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-stone text-center mb-14 max-w-lg mx-auto">
              First time? Here&apos;s everything you need to know before your
              event.
            </p>
          </AnimateOnScroll>

          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-[var(--shadow-card)] border border-gray-100">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>

          <AnimateOnScroll delay={0.2}>
            <p className="text-center text-stone mt-10">
              Have another question?{" "}
              <a
                href="mailto:hello@trudating.com"
                className="text-gold font-medium hover:text-gold transition-colors"
              >
                Reach out to us
              </a>
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-black text-sm">${event.price}</p>
            <p
              className={`text-xs font-medium ${
                event.spotsLeft <= 6 ? "text-gold" : "text-stone"
              }`}
            >
              {event.spotsLeft} spots left
            </p>
          </div>
          <Button variant="primary" href="/apply" className="flex-1 text-center">
            Get Tickets
          </Button>
        </div>
      </div>

      {/* Bottom spacer for sticky CTA on mobile */}
      <div className="h-20 md:h-0" />
    </>
  );
}
