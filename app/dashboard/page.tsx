"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

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

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  social: "Social",
  premier: "Premier",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-white/10 text-[#BDB8B2]",
  social: "bg-gold/15 text-gold",
  premier: "bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold",
};

const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "bg-red-500/10 text-red-400" },
  id_uploaded: { label: "ID Under Review", color: "bg-yellow-500/10 text-yellow-400" },
  id_approved: { label: "ID Approved", color: "bg-blue-500/10 text-blue-400" },
  background_pending: { label: "Background Check Pending", color: "bg-yellow-500/10 text-yellow-400" },
  verified: { label: "Verified", color: "bg-emerald-500/10 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400" },
};

export default function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventRow[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchRow[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile with new fields
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, status, subscription_tier, subscription_status, verification_status, onboarding_completed")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Load events I'm attending
      const { data: myAttendances } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("profile_id", user.id)
        .neq("status", "cancelled");

      const myEventIds = myAttendances?.map((a) => a.event_id) ?? [];

      // Load all events
      const { data: allEvents } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (allEvents) {
        setUpcomingEvents(allEvents.filter((e) => myEventIds.includes(e.id)));
        setAvailableEvents(allEvents.filter((e) => !myEventIds.includes(e.id)));
      }

      // Load recent matches via API
      try {
        const matchRes = await fetch("/api/matches");
        if (matchRes.ok) {
          const { matches: allMatches } = await matchRes.json();
          setRecentMatches((allMatches ?? []).slice(0, 3));
        }
      } catch { /* non-critical */ }

      // Load unread message count
      try {
        const msgRes = await fetch("/api/messages");
        if (msgRes.ok) {
          const { conversations } = await msgRes.json();
          const total = (conversations ?? []).reduce(
            (sum: number, c: { unread_count: number }) => sum + (c.unread_count ?? 0),
            0
          );
          setUnreadMessages(total);
        }
      } catch { /* non-critical */ }

    }
    load();
  }, [supabase]);

  const tier = profile?.subscription_tier ?? "free";
  const verification = profile?.verification_status ?? "unverified";
  const verificationInfo = VERIFICATION_LABELS[verification] ?? VERIFICATION_LABELS.unverified;

  return (
    <>
      {/* Welcome + Status */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-3">
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier] ?? TIER_COLORS.free}`}>
            {TIER_LABELS[tier] ?? "Free"} Member
          </span>
          {/* Verification badge */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${verificationInfo.color}`}>
            {verification === "verified" && (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
            {verificationInfo.label}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-4">
          <p className="text-[#BDB8B2] text-xs mb-1">Upcoming Events</p>
          <p className="text-champagne text-2xl font-semibold font-serif">{upcomingEvents.length}</p>
        </div>
        <Link href="/dashboard/messages" className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-4 hover:border-gold/30 transition-colors">
          <p className="text-[#BDB8B2] text-xs mb-1">Unread Messages</p>
          <div className="flex items-center gap-2">
            <p className="text-champagne text-2xl font-semibold font-serif">{unreadMessages}</p>
            {unreadMessages > 0 && (
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            )}
          </div>
        </Link>
        <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-4">
          <p className="text-[#BDB8B2] text-xs mb-1">Matches</p>
          <p className="text-champagne text-2xl font-semibold font-serif">{recentMatches.length}</p>
        </div>
        {tier === "social" && (
          <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-4">
            <p className="text-[#BDB8B2] text-xs mb-1">Event Discount</p>
            <p className="text-gold text-sm font-semibold">25% off events</p>
          </div>
        )}
        {tier === "premier" && (
          <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-4">
            <p className="text-[#BDB8B2] text-xs mb-1">Access</p>
            <p className="text-gold text-sm font-semibold">Unlimited Events</p>
          </div>
        )}
        {tier === "free" && (
          <Link href="/dashboard/profile" className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-2xl p-4 hover:border-gold/40 transition-colors">
            <p className="text-gold text-xs mb-1">Upgrade</p>
            <p className="text-champagne text-sm font-semibold">Get more with Social</p>
          </Link>
        )}
      </div>

      {/* Verification prompt */}
      {verification === "unverified" && (
        <Link href="/dashboard/profile" className="block mb-8">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-center gap-4 hover:border-yellow-500/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-400 font-medium text-sm">Complete your verification</p>
              <p className="text-[#BDB8B2] text-xs mt-0.5">Upload your ID to get verified and unlock all features.</p>
            </div>
            <svg className="w-5 h-5 text-[#BDB8B2] ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-semibold text-champagne mb-4">
          Your Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <div className="bg-[#1A1A1D] rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-[#BDB8B2] mb-4">No upcoming events yet.</p>
            <Link href="/dashboard" className="text-gold font-medium hover:text-gold transition-colors text-sm">
              Browse available events below
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.slug}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-[#1A1A1D] rounded-2xl p-5 border border-white/10 hover:border-gold/20 transition-all"
                >
                  <p className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
                    {event.date} &middot; {event.time}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-champagne mb-1">
                    {event.name}
                  </h3>
                  <p className="text-[#BDB8B2] text-sm">{event.venue} &middot; {event.neighborhood}</p>
                  {event.double_take_open && (
                    <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">
                      Double Take Open
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Available Events */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-semibold text-champagne mb-4">
          Available Events
        </h2>
        {availableEvents.length === 0 ? (
          <div className="bg-[#1A1A1D] rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-[#BDB8B2]">No upcoming events available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.slug}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-[#1A1A1D] rounded-2xl p-5 border border-white/10 hover:border-gold/20 transition-all"
                >
                  <p className="text-xs text-[#BDB8B2] font-medium uppercase tracking-wide mb-1">
                    {event.date} &middot; {event.time}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-champagne mb-1">
                    {event.name}
                  </h3>
                  <p className="text-[#BDB8B2] text-sm mb-3">{event.venue} &middot; {event.neighborhood}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-champagne font-semibold text-sm">
                      {tier === "premier" ? (
                        <span className="text-gold">Included</span>
                      ) : tier === "social" ? (
                        <span className="text-gold">${Math.round(event.price * 0.75)} <span className="text-[#BDB8B2] line-through text-xs">${event.price}</span></span>
                      ) : (
                        `$${event.price}`
                      )}
                    </span>
                    <span className="text-gold text-sm font-medium">RSVP &rarr;</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-champagne">
              Recent Matches
            </h2>
            <Link href="/dashboard/matches" className="text-gold text-sm font-medium hover:text-gold transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMatches.map((match, i) => (
              <div key={i} className="bg-[#1A1A1D] rounded-2xl p-5 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold font-serif font-bold text-lg">
                    {match.matched_first_name?.[0] ?? "?"}
                  </span>
                </div>
                <h3 className="font-semibold text-champagne text-sm">
                  {match.matched_first_name ?? "Someone"}
                </h3>
                <p className="text-[#BDB8B2] text-xs mt-1">{match.event_name}</p>
                <Link href="/dashboard/messages" className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-[10px] font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-colors">
                  Message &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
