"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface AttendeeProfile {
  profile_id: string;
  first_name: string;
}

export default function DoubleTakePage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [attendees, setAttendees] = useState<AttendeeProfile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get event
      const { data: eventData } = await supabase
        .from("events")
        .select("id, name, double_take_open")
        .eq("slug", slug)
        .single();

      if (!eventData || !eventData.double_take_open) {
        setLoading(false);
        return;
      }
      setEventName(eventData.name);

      // Check if already voted
      const { data: existingVotes } = await supabase
        .from("double_take_votes")
        .select("id")
        .eq("event_id", eventData.id)
        .eq("voter_id", user.id)
        .limit(1);

      if (existingVotes && existingVotes.length > 0) {
        setAlreadyVoted(true);
        setLoading(false);
        return;
      }

      // Get attendees (excluding self)
      const { data: attendeeData } = await supabase
        .from("event_attendees")
        .select("profile_id, profiles(first_name)")
        .eq("event_id", eventData.id)
        .neq("status", "cancelled")
        .neq("profile_id", user.id);

      if (attendeeData) {
        setAttendees(
          attendeeData.map((a) => ({
            profile_id: a.profile_id,
            first_name: (a.profiles as unknown as { first_name: string })?.first_name ?? "Someone",
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${slug}/double-take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votedForIds: Array.from(selected) }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyVoted || submitted) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-black mb-3">
          {submitted ? "Selections locked in!" : "Already submitted"}
        </h2>
        <p className="text-stone max-w-sm mx-auto mb-8">
          Your Double Take selections are saved. You&apos;ll be notified of any mutual matches.
        </p>
        <Link href="/dashboard/matches" className="text-gold font-medium hover:text-gold transition-colors">
          View your matches &rarr;
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href={`/dashboard/events/${slug}`} className="inline-flex items-center gap-2 text-stone hover:text-black text-sm font-medium transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Event
      </Link>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-gold font-medium mb-2">
          Double Take
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mb-2">
          Who caught your eye?
        </h1>
        <p className="text-stone text-sm">
          {eventName} &middot; Select the people you&apos;d like to connect with. Your selections are private.
        </p>
      </div>

      {attendees.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-stone">No other attendees to show yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {attendees.map((attendee) => {
              const isSelected = selected.has(attendee.profile_id);
              return (
                <motion.button
                  key={attendee.profile_id}
                  type="button"
                  onClick={() => toggleSelection(attendee.profile_id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-2xl p-6 text-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? "bg-gold/5 border-gold shadow-lg shadow-gold/10"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Avatar initial */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                    isSelected ? "bg-gold text-white" : "bg-cream text-black"
                  }`}>
                    <span className="font-serif font-bold text-xl">
                      {attendee.first_name[0]}
                    </span>
                  </div>

                  <p className="font-semibold text-black text-sm">{attendee.first_name}</p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="sticky bottom-20 md:bottom-4">
            <motion.button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
              whileHover={{ scale: selected.size > 0 ? 1.015 : 1 }}
              whileTap={{ scale: selected.size > 0 ? 0.985 : 1 }}
              className={`w-full py-4 rounded-xl font-semibold text-base tracking-wide transition-all shadow-lg cursor-pointer ${
                selected.size > 0
                  ? "bg-gold text-white hover:bg-gold shadow-gold/15"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {submitting
                ? "Submitting..."
                : selected.size === 0
                  ? "Select someone to continue"
                  : `Lock in ${selected.size} selection${selected.size > 1 ? "s" : ""}`}
            </motion.button>
          </div>
        </>
      )}
    </>
  );
}
