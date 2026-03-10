"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Button from "@/components/Button";
import { faqData } from "@/lib/constants";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <AnimateOnScroll delay={index * 0.05} className="w-full">
      <div className="border-b border-forest/10 last:border-b-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between py-7 md:py-8 text-left cursor-pointer group"
          aria-expanded={isOpen}
        >
          <span className="font-serif text-xl md:text-2xl text-dark font-medium pr-8 group-hover:text-forest transition-colors duration-300">
            {question}
          </span>
          <span className="flex-shrink-0 w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center group-hover:border-copper group-hover:bg-copper/5 transition-all duration-300">
            <motion.span
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-forest text-xl leading-none select-none"
            >
              +
            </motion.span>
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-8 text-muted text-base md:text-lg leading-relaxed max-w-3xl">
                {answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimateOnScroll>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative bg-forest pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&q=80"
          alt="Nashville atmosphere"
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/60 to-forest/90" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-copper-light text-sm font-medium tracking-widest uppercase mb-6"
          >
            Help Center
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Everything you need to know about TR&Uuml; Dating Nashville.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-20 h-0.5 bg-copper-light mx-auto mt-8"
          />
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] px-8 md:px-12 py-4">
            {faqData.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-dark mb-6">
              Still have questions?
            </h2>
            <p className="text-muted text-lg md:text-xl mb-4 max-w-xl mx-auto">
              We&rsquo;d love to hear from you. Reach out anytime and we&rsquo;ll
              get back to you within 24 hours.
            </p>
            <a
              href="mailto:hello@trudating.com"
              className="inline-block text-copper hover:text-copper-dark font-medium text-lg transition-colors duration-300 mb-10"
            >
              hello@trudating.com
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/apply" variant="primary">
                Join the Waitlist
              </Button>
              <Button href="/events" variant="dark">
                Browse Events
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
