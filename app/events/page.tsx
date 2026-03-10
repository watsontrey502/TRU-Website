"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import EventCard from "@/components/EventCard";
import Button from "@/components/Button";
import PullToRefresh from "@/components/PullToRefresh";
import { events } from "@/lib/constants";

const filters = ["All", "This Week", "This Month"] as const;

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    await new Promise((r) => setTimeout(r, 600));
  }, [router]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* Hero Header */}
      <section className="relative bg-forest pt-32 pb-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&q=80"
          alt="Nashville events"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 to-forest" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <AnimateOnScroll>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white text-center mb-6">
              What&apos;s Next
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.15}>
            <p className="text-white/70 text-lg md:text-xl text-center max-w-2xl mx-auto">
              Rooftop tastings, morning hikes, candlelit conversations, and more.
              Find your next experience.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.25}>
            <div className="w-16 h-0.5 bg-copper-light mx-auto mt-8" />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Filter Tabs + Event Grid */}
      <section className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Filter Tabs */}
          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-2 mb-14">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                    activeFilter === filter
                      ? "text-white"
                      : "text-muted hover:text-dark"
                  }`}
                >
                  {activeFilter === filter && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-forest rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                date={event.date}
                time={event.time}
                venue={event.venue}
                neighborhood={event.neighborhood}
                price={event.price}
                ageRange={event.ageRange}
                spotsLeft={event.spotsLeft}
                dressCode={event.dressCode}
                gradient={event.gradient}
                image={event.image}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-forest py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
              Don&apos;t see the right event?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="text-white/70 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              More are coming soon. Apply to get first access to new events,
              exclusive invites, and early-bird pricing.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <Button variant="primary" href="/apply">
              Join the Waitlist
            </Button>
          </AnimateOnScroll>
        </div>
      </section>
    </PullToRefresh>
  );
}
