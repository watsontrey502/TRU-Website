"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Profile {
  first_name: string;
  last_name: string;
  status: string;
  subscription_tier: string;
  subscription_status: string;
  verification_status: string;
  onboarding_completed: boolean;
}

interface EventRow {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string;
  price: number;
  age_range: string;
  image_url: string;
  capacity: number;
  double_take_open: boolean;
}

interface MatchRow {
  event_id: string;
  matched_user_id: string;
  matched_first_name: string;
  matched_instagram: string;
  event_name: string;
  matched_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  social: "Social",
  premier: "Premier",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-white/10 text-[#BDB8B2] border border-white/10",
  social: "bg-gold/15 text-gold border border-gold/20",
  premier:
    "bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold border border-gold/30",
};

const VERIFICATION_LABELS: Record<string, { label: string; color: string; icon: "shield" | "clock" | "check" | "x" }> = {
  unverified:          { label: "Unverified",              color: "bg-red-500/10 text-red-400",       icon: "x" },
  id_uploaded:         { label: "ID Under Review",         color: "bg-yellow-500/10 text-yellow-400", icon: "clock" },
  id_approved:         { label: "ID Approved",             color: "bg-blue-500/10 text-blue-400",     icon: "shield" },
  background_pending:  { label: "Background Check Pending",color: "bg-yellow-500/10 text-yellow-400", icon: "clock" },
  verified:            { label: "Verified",                color: "bg-emerald-500/10 text-emerald-400",icon: "check" },
  rejected:            { label: "Rejected",                color: "bg-red-500/10 text-red-400",       icon: "x" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format "2026-04-12" into "Sat, Apr 12" */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format "18:30:00" or "6:30 PM" into "6:30 PM" */
function formatTime(raw: string): string {
  if (!raw) return "";
  // Already formatted
  if (raw.includes("AM") || raw.includes("PM")) return raw;
  try {
    const [h, m] = raw.split(":");
    const date = new Date();
    date.setHours(Number(h), Number(m));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

/** Tier-aware price display */
function tierPrice(
  price: number,
  tier: string,
  premierFreeUsed: boolean,
): React.ReactNode {
  if (tier === "premier" && !premierFreeUsed) {
    return <span className="text-gold font-semibold">Included</span>;
  }
  if (tier === "premier" || tier === "social") {
    const discounted = Math.round(price * 0.75);
    return (
      <span className="text-gold font-semibold">
        ${discounted}{" "}
        <span className="text-[#BDB8B2] line-through text-xs ml-0.5">
          ${price}
        </span>
      </span>
    );
  }
  return <span className="text-champagne font-semibold">${price}</span>;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  href,
  accent,
  pulse,
  subtext,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
  accent?: boolean;
  pulse?: boolean;
  subtext?: string;
}) {
  const inner = (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
        accent
          ? "bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 hover:border-gold/40"
          : "bg-[#1A1A1D] border border-white/10 hover:border-white/20"
      }`}
    >
      <p className={`text-xs mb-1 ${accent ? "text-gold" : "text-[#BDB8B2]"}`}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        {typeof value === "string" || typeof value === "number" ? (
          <p className="text-champagne text-2xl font-semibold font-serif">
            {value}
          </p>
        ) : (
          value
        )}
        {pulse && (
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        )}
      </div>
      {subtext && (
        <p className="text-gold text-xs font-semibold mt-0.5">{subtext}</p>
      )}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function EventCard({
  event,
  tier,
  premierFreeUsed,
  isAttending,
}: {
  event: EventRow;
  tier: string;
  premierFreeUsed: boolean;
  isAttending: boolean;
}) {
  return (
    <Link href={`/dashboard/events/${event.slug}`}>
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="group bg-[#1A1A1D] rounded-2xl border border-white/10 hover:border-gold/25 transition-all overflow-hidden h-full"
      >
        {/* Image */}
        {event.image_url && (
          <div className="relative h-36 w-full overflow-hidden">
            <Image
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1D] via-transparent to-transparent" />
            {isAttending && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm">
                <svg
                  className="w-3 h-3"
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
                Going
              </span>
            )}
          </div>
        )}

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide mb-1.5 text-gold">
            {formatDate(event.date)} &middot; {formatTime(event.time)}
          </p>
          <h3 className="font-serif text-lg font-semibold text-champagne mb-1 leading-snug">
            {event.name}
          </h3>
          <p className="text-[#BDB8B2] text-sm">
            {event.venue} &middot; {event.neighborhood}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {event.double_take_open && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gold/10 text-gold">
                Double Take Open
              </span>
            )}
            {event.age_range && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#BDB8B2]">
                {event.age_range}
              </span>
            )}
          </div>

          {/* Price + CTA */}
          {!isAttending && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <span className="text-sm">
                {tierPrice(event.price, tier, premierFreeUsed)}
              </span>
              <span className="text-gold text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                RSVP &rarr;
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function MatchCard({ match }: { match: MatchRow }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-[#1A1A1D] rounded-2xl p-5 border border-white/10 hover:border-gold/20 transition-all text-center"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-3 ring-2 ring-gold/10">
        <span className="text-gold font-serif font-bold text-xl">
          {match.matched_first_name?.[0] ?? "?"}
        </span>
      </div>
      <h3 className="font-semibold text-champagne text-sm">
        {match.matched_first_name ?? "Someone"}
      </h3>
      <p className="text-[#BDB8B2] text-xs mt-1 truncate">{match.event_name}</p>
      {match.matched_instagram && (
        <p className="text-[#BDB8B2]/60 text-[10px] mt-0.5">
          @{match.matched_instagram}
        </p>
      )}
      <Link
        href="/dashboard/messages"
        className="inline-flex items-center mt-3 px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
      >
        Send a message &rarr;
      </Link>
    </motion.div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="bg-[#1A1A1D] rounded-2xl p-10 border border-white/10 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-champagne font-medium text-sm mb-1">{title}</p>
      <p className="text-[#BDB8B2] text-sm max-w-sm mx-auto">{description}</p>
      {cta && href && (
        <Link
          href={href}
          className="inline-flex items-center mt-4 px-4 py-2 rounded-full text-sm font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
        >
          {cta} &rarr;
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventRow[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchRow[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [premierFreeUsed, setPremierFreeUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, status, subscription_tier, subscription_status, verification_status, onboarding_completed",
        )
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Events I'm attending
      const { data: myAttendances } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("profile_id", user.id)
        .neq("status", "cancelled");

      const myEventIds = myAttendances?.map((a) => a.event_id) ?? [];

      // All upcoming events
      const { data: allEvents } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (allEvents) {
        setUpcomingEvents(allEvents.filter((e) => myEventIds.includes(e.id)));
        setAvailableEvents(
          allEvents.filter((e) => !myEventIds.includes(e.id)),
        );
      }

      // Recent matches
      try {
        const matchRes = await fetch("/api/matches");
        if (matchRes.ok) {
          const { matches: allMatches } = await matchRes.json();
          setRecentMatches((allMatches ?? []).slice(0, 3));
        }
      } catch {
        /* non-critical */
      }

      // Premier free ticket tracking
      if (profileData?.subscription_tier === "premier") {
        const now = new Date();
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
        const { count } = await supabase
          .from("ticket_purchases")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .eq("purchase_type", "premier_included")
          .gte("created_at", monthStart);
        setPremierFreeUsed((count ?? 0) > 0);
      }

      // Unread messages
      try {
        const msgRes = await fetch("/api/messages");
        if (msgRes.ok) {
          const { conversations } = await msgRes.json();
          const total = (conversations ?? []).reduce(
            (sum: number, c: { unread_count: number }) =>
              sum + (c.unread_count ?? 0),
            0,
          );
          setUnreadMessages(total);
        }
      } catch {
        /* non-critical */
      }

      setLoading(false);
    }
    load();
  }, [supabase]);

  const tier = profile?.subscription_tier ?? "free";
  const verification = profile?.verification_status ?? "unverified";
  const verificationInfo =
    VERIFICATION_LABELS[verification] ?? VERIFICATION_LABELS.unverified;

  /* Greeting based on time of day */
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Loading skeleton (inline, lightweight)                           */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-9 w-72 bg-white/5 rounded-lg mb-3" />
        <div className="h-5 w-48 bg-white/5 rounded-lg mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white/5 rounded-2xl border border-white/5"
            />
          ))}
        </div>
        <div className="h-6 w-48 bg-white/5 rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-2xl border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* -------------------------------------------------------- */}
        {/*  Welcome header                                          */}
        {/* -------------------------------------------------------- */}
        <motion.div
          className="mb-10"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-3">
            {greeting}
            {profile?.first_name ? `, ${profile.first_name}` : ""}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {/* Tier badge */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier] ?? TIER_COLORS.free}`}
            >
              {tier === "premier" && (
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {TIER_LABELS[tier] ?? "Free"} Member
            </span>
            {/* Verification badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${verificationInfo.color}`}
            >
              {verificationInfo.icon === "check" && (
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              )}
              {verificationInfo.icon === "clock" && (
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {verificationInfo.label}
            </span>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Quick stats row                                          */}
        {/* -------------------------------------------------------- */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <StatCard
            label="Upcoming Events"
            value={upcomingEvents.length}
          />
          <StatCard
            label="Unread Messages"
            value={unreadMessages}
            href="/dashboard/messages"
            pulse={unreadMessages > 0}
          />
          <StatCard
            label="Matches"
            value={recentMatches.length}
            href="/dashboard/matches"
          />
          {tier === "social" && (
            <StatCard
              label="Event Discount"
              value={
                <p className="text-gold text-sm font-semibold">25% off events</p>
              }
            />
          )}
          {tier === "premier" && (
            <StatCard
              label="Free Ticket"
              value={
                <p className="text-gold text-sm font-semibold">
                  {premierFreeUsed ? "Used this month" : "1 available"}
                </p>
              }
            />
          )}
          {tier === "free" && (
            <StatCard
              label="Upgrade"
              value={
                <p className="text-champagne text-sm font-semibold">
                  Get more with Social
                </p>
              }
              href="/membership"
              accent
            />
          )}
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Verification prompt                                      */}
        {/* -------------------------------------------------------- */}
        {(verification === "unverified" || verification === "rejected") && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <Link href="/dashboard/profile" className="block mb-8">
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-center gap-4 hover:border-yellow-500/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-yellow-400 font-medium text-sm">
                    {verification === "rejected"
                      ? "Verification was not approved"
                      : "Complete your verification"}
                  </p>
                  <p className="text-[#BDB8B2] text-xs mt-0.5">
                    {verification === "rejected"
                      ? "Please re-upload a valid photo ID to continue."
                      : "Upload your ID to get verified and unlock all features."}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-[#BDB8B2] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </motion.div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Upcoming events (RSVPd)                                   */}
        {/* -------------------------------------------------------- */}
        <motion.section
          className="mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-champagne">
              Your Upcoming Events
            </h2>
            {upcomingEvents.length > 0 && (
              <span className="text-[#BDB8B2] text-xs">
                {upcomingEvents.length} event
                {upcomingEvents.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-6 h-6 text-[#BDB8B2]"
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
              }
              title="No upcoming events"
              description="Browse events below and RSVP to your first one. Nashville is waiting."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  tier={tier}
                  premierFreeUsed={premierFreeUsed}
                  isAttending
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* -------------------------------------------------------- */}
        {/*  Available events                                          */}
        {/* -------------------------------------------------------- */}
        <motion.section
          className="mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-champagne">
              Available Events
            </h2>
            {tier !== "free" && (
              <span className="text-gold text-xs font-medium">
                {tier === "premier"
                  ? "1 free + 25% off extras"
                  : "25% off all events"}
              </span>
            )}
          </div>

          {availableEvents.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-6 h-6 text-[#BDB8B2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
              title="No events available right now"
              description="We're planning something special. Check back soon for upcoming events."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  tier={tier}
                  premierFreeUsed={premierFreeUsed}
                  isAttending={false}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* -------------------------------------------------------- */}
        {/*  Recent matches                                            */}
        {/* -------------------------------------------------------- */}
        <motion.section
          className="mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-champagne">
              Recent Matches
            </h2>
            {recentMatches.length > 0 && (
              <Link
                href="/dashboard/matches"
                className="text-gold text-sm font-medium hover:underline underline-offset-4 transition-colors"
              >
                View all &rarr;
              </Link>
            )}
          </div>

          {recentMatches.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-6 h-6 text-[#BDB8B2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
              title="No matches yet"
              description="Attend an event with Double Take and start connecting with other members."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentMatches.map((match, i) => (
                <MatchCard key={`${match.matched_user_id}-${i}`} match={match} />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
