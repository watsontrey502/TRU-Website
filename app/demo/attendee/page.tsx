"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_EVENT, DEMO_PHASES, getDemoGroupMembers } from "@/lib/demo-data";
import type { DemoState } from "@/lib/demo-channel";
import { INITIAL_DEMO_STATE, subscribeDemoState, loadDemoState } from "@/lib/demo-channel";

export default function DemoAttendeePage() {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [toast, setToast] = useState<string | null>(null);
  const prevPhaseRef = useRef<number>(INITIAL_DEMO_STATE.current_phase_index);

  // On mount, restore from sessionStorage and subscribe to BroadcastChannel
  useEffect(() => {
    const saved = loadDemoState();
    if (saved) {
      setState(saved);
      prevPhaseRef.current = saved.current_phase_index;
    }

    const cleanup = subscribeDemoState((incoming) => {
      setState(incoming);
    });
    return cleanup;
  }, []);

  // Toast notification when phase changes
  useEffect(() => {
    if (state.live_status !== "active") return;
    if (state.current_phase_index === prevPhaseRef.current) return;

    prevPhaseRef.current = state.current_phase_index;
    const phase = DEMO_PHASES[state.current_phase_index];
    if (!phase) return;

    setToast(`Next up: ${phase.name}`);
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [state.current_phase_index, state.live_status]);

  const phases = DEMO_PHASES;
  const currentPhase = phases[state.current_phase_index];

  // Not started yet
  if (state.live_status === "not_started") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-dark mb-2">{DEMO_EVENT.name}</h1>
          <p className="text-muted font-sans mb-1">{DEMO_EVENT.venue}</p>
          <p className="text-muted text-sm font-sans">The event hasn&apos;t started yet. Hang tight!</p>
          <div className="mt-8">
            <div className="w-3 h-3 rounded-full bg-copper/40 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Event ended
  if (state.live_status === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-dark mb-2">Thanks for coming!</h1>
          <p className="text-muted font-sans mb-6">Hope you made some great connections tonight.</p>
          {state.double_take_open && (
            <Link
              href="/demo/double-take"
              className="inline-block px-6 py-3 rounded-xl bg-copper text-white font-sans font-semibold hover:bg-copper-dark transition-colors"
            >
              Open Double Take
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Live — show current phase
  const groupMembers = currentPhase?.type === "grouped"
    ? getDemoGroupMembers(state.current_phase_index)
    : [];

  const myGroupNumber = groupMembers.length > 0 ? groupMembers[0].group_number : null;

  return (
    <div className="min-h-screen pt-14 pb-10 px-6 relative">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 left-4 right-4 z-50 flex justify-center"
          >
            <div className="bg-forest text-white px-5 py-3 rounded-xl shadow-lg shadow-forest/25 flex items-center gap-3 max-w-md w-full">
              <div className="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-copper-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <p className="text-sm font-sans font-medium">{toast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto pt-6">
        {/* Phase progress dots */}
        <div className="flex gap-1.5 mb-6">
          {phases.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < state.current_phase_index
                  ? "bg-copper"
                  : i === state.current_phase_index
                    ? "bg-copper animate-pulse"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Main phase card */}
        {currentPhase && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
            {/* Phase header */}
            <div className="bg-forest px-6 py-5">
              <p className="text-copper-light text-xs uppercase tracking-[0.15em] font-sans font-medium mb-1">
                {DEMO_EVENT.name}
              </p>
              <h1 className="font-serif text-2xl font-semibold text-white">
                {currentPhase.name}
              </h1>
              {currentPhase.display_time && (
                <p className="text-white/60 text-sm font-sans mt-1">{currentPhase.display_time}</p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Prompt */}
              {currentPhase.prompt && (
                <div className="bg-cream rounded-xl p-4 text-center">
                  <p className="text-dark font-sans font-medium italic">
                    &ldquo;{currentPhase.prompt}&rdquo;
                  </p>
                </div>
              )}

              {/* Group assignment */}
              {currentPhase.type === "grouped" && groupMembers.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted font-sans font-medium mb-3 text-center">
                    Your Group {myGroupNumber ? `(#${myGroupNumber})` : ""}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {groupMembers.map((member) => (
                      <div key={member.id} className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center">
                          <span className="text-copper font-serif font-bold text-lg">
                            {member.first_name[0]}
                          </span>
                        </div>
                        <span className="text-dark text-sm font-sans font-medium">{member.first_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Double Take link */}
              {currentPhase.type === "double_take" && state.double_take_open && (
                <Link
                  href="/demo/double-take"
                  className="block w-full py-4 rounded-xl bg-copper text-white font-sans font-semibold text-center text-base tracking-wide hover:bg-copper-dark transition-colors shadow-lg shadow-copper/15"
                >
                  Open Double Take
                </Link>
              )}

              {/* Mingle message */}
              {currentPhase.type === "mingle" && (
                <div className="text-center">
                  <p className="text-muted text-sm font-sans">
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans ${
                i === state.current_phase_index
                  ? "bg-copper/5 border border-copper/20 text-dark font-medium"
                  : i < state.current_phase_index
                    ? "text-muted line-through"
                    : "text-muted"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i === state.current_phase_index
                  ? "bg-copper text-white"
                  : i < state.current_phase_index
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {i < state.current_phase_index ? "\u2713" : i + 1}
              </span>
              <span className="flex-1">{phase.name}</span>
              <span className="text-xs">{phase.display_time ?? `${phase.duration_minutes}m`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
