"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import ProfileCard from "@/components/ProfileCard";
import type { ProfileCardProfile } from "@/components/ProfileCard";

export default function DoubleTakePage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [profiles, setProfiles] = useState<ProfileCardProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState(0); // -1 skip, 1 select

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

      // Get attendees with full profile data (excluding self)
      const { data: attendeeData } = await supabase
        .from("event_attendees")
        .select(
          "profile_id, profiles(first_name, age, bio, interests, drinking, smoking, intentions, instagram, neighborhood, work, avatar_upload_path, verification_status)"
        )
        .eq("event_id", eventData.id)
        .neq("status", "cancelled")
        .neq("profile_id", user.id);

      if (attendeeData) {
        setProfiles(
          attendeeData.map((a) => {
            const p = a.profiles as unknown as Record<string, unknown> | null;
            return {
              id: a.profile_id,
              first_name: (p?.first_name as string) ?? "Someone",
              age: (p?.age as number) ?? undefined,
              bio: (p?.bio as string) ?? undefined,
              interests: (p?.interests as string[]) ?? undefined,
              drinking: (p?.drinking as string) ?? undefined,
              smoking: (p?.smoking as string) ?? undefined,
              intentions: (p?.intentions as string) ?? undefined,
              instagram: (p?.instagram as string) ?? undefined,
              neighborhood: (p?.neighborhood as string) ?? undefined,
              work: (p?.work as string) ?? undefined,
              avatar_upload_path: (p?.avatar_upload_path as string) ?? undefined,
              verification_status: (p?.verification_status as string) ?? undefined,
            };
          })
        );
      }
      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  const currentProfile = profiles[currentIndex] ?? null;
  const isFinished = currentIndex >= profiles.length;

  const advance = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrentIndex((prev) => prev + 1);
    },
    []
  );

  const handleSelect = useCallback(() => {
    if (!currentProfile) return;
    setSelected((prev) => new Set(prev).add(currentProfile.id));
    advance(1);
  }, [currentProfile, advance]);

  const handleSkip = useCallback(() => {
    advance(-1);
  }, [advance]);

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

  /* ---- Card animation variants ---- */
  const cardVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---- Already voted / submitted ---- */
  if (alreadyVoted || submitted) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gold"
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
        </div>
        <h2 className="font-serif text-2xl font-semibold text-white mb-3">
          {submitted ? "Selections locked in!" : "Already submitted"}
        </h2>
        <p className="text-white/40 max-w-sm mx-auto mb-8">
          Your Double Take selections are saved. You&apos;ll be notified of any
          mutual matches.
        </p>
        <Link
          href="/dashboard/matches"
          className="text-gold font-medium hover:text-gold/80 transition-colors"
        >
          View your matches &rarr;
        </Link>
      </div>
    );
  }

  /* ---- Summary view (review before submit) ---- */
  if (showSummary) {
    const selectedProfiles = profiles.filter((p) => selected.has(p.id));
    return (
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            setShowSummary(false);
            setCurrentIndex(0);
          }}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors mb-6"
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
          Start over
        </button>

        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-2">
            Review Selections
          </p>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            Your picks
          </h1>
          <p className="text-white/40 text-sm">
            {selectedProfiles.length === 0
              ? "You didn't select anyone this time."
              : `You selected ${selectedProfiles.length} ${selectedProfiles.length === 1 ? "person" : "people"}.`}
          </p>
        </div>

        {selectedProfiles.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {selectedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="compact"
                selected
              />
            ))}
          </div>
        )}

        <motion.button
          onClick={handleSubmit}
          disabled={selected.size === 0 || submitting}
          whileHover={{ scale: selected.size > 0 ? 1.015 : 1 }}
          whileTap={{ scale: selected.size > 0 ? 0.985 : 1 }}
          className={`w-full py-4 rounded-xl font-semibold text-base tracking-wide transition-all shadow-lg cursor-pointer ${
            selected.size > 0
              ? "bg-gold text-white hover:bg-gold/90 shadow-gold/15"
              : "bg-white/10 text-white/30 cursor-not-allowed shadow-none"
          }`}
        >
          {submitting
            ? "Submitting..."
            : selected.size === 0
              ? "No selections to submit"
              : `Lock in ${selected.size} selection${selected.size > 1 ? "s" : ""}`}
        </motion.button>
      </div>
    );
  }

  /* ---- Main swipe-through UI ---- */
  return (
    <div className="max-w-md mx-auto">
      <Link
        href={`/dashboard/events/${slug}`}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors mb-6"
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
        Back to Event
      </Link>

      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-2">
          Double Take
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
          Who caught your eye?
        </h1>
        <p className="text-white/40 text-sm">
          {eventName} &middot; Swipe through and pick who you&apos;d like to
          connect with.
        </p>
      </div>

      {/* Progress bar */}
      {profiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] text-white/30 mb-1.5">
            <span>
              {Math.min(currentIndex + 1, profiles.length)} of{" "}
              {profiles.length}
            </span>
            <span>{selected.size} selected</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={false}
              animate={{
                width: `${((currentIndex + 1) / profiles.length) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
          <p className="text-white/40">No other attendees to show yet.</p>
        </div>
      ) : isFinished ? (
        /* All profiles reviewed */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gold"
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
          </div>
          <h2 className="font-serif text-xl font-bold text-white mb-2">
            All done!
          </h2>
          <p className="text-white/40 text-sm mb-8">
            You selected {selected.size}{" "}
            {selected.size === 1 ? "person" : "people"}.
          </p>
          <motion.button
            onClick={() => setShowSummary(true)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="w-full py-4 rounded-xl bg-gold text-white font-semibold text-base tracking-wide shadow-lg shadow-gold/15 cursor-pointer hover:bg-gold/90 transition-colors"
          >
            Review &amp; Submit
          </motion.button>
        </motion.div>
      ) : (
        /* Card stack */
        <>
          <div className="relative min-h-[520px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentProfile?.id}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {currentProfile && (
                  <ProfileCard
                    profile={currentProfile}
                    variant="full"
                    selected={selected.has(currentProfile.id)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action buttons (Hinge-style X and checkmark) */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {/* Skip button */}
            <motion.button
              type="button"
              onClick={handleSkip}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            {/* Select button */}
            <motion.button
              type="button"
              onClick={handleSelect}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-white shadow-lg shadow-gold/20 hover:bg-gold/90 transition-colors cursor-pointer"
            >
              <svg
                className="w-9 h-9"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
