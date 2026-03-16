"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  first_name: string;
  last_name: string;
  status: string;
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

export default function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventRow[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchRow[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, status")
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

      // Load recent matches via API (uses SECURITY DEFINER function)
      try {
        const matchRes = await fetch("/api/matches");
        if (matchRes.ok) {
          const { matches: allMatches } = await matchRes.json();
          setRecentMatches((allMatches ?? []).slice(0, 3));
        }
      } catch {
        // Matches are non-critical, don't block dashboard
      }
    }
    load();
  }, [supabase]);

  return (
    <>
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-2">
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-stone">Your TRU dashboard</p>
          {profile?.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.status === "approved"
                ? "bg-black/10 text-black"
                : profile.status === "pending"
                  ? "bg-gold/10 text-gold"
                  : "bg-red-50 text-red-600"
            }`}>
              {profile.status}
            </span>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-semibold text-black mb-4">
          Your Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-stone mb-4">No upcoming events yet.</p>
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
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
                >
                  <p className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
                    {event.date} &middot; {event.time}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-black mb-1">
                    {event.name}
                  </h3>
                  <p className="text-stone text-sm">{event.venue} &middot; {event.neighborhood}</p>
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
        <h2 className="font-serif text-xl font-semibold text-black mb-4">
          Available Events
        </h2>
        {availableEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-stone">No upcoming events available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.slug}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
                >
                  <p className="text-xs text-stone font-medium uppercase tracking-wide mb-1">
                    {event.date} &middot; {event.time}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-black mb-1">
                    {event.name}
                  </h3>
                  <p className="text-stone text-sm mb-3">{event.venue} &middot; {event.neighborhood}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-black font-semibold text-sm">${event.price}</span>
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
            <h2 className="font-serif text-xl font-semibold text-black">
              Recent Matches
            </h2>
            <Link href="/dashboard/matches" className="text-gold text-sm font-medium hover:text-gold transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMatches.map((match, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[var(--shadow-card)] text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold font-serif font-bold text-lg">
                    {match.matched_first_name?.[0] ?? "?"}
                  </span>
                </div>
                <h3 className="font-semibold text-black text-sm">
                  {match.matched_first_name ?? "Someone"}
                </h3>
                <p className="text-stone text-xs mt-1">{match.event_name}</p>
                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/10 text-black">
                  It&apos;s mutual!
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
