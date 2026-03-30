"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────

interface EventDetail {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string;
  price: number;
  age_range: string;
  dress_code: string;
  capacity: number;
  description: string;
  image_url: string;
  double_take_open: boolean;
  live_status: string;
}

interface Attendee {
  profile_id: string;
  profiles: { first_name: string } | null;
}

interface Profile {
  subscription_tier: string;
}

// ─── Main Component ──────────────────────────────────────────────

export default function DashboardEventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [attending, setAttending] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("free");
  const [premierFreeUsed, setPremierFreeUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile tier
      const { data: profileData } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setTier(profileData.subscription_tier ?? "free");
      }

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);

      // Check if user is attending
      const { data: attendance } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", eventData.id)
        .eq("profile_id", user.id)
        .neq("status", "cancelled")
        .maybeSingle();

      setAttending(!!attendance);

      // Check if premier free ticket used this month
      if (profileData?.subscription_tier === "premier") {
        const now = new Date();
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        const { count } = await supabase
          .from("event_attendees")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .neq("status", "cancelled")
          .gte("created_at", monthStart);

        setPremierFreeUsed((count ?? 0) > 0);
      }

      // Get attendee previews
      const { data: attendeeData, count } = await supabase
        .from("event_attendees")
        .select("profile_id, profiles(first_name)", { count: "exact" })
        .eq("event_id", eventData.id)
        .neq("status", "cancelled")
        .limit(5);

      if (attendeeData) setAttendees(attendeeData as unknown as Attendee[]);
      if (count !== null) setAttendeeCount(count);

      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  // ─── Tier-aware pricing ─────────────────────────────────────────

  const getTicketPrice = (): number => {
    if (!event) return 0;
    if (tier === "premier" && !premierFreeUsed) return 0;
    if (tier === "premier" || tier === "social")
      return Math.round(event.price * 0.75);
    return event.price;
  };

  const getButtonLabel = (): string => {
    if (!event) return "";
    const price = getTicketPrice();

    if (tier === "premier") {
      if (!premierFreeUsed) return "RSVP (Included)";
      return `RSVP -- 25% off ($${price})`;
    }
    if (tier === "social") {
      return `RSVP -- 25% off ($${price})`;
    }
    return `Buy Ticket -- $${price}`;
  };

  // ─── Actions ─────────────────────────────────────────────────────

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${slug}/purchase`, {
        method: "POST",
      });
      if (res.ok) {
        setAttending(true);
        setAttendeeCount((c) => c + 1);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to complete purchase");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleAddGuest = async () => {
    setGuestLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${slug}/guest`, { method: "POST" });
      if (res.ok) {
        setAttendeeCount((c) => c + 1);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add guest");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // ─── Loading state ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif text-3xl font-semibold text-[#F5E6D3] mb-4">
          Event not found
        </h1>
        <Link
          href="/dashboard"
          className="text-[#C8A97E] font-medium hover:text-[#C8A97E]/80 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const attendeeNames = attendees
    .slice(0, 3)
    .map(
      (a) => (a.profiles as unknown as { first_name: string })?.first_name
    )
    .filter(Boolean);
  const otherCount = attendeeCount - attendeeNames.length;
  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((attendeeCount / event.capacity) * 100))
    : 0;
  const isSoldOut = event.capacity
    ? attendeeCount >= event.capacity
    : false;

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#BDB8B2] hover:text-[#F5E6D3] text-sm font-medium transition-colors mb-6"
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
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#131315]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* Hero image */}
        {event.image_url && (
          <div className="relative w-full h-56 md:h-72 overflow-hidden">
            <Image
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0D] via-[#0C0C0D]/40 to-transparent" />

            {/* Date badge on image */}
            <div className="absolute bottom-4 left-6">
              <div className="bg-[#0C0C0D]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-[#C8A97E] text-xs font-semibold uppercase tracking-widest">
                  {new Date(event.date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { month: "short" }
                  )}
                </p>
                <p className="text-[#F5E6D3] text-2xl font-serif font-bold leading-tight">
                  {new Date(event.date + "T00:00:00").getDate()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event header */}
        <div className="px-6 md:px-8 pt-6 pb-4">
          <p className="text-[#C8A97E] text-xs uppercase tracking-[0.15em] font-semibold mb-2">
            {formatDate(event.date)} &middot; {formatTime(event.time)}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#F5E6D3] mb-2">
            {event.name}
          </h1>
          <p className="text-[#BDB8B2] text-sm flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#C8A97E]"
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
            {event.venue} &middot; {event.neighborhood}
          </p>
        </div>

        <div className="px-6 md:px-8 pb-8 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Dress Code",
                value: event.dress_code || "Casual",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 7H7L5 3zm0 0l2 7m10-7l-2 7m-8 0h10l1 11H6L7 10z"
                    />
                  </svg>
                ),
              },
              {
                label: "Age Range",
                value: event.age_range || "All ages",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
              },
              {
                label: "Capacity",
                value: event.capacity
                  ? `${attendeeCount} / ${event.capacity}`
                  : `${attendeeCount} attending`,
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                ),
              },
              {
                label: "Price",
                value:
                  tier === "premier" && !premierFreeUsed
                    ? "Included"
                    : tier === "premier" || tier === "social"
                    ? `$${Math.round(event.price * 0.75)}`
                    : `$${event.price}`,
                icon: (
                  <svg
                    className="w-4 h-4"
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
                ),
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/[0.06] rounded-xl p-4"
              >
                <div className="flex items-center gap-1.5 text-[#C8A97E] mb-1.5">
                  {item.icon}
                  <p className="text-[10px] uppercase tracking-widest font-semibold">
                    {item.label}
                  </p>
                </div>
                <p className="font-semibold text-[#F5E6D3] text-sm">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Capacity bar */}
          {event.capacity && (
            <div>
              <div className="flex items-center justify-between text-xs text-[#BDB8B2] mb-1.5">
                <span>
                  {attendeeCount} / {event.capacity} spots filled
                </span>
                <span>{capacityPercent}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    capacityPercent >= 90
                      ? "bg-red-500"
                      : capacityPercent >= 70
                      ? "bg-amber-500"
                      : "bg-[#C8A97E]"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#F5E6D3] mb-3">
                About This Event
              </h2>
              <p className="text-[#BDB8B2] leading-relaxed text-sm">
                {event.description}
              </p>
            </div>
          )}

          {/* Attendee preview */}
          {attendeeNames.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#F5E6D3] mb-3">
                Who&apos;s Going
              </h2>
              <div className="flex items-center gap-2">
                {/* Avatar dots */}
                <div className="flex -space-x-2">
                  {attendeeNames.map((name, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-[#C8A97E]/20 border-2 border-[#0C0C0D] flex items-center justify-center"
                    >
                      <span className="text-[#C8A97E] text-xs font-semibold">
                        {name.charAt(0)}
                      </span>
                    </div>
                  ))}
                  {otherCount > 0 && (
                    <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0C0C0D] flex items-center justify-center">
                      <span className="text-[#BDB8B2] text-[10px] font-semibold">
                        +{otherCount}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[#BDB8B2] text-sm ml-1">
                  {attendeeNames.join(", ")}
                  {otherCount > 0 &&
                    ` and ${otherCount} other${otherCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!attending ? (
              <motion.button
                onClick={handlePurchase}
                disabled={purchaseLoading || isSoldOut}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#C8A97E] to-[#B8956E] text-[#0C0C0D] font-semibold text-base tracking-wide transition-all hover:shadow-lg hover:shadow-[#C8A97E]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {purchaseLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0C0C0D]/30 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isSoldOut ? (
                  "Sold Out"
                ) : (
                  getButtonLabel()
                )}
              </motion.button>
            ) : (
              <>
                {/* Attending state */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-base text-center flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  You&apos;re Attending
                </motion.div>

                {/* Premier +1 Guest button */}
                {tier === "premier" && (
                  <motion.button
                    onClick={handleAddGuest}
                    disabled={guestLoading || isSoldOut}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-[#F5E6D3] font-semibold text-base tracking-wide transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50 cursor-pointer"
                  >
                    {guestLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[#C8A97E]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        +1 Guest
                      </span>
                    )}
                  </motion.button>
                )}

                {/* Live event */}
                {event.live_status === "active" && (
                  <Link
                    href={`/dashboard/events/${slug}/live`}
                    className="flex-1 py-4 rounded-xl bg-[#0C0C0D] border border-white/20 text-[#F5E6D3] font-semibold text-base text-center tracking-wide hover:bg-white/5 transition-colors animate-pulse"
                  >
                    Join Live Event
                  </Link>
                )}

                {/* Double Take - only for Social/Premier */}
                {event.double_take_open &&
                  (tier === "social" || tier === "premier") && (
                    <Link
                      href={`/dashboard/events/${slug}/double-take`}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#C8A97E] to-[#B8956E] text-[#0C0C0D] font-semibold text-base text-center tracking-wide hover:shadow-lg hover:shadow-[#C8A97E]/20 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Open Double Take
                      </span>
                    </Link>
                  )}
              </>
            )}
          </div>

          {/* Tier info callout for free users */}
          {tier === "free" && !attending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-[#C8A97E]/5 to-transparent border border-[#C8A97E]/10 rounded-xl p-4"
            >
              <p className="text-sm text-[#BDB8B2]">
                <span className="text-[#C8A97E] font-semibold">
                  Save on events
                </span>{" "}
                -- Social members get 25% off every event. Premier members
                get 1 free event per month.{" "}
                <Link
                  href="/dashboard/profile"
                  className="text-[#C8A97E] underline underline-offset-2 hover:text-[#C8A97E]/80"
                >
                  Upgrade your membership
                </Link>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
