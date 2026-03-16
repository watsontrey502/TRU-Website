"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { EventPhase, LiveStatus, GroupMember } from "@/lib/types/live-event";

interface EventState {
  id: string;
  slug: string;
  name: string;
  venue: string;
  phases: EventPhase[];
  current_phase_index: number;
  phase_started_at: string | null;
  phase_paused: boolean;
  phase_remaining_seconds: number | null;
  live_status: LiveStatus;
  double_take_open: boolean;
}

export default function LiveEventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [event, setEvent] = useState<EventState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myGroup, setMyGroup] = useState<GroupMember[]>([]);
  const [myGroupNumber, setMyGroupNumber] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroup = useCallback(async (eventId: string, phaseIndex: number, uid: string) => {
    // Get my group assignment for this phase
    const { data: myAssignment } = await supabase
      .from("event_round_groups")
      .select("group_number")
      .eq("event_id", eventId)
      .eq("phase_index", phaseIndex)
      .eq("profile_id", uid)
      .maybeSingle();

    if (!myAssignment) {
      setMyGroup([]);
      setMyGroupNumber(null);
      return;
    }

    setMyGroupNumber(myAssignment.group_number);

    // Get all members of my group
    const { data: groupMembers } = await supabase
      .from("event_round_groups")
      .select("profile_id, group_number, profiles(first_name)")
      .eq("event_id", eventId)
      .eq("phase_index", phaseIndex)
      .eq("group_number", myAssignment.group_number);

    if (groupMembers) {
      setMyGroup(
        groupMembers
          .filter((m) => m.profile_id !== uid)
          .map((m) => ({
            profile_id: m.profile_id,
            first_name: (m.profiles as unknown as { first_name: string })?.first_name ?? "?",
            group_number: m.group_number,
          }))
      );
    }
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("events")
        .select("id, slug, name, venue, phases, current_phase_index, phase_started_at, phase_paused, phase_remaining_seconds, live_status, double_take_open")
        .eq("slug", slug)
        .single();

      if (data) {
        const ev = data as unknown as EventState;
        setEvent(ev);

        const phases = ev.phases ?? [];
        const current = phases[ev.current_phase_index];
        if (current?.type === "grouped" && ev.live_status === "active") {
          await loadGroup(ev.id, ev.current_phase_index, user.id);
        }
      }

      setLoading(false);
    }
    init();
  }, [slug, supabase, loadGroup]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!event?.id) return;

    const channel = supabase
      .channel(`live-${event.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${event.id}` },
        (payload) => {
          const updated = payload.new as unknown as EventState;
          setEvent((prev) => {
            if (!prev) return prev;
            const merged = { ...prev, ...updated };

            // If phase changed, reload group
            if (updated.current_phase_index !== prev.current_phase_index && userId) {
              const phases = (merged.phases ?? []) as EventPhase[];
              const newPhase = phases[updated.current_phase_index];
              if (newPhase?.type === "grouped") {
                loadGroup(prev.id, updated.current_phase_index, userId);
              } else {
                setMyGroup([]);
                setMyGroupNumber(null);
              }
            }

            return merged;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [event?.id, userId, supabase, loadGroup]);

  // Timer
  useEffect(() => {
    if (!event) return;

    if (event.phase_paused) {
      setTimer(event.phase_remaining_seconds ?? 0);
      return;
    }

    if (event.live_status !== "active" || !event.phase_started_at) {
      setTimer(null);
      return;
    }

    const phases = event.phases ?? [];
    const current = phases[event.current_phase_index];
    if (!current) return;

    const totalMs = current.duration_minutes * 60 * 1000;
    const startMs = new Date(event.phase_started_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((startMs + totalMs - Date.now()) / 1000));
      setTimer(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif text-2xl font-semibold text-black mb-4">Event not found</h1>
        <Link href="/dashboard" className="text-gold font-medium">Back to dashboard</Link>
      </div>
    );
  }

  const phases = event.phases ?? [];
  const currentPhase = phases[event.current_phase_index];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Not started yet
  if (event.live_status === "not_started") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-black mb-2">{event.name}</h1>
        <p className="text-stone mb-1">{event.venue}</p>
        <p className="text-stone text-sm">The event hasn&apos;t started yet. Hang tight!</p>
        <div className="mt-8">
          <div className="w-3 h-3 rounded-full bg-gold/40 animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  // Event ended
  if (event.live_status === "ended") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-black mb-2">Thanks for coming!</h1>
        <p className="text-stone mb-6">Hope you made some great connections tonight.</p>
        {event.double_take_open && (
          <Link
            href={`/dashboard/events/${slug}/double-take`}
            className="inline-block px-6 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold transition-colors"
          >
            Open Double Take
          </Link>
        )}
      </div>
    );
  }

  // Live — show current phase
  return (
    <div className="max-w-md mx-auto">
      <Link href={`/dashboard/events/${slug}`} className="inline-flex items-center gap-2 text-stone hover:text-black text-sm font-medium transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Event Details
      </Link>

      {/* Phase progress dots */}
      <div className="flex gap-1.5 mb-6">
        {phases.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < event.current_phase_index
                ? "bg-gold"
                : i === event.current_phase_index
                  ? "bg-gold animate-pulse"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Main phase card */}
      {currentPhase && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
          {/* Phase header */}
          <div className="bg-black px-6 py-5">
            <p className="text-sand text-xs uppercase tracking-[0.15em] font-medium mb-1">
              {event.name}
            </p>
            <h1 className="font-serif text-2xl font-semibold text-white">
              {currentPhase.name}
            </h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Timer */}
            {timer !== null && (
              <div className="text-center">
                <span className={`font-mono text-5xl font-bold ${
                  timer <= 60 ? "text-red-500" : timer <= 180 ? "text-gold" : "text-black"
                }`}>
                  {formatTime(timer)}
                </span>
                {event.phase_paused && (
                  <p className="text-gold text-xs font-medium mt-1">PAUSED</p>
                )}
              </div>
            )}

            {/* Prompt */}
            {currentPhase.prompt && (
              <div className="bg-cream rounded-xl p-4 text-center">
                <p className="text-black font-medium italic">
                  &ldquo;{currentPhase.prompt}&rdquo;
                </p>
              </div>
            )}

            {/* Group assignment */}
            {currentPhase.type === "grouped" && myGroup.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-stone font-medium mb-3 text-center">
                  Your Group {myGroupNumber ? `(#${myGroupNumber})` : ""}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {myGroup.map((member) => (
                    <div key={member.profile_id} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                        <span className="text-gold font-serif font-bold text-lg">
                          {member.first_name[0]}
                        </span>
                      </div>
                      <span className="text-black text-sm font-medium">{member.first_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Double Take link */}
            {currentPhase.type === "double_take" && event.double_take_open && (
              <Link
                href={`/dashboard/events/${slug}/double-take`}
                className="block w-full py-4 rounded-xl bg-gold text-white font-semibold text-center text-base tracking-wide hover:bg-gold transition-colors shadow-lg shadow-gold/15"
              >
                Open Double Take
              </Link>
            )}

            {/* Mingle message */}
            {currentPhase.type === "mingle" && (
              <div className="text-center">
                <p className="text-stone text-sm">
                  No assigned groups — mingle freely!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase list */}
      <div className="mt-6 space-y-2">
        {phases.map((phase, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
              i === event.current_phase_index
                ? "bg-gold/5 border border-gold/20 text-black font-medium"
                : i < event.current_phase_index
                  ? "text-stone line-through"
                  : "text-stone"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
              i === event.current_phase_index
                ? "bg-gold text-white"
                : i < event.current_phase_index
                  ? "bg-gray-200 text-gray-400"
                  : "bg-gray-100 text-gray-400"
            }`}>
              {i < event.current_phase_index ? "✓" : i + 1}
            </span>
            <span className="flex-1">{phase.name}</span>
            <span className="text-xs">{phase.duration_minutes}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
