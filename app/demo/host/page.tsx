"use client";

import { useEffect, useState, useCallback } from "react";
import { DEMO_ATTENDEES, DEMO_EVENT, DEMO_PHASES } from "@/lib/demo-data";
import type { DemoState } from "@/lib/demo-channel";
import { INITIAL_DEMO_STATE, broadcastDemoState, loadDemoState } from "@/lib/demo-channel";

export default function DemoHostPage() {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [timer, setTimer] = useState<number | null>(null);

  // On mount, restore from sessionStorage if available
  useEffect(() => {
    const saved = loadDemoState();
    if (saved) setState(saved);
  }, []);

  // Broadcast whenever state changes
  const updateState = useCallback((updater: (prev: DemoState) => DemoState) => {
    setState((prev) => {
      const next = updater(prev);
      broadcastDemoState(next);
      return next;
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (state.phase_paused) {
      setTimer(state.phase_remaining_seconds ?? 0);
      return;
    }

    if (state.live_status !== "active" || !state.phase_started_at) {
      setTimer(null);
      return;
    }

    const current = DEMO_PHASES[state.current_phase_index];
    if (!current) return;

    const totalMs = current.duration_minutes * 60 * 1000;
    const startMs = new Date(state.phase_started_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((startMs + totalMs - Date.now()) / 1000));
      setTimer(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const handleCheckInAll = () => {
    updateState((prev) => ({
      ...prev,
      checked_in_ids: DEMO_ATTENDEES.map((a) => a.id),
    }));
  };

  const handleCheckIn = (id: string) => {
    updateState((prev) => ({
      ...prev,
      checked_in_ids: prev.checked_in_ids.includes(id) ? prev.checked_in_ids : [...prev.checked_in_ids, id],
    }));
  };

  const handleStart = () => {
    updateState((prev) => ({
      ...prev,
      live_status: "active",
      current_phase_index: 0,
      phase_started_at: new Date().toISOString(),
      phase_paused: false,
      phase_remaining_seconds: null,
    }));
  };

  const handlePause = () => {
    updateState((prev) => ({
      ...prev,
      phase_paused: true,
      phase_remaining_seconds: timer,
    }));
  };

  const handleResume = () => {
    const remaining = state.phase_remaining_seconds ?? 0;
    // Set phase_started_at so that startMs + totalMs - now = remaining
    const current = DEMO_PHASES[state.current_phase_index];
    const totalMs = current.duration_minutes * 60 * 1000;
    const newStart = new Date(Date.now() - (totalMs - remaining * 1000)).toISOString();
    updateState((prev) => ({
      ...prev,
      phase_paused: false,
      phase_started_at: newStart,
      phase_remaining_seconds: null,
    }));
  };

  const handleExtend = () => {
    // Add 5 minutes by shifting phase_started_at forward
    updateState((prev) => {
      if (!prev.phase_started_at) return prev;
      const shifted = new Date(new Date(prev.phase_started_at).getTime() + 5 * 60 * 1000).toISOString();

      if (prev.phase_paused) {
        return {
          ...prev,
          phase_remaining_seconds: (prev.phase_remaining_seconds ?? 0) + 5 * 60,
        };
      }

      return { ...prev, phase_started_at: shifted };
    });
  };

  const handleAdvance = () => {
    const nextIndex = state.current_phase_index + 1;

    if (nextIndex >= DEMO_PHASES.length) {
      updateState((prev) => ({
        ...prev,
        live_status: "ended",
        phase_started_at: null,
        phase_paused: false,
        phase_remaining_seconds: null,
        double_take_open: true,
      }));
      return;
    }

    const nextPhase = DEMO_PHASES[nextIndex];
    updateState((prev) => ({
      ...prev,
      current_phase_index: nextIndex,
      phase_started_at: new Date().toISOString(),
      phase_paused: false,
      phase_remaining_seconds: null,
      double_take_open: nextPhase.type === "double_take" ? true : prev.double_take_open,
    }));
  };

  const handleReset = () => {
    const reset = { ...INITIAL_DEMO_STATE };
    setState(reset);
    broadcastDemoState(reset);
  };

  const phases = DEMO_PHASES;
  const currentPhase = phases[state.current_phase_index];
  const checkedIn = state.checked_in_ids.length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gray-950 pt-14 pb-10">
      <div className="max-w-lg mx-auto px-4 py-6 text-white">
        {/* Header */}
        <div className="mb-6">
          <p className="text-copper text-xs uppercase tracking-[0.15em] font-medium font-sans mb-1">Host Controls</p>
          <h1 className="font-serif text-2xl font-semibold">{DEMO_EVENT.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium ${
              state.live_status === "active"
                ? "bg-green-500/20 text-green-400"
                : state.live_status === "ended"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gray-500/20 text-gray-400"
            }`}>
              {state.live_status === "active" ? "LIVE" : state.live_status === "ended" ? "ENDED" : "NOT STARTED"}
            </span>
            <span className="text-gray-400 text-xs font-sans">{checkedIn}/{DEMO_ATTENDEES.length} checked in</span>
          </div>
        </div>

        {/* Current Phase Card */}
        {state.live_status === "active" && currentPhase && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-sans mb-1">
                  Phase {state.current_phase_index + 1} of {phases.length}
                </p>
                <h2 className="font-serif text-lg font-semibold">{currentPhase.name}</h2>
                {currentPhase.display_time && (
                  <p className="text-gray-400 text-xs font-sans mt-0.5">{currentPhase.display_time}</p>
                )}
              </div>
              <span className={`text-xs font-sans px-2 py-1 rounded-lg ${
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
                {state.phase_paused && <p className="text-yellow-400 text-xs font-sans mt-1">PAUSED</p>}
              </div>
            )}

            {/* Phase prompt */}
            {currentPhase.prompt && (
              <p className="text-gray-400 text-sm italic font-sans mb-4">&ldquo;{currentPhase.prompt}&rdquo;</p>
            )}

            {/* Phase progress dots */}
            <div className="flex gap-1.5 mb-5">
              {phases.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < state.current_phase_index
                      ? "bg-copper"
                      : i === state.current_phase_index
                        ? "bg-copper animate-pulse"
                        : "bg-gray-700"
                  }`}
                />
              ))}
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3">
              {state.phase_paused ? (
                <button
                  onClick={handleResume}
                  className="py-3 rounded-xl bg-green-600 text-white font-medium text-sm font-sans hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="py-3 rounded-xl bg-yellow-600 text-white font-medium text-sm font-sans hover:bg-yellow-700 transition-colors cursor-pointer"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleExtend}
                className="py-3 rounded-xl bg-gray-700 text-white font-medium text-sm font-sans hover:bg-gray-600 transition-colors cursor-pointer"
              >
                +5 min
              </button>
              <button
                onClick={handleAdvance}
                className="col-span-2 py-3 rounded-xl bg-copper text-white font-semibold text-sm font-sans hover:bg-copper-dark transition-colors cursor-pointer"
              >
                {state.current_phase_index + 1 >= phases.length ? "End Event" : "Next Phase \u2192"}
              </button>
            </div>
          </div>
        )}

        {/* Start / Check In All buttons */}
        {state.live_status === "not_started" && (
          <div className="space-y-3 mb-6">
            <button
              onClick={handleCheckInAll}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium text-sm font-sans hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Check In All ({DEMO_ATTENDEES.length} attendees)
            </button>
            <button
              onClick={handleStart}
              disabled={checkedIn === 0}
              className="w-full py-4 rounded-xl bg-green-600 text-white font-semibold text-base font-sans hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Start Event
            </button>
          </div>
        )}

        {/* Event ended — reset button */}
        {state.live_status === "ended" && (
          <div className="mb-6">
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-gray-700 text-white font-medium text-sm font-sans hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Reset Demo
            </button>
          </div>
        )}

        {/* Phase Timeline */}
        {phases.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide font-sans mb-4">Timeline</h3>
            <div className="space-y-2">
              {phases.map((phase, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans ${
                    i === state.current_phase_index && state.live_status === "active"
                      ? "bg-copper/10 border border-copper/30"
                      : i < state.current_phase_index && state.live_status === "active"
                        ? "text-gray-500"
                        : "text-gray-400"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    i === state.current_phase_index && state.live_status === "active"
                      ? "bg-copper text-white"
                      : i < state.current_phase_index && state.live_status === "active"
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-800 text-gray-500"
                  }`}>
                    {i < state.current_phase_index && state.live_status === "active" ? "\u2713" : i + 1}
                  </span>
                  <span className="flex-1">{phase.name}</span>
                  <span className="text-xs text-gray-500">{phase.display_time ?? `${phase.duration_minutes}m`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendees List */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide font-sans mb-4">
            Attendees ({DEMO_ATTENDEES.length})
          </h3>
          <div className="space-y-2">
            {DEMO_ATTENDEES.map((a) => {
              const isCheckedIn = state.checked_in_ids.includes(a.id);
              return (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCheckedIn ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                    }`}>
                      {a.first_name[0]}
                    </div>
                    <span className="text-sm font-sans">{a.first_name} {a.last_name}</span>
                  </div>
                  {isCheckedIn ? (
                    <span className="text-green-400 text-xs font-sans font-medium">Checked In</span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-copper/20 text-copper text-xs font-sans font-medium hover:bg-copper/30 transition-colors cursor-pointer"
                    >
                      Check In
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
