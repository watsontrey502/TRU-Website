"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventPhase, LiveStatus } from "@/lib/types/live-event";

interface AttendeeRow {
  profile_id: string;
  status: string;
  profiles: { first_name: string; last_name: string } | null;
}

interface EventState {
  id: string;
  slug: string;
  name: string;
  phases: EventPhase[];
  current_phase_index: number;
  phase_started_at: string | null;
  phase_paused: boolean;
  phase_remaining_seconds: number | null;
  live_status: LiveStatus;
  double_take_open: boolean;
}

export default function HostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [event, setEvent] = useState<EventState | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  const loadEvent = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select("id, slug, name, phases, current_phase_index, phase_started_at, phase_paused, phase_remaining_seconds, live_status, double_take_open")
      .eq("slug", slug)
      .single();

    if (data) setEvent(data as unknown as EventState);
    return data;
  }, [slug, supabase]);

  const loadAttendees = useCallback(async (eventId: string) => {
    const { data } = await supabase
      .from("event_attendees")
      .select("profile_id, status, profiles(first_name, last_name)")
      .eq("event_id", eventId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (data) setAttendees(data as unknown as AttendeeRow[]);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const eventData = await loadEvent();
      if (eventData) await loadAttendees(eventData.id);
      setLoading(false);
    }
    init();
  }, [loadEvent, loadAttendees]);

  // Subscribe to realtime updates on this event
  useEffect(() => {
    if (!event?.id) return;

    const channel = supabase
      .channel(`host-${event.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${event.id}` },
        (payload) => {
          setEvent((prev) => prev ? { ...prev, ...payload.new } as unknown as EventState : prev);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [event?.id, supabase]);

  // Timer countdown
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

  const callApi = async (endpoint: string, body?: Record<string, unknown>) => {
    const res = await fetch(`/api/events/${slug}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    return res;
  };

  const handleCheckIn = async (profileId: string) => {
    setActionLoading(`checkin-${profileId}`);
    await callApi("check-in", { profileId });
    if (event) await loadAttendees(event.id);
    setActionLoading(null);
  };

  const handlePhaseAction = async (action: string, extra?: Record<string, unknown>) => {
    setActionLoading(action);
    await callApi("phases", { action, ...extra });
    await loadEvent();
    setActionLoading(null);
  };

  const handleGenerateGroups = async () => {
    setActionLoading("groups");
    await callApi("generate-groups");
    setActionLoading(null);
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const phases = event.phases ?? [];
  const currentPhase = phases[event.current_phase_index];
  const checkedIn = attendees.filter((a) => a.status === "checked_in").length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 text-white">
      {/* Header */}
      <div className="mb-6">
        <p className="text-copper text-xs uppercase tracking-[0.15em] font-medium mb-1">Host Controls</p>
        <h1 className="font-serif text-2xl font-semibold">{event.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            event.live_status === "active"
              ? "bg-green-500/20 text-green-400"
              : event.live_status === "ended"
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-500/20 text-gray-400"
          }`}>
            {event.live_status === "active" ? "LIVE" : event.live_status === "ended" ? "ENDED" : "NOT STARTED"}
          </span>
          <span className="text-gray-400 text-xs">{checkedIn}/{attendees.length} checked in</span>
        </div>
      </div>

      {/* Current Phase Card */}
      {event.live_status === "active" && currentPhase && (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Phase {event.current_phase_index + 1} of {phases.length}
              </p>
              <h2 className="font-serif text-lg font-semibold">{currentPhase.name}</h2>
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${
              currentPhase.type === "grouped" ? "bg-blue-500/20 text-blue-400" :
              currentPhase.type === "checkin" ? "bg-yellow-500/20 text-yellow-400" :
              currentPhase.type === "mingle" ? "bg-purple-500/20 text-purple-400" :
              "bg-copper/20 text-copper"
            }`}>
              {currentPhase.type}
            </span>
          </div>

          {/* Timer */}
          {timer !== null && (
            <div className="text-center my-4">
              <span className={`font-mono text-4xl font-bold ${timer <= 60 ? "text-red-400" : "text-white"}`}>
                {formatTime(timer)}
              </span>
              {event.phase_paused && <p className="text-yellow-400 text-xs mt-1">PAUSED</p>}
            </div>
          )}

          {/* Phase prompt */}
          {currentPhase.prompt && (
            <p className="text-gray-400 text-sm italic mb-4">&ldquo;{currentPhase.prompt}&rdquo;</p>
          )}

          {/* Phase progress dots */}
          <div className="flex gap-1.5 mb-5">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < event.current_phase_index
                    ? "bg-copper"
                    : i === event.current_phase_index
                      ? "bg-copper animate-pulse"
                      : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Control buttons */}
          <div className="grid grid-cols-2 gap-3">
            {event.phase_paused ? (
              <button
                onClick={() => handlePhaseAction("resume")}
                disabled={actionLoading === "resume"}
                className="py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={() => handlePhaseAction("pause")}
                disabled={actionLoading === "pause"}
                className="py-3 rounded-xl bg-yellow-600 text-white font-medium text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Pause
              </button>
            )}
            <button
              onClick={() => handlePhaseAction("extend", { extraMinutes: 5 })}
              disabled={actionLoading === "extend"}
              className="py-3 rounded-xl bg-gray-700 text-white font-medium text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              +5 min
            </button>
            <button
              onClick={() => handlePhaseAction("advance")}
              disabled={actionLoading === "advance"}
              className="col-span-2 py-3 rounded-xl bg-copper text-white font-semibold text-sm hover:bg-copper-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {event.current_phase_index + 1 >= phases.length ? "End Event" : "Next Phase →"}
            </button>
          </div>
        </div>
      )}

      {/* Start / Generate Groups buttons */}
      {event.live_status === "not_started" && (
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGenerateGroups}
            disabled={actionLoading === "groups" || checkedIn === 0}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {actionLoading === "groups" ? "Generating..." : `Generate Groups (${checkedIn} checked in)`}
          </button>
          <button
            onClick={() => handlePhaseAction("start")}
            disabled={actionLoading === "start"}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-semibold text-base hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Start Event
          </button>
        </div>
      )}

      {event.live_status === "active" && (
        <button
          onClick={handleGenerateGroups}
          disabled={actionLoading === "groups" || checkedIn === 0}
          className="w-full py-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium text-sm hover:bg-blue-600/30 transition-colors disabled:opacity-50 cursor-pointer mb-6"
        >
          {actionLoading === "groups" ? "Regenerating..." : "Regenerate Groups"}
        </button>
      )}

      {/* Phase Timeline */}
      {phases.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Timeline</h3>
          <div className="space-y-2">
            {phases.map((phase, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                  i === event.current_phase_index && event.live_status === "active"
                    ? "bg-copper/10 border border-copper/30"
                    : i < event.current_phase_index && event.live_status === "active"
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  i === event.current_phase_index && event.live_status === "active"
                    ? "bg-copper text-white"
                    : i < event.current_phase_index && event.live_status === "active"
                      ? "bg-gray-700 text-gray-500"
                      : "bg-gray-800 text-gray-500"
                }`}>
                  {i < event.current_phase_index && event.live_status === "active" ? "✓" : i + 1}
                </span>
                <span className="flex-1">{phase.name}</span>
                <span className="text-xs text-gray-500">{phase.duration_minutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendees List */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
          Attendees ({attendees.length})
        </h3>
        {attendees.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No RSVPs yet</p>
        ) : (
          <div className="space-y-2">
            {attendees.map((a) => {
              const name = a.profiles
                ? `${(a.profiles as unknown as { first_name: string; last_name: string }).first_name} ${(a.profiles as unknown as { first_name: string; last_name: string }).last_name}`
                : "Unknown";
              const isCheckedIn = a.status === "checked_in";

              return (
                <div key={a.profile_id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCheckedIn ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                    }`}>
                      {name[0]}
                    </div>
                    <span className="text-sm">{name}</span>
                  </div>
                  {isCheckedIn ? (
                    <span className="text-green-400 text-xs font-medium">Checked In</span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(a.profile_id)}
                      disabled={actionLoading === `checkin-${a.profile_id}`}
                      className="px-3 py-1.5 rounded-lg bg-copper/20 text-copper text-xs font-medium hover:bg-copper/30 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Check In
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
