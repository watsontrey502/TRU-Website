"use client";

import Link from "next/link";
import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";

interface EventCardProps {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string;
  price: number;
  ageRange: string;
  spotsLeft: number;
  dressCode: string;
  gradient: string;
  image?: string;
  delay?: number;
}

export default function EventCard({
  id,
  name,
  date,
  time,
  venue,
  neighborhood,
  price,
  ageRange,
  spotsLeft,
  dressCode,
  gradient,
  image,
  delay = 0,
}: EventCardProps) {
  return (
    <AnimateOnScroll delay={delay}>
      <Link href={`/events/${id}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1.5 transition-all duration-500 border border-gray-100">
          {/* Image or gradient placeholder */}
          <div
            className={`h-52 relative overflow-hidden ${!image ? `bg-gradient-to-br ${gradient}` : ""}`}
          >
            {image ? (
              <>
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
            )}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <span className="bg-white/90 backdrop-blur-sm text-dark text-xs font-medium px-3 py-1 rounded-full">
                {ageRange}
              </span>
              <span className="bg-white/90 backdrop-blur-sm text-dark text-xs font-medium px-3 py-1 rounded-full">
                {dressCode}
              </span>
            </div>
          </div>

          {/* Card content */}
          <div className="p-6">
            <h3 className="font-serif text-2xl font-semibold text-dark mb-2 group-hover:text-forest transition-colors">
              {name}
            </h3>
            <p className="text-muted text-sm mb-1">
              {date} &middot; {time}
            </p>
            <p className="text-muted text-sm mb-4">
              {venue}, {neighborhood}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-dark font-semibold text-lg">${price}</span>
              <span
                className={`text-sm font-medium ${
                  spotsLeft <= 6 ? "text-copper" : "text-muted"
                }`}
              >
                {spotsLeft} spots left
              </span>
            </div>
            <div className="mt-4 w-full bg-forest text-white text-center py-3 rounded-full text-sm font-medium tracking-wide uppercase group-hover:bg-forest-dark transition-colors">
              Get Tickets
            </div>
          </div>
        </div>
      </Link>
    </AnimateOnScroll>
  );
}
