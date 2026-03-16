"use client";

import AnimateOnScroll from "./AnimateOnScroll";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  light = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <AnimateOnScroll className={`text-center mb-16 ${className}`}>
      <h2
        className={`font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 ${
          light ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-lg md:text-xl max-w-2xl mx-auto ${
            light ? "text-white/70" : "text-stone"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`w-16 h-0.5 mx-auto mt-6 ${
          light ? "bg-sand" : "bg-gold"
        }`}
      />
    </AnimateOnScroll>
  );
}
