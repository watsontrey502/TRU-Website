"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── Slide variants ───────────────────────────────────────────── */

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

/* ── Intent options ───────────────────────────────────────────── */

const INTENTS = [
  "Intentional about meeting people",
  "Looking for a relationship",
  "Open to meeting great people",
];

/* ═════════════════════════════════════════════════════════════════ */

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("Nashville");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [occupation, setOccupation] = useState("");
  const [intent, setIntent] = useState("");
  const [openResponse, setOpenResponse] = useState("");

  const totalSteps = 4;
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  const inputClass =
    "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-4 px-4 text-white text-[15px] placeholder:text-white/[0.22] focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,169,126,0.15)] transition-all";

  const canContinue = () => {
    if (step === 0) return firstName.trim() && lastName.trim();
    if (step === 1) return email.trim() && occupation.trim();
    if (step === 2) return !!intent;
    if (step === 3) return openResponse.trim().length > 0;
    return false;
  };

  const goNext = () => {
    if (!canContinue()) return;
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) {
      window.location.href = "/";
      return;
    }
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!canContinue()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          age: age || undefined,
          instagram: instagram.trim() || undefined,
          work: occupation.trim(),
          neighborhood: city.trim() || "Nashville",
          heardFrom: "Application",
          interesting: openResponse.trim(),
          idealDate: intent,
        }),
      });
    } catch {
      // silent — data may still be in Supabase
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  /* ── Success screen ──────────────────────────────────────────── */

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          {/* Gold checkmark */}
          <div className="mx-auto mb-8 w-20 h-20">
            <motion.svg viewBox="0 0 80 80" className="w-20 h-20">
              <motion.circle
                cx="40" cy="40" r="36" fill="none" stroke="rgba(200,169,126,0.3)" strokeWidth="2.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.7 }}
              />
              <motion.path
                d="M24 40L35 51L56 30" fill="none" stroke="#C8A97E" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </motion.svg>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="font-serif text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Application submitted.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="text-white/50 text-[15px] mb-10"
          >
            Check your email &mdash; we&apos;ll be in touch.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white/80 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Step content ────────────────────────────────────────────── */

  const stepContent = [
    // Step 1 — Basics
    <div key="step-0" className="space-y-4">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6">
        The basics.
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        min={18}
        max={99}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={inputClass}
      />
    </div>,

    // Step 2 — Contact & Work
    <div key="step-1" className="space-y-4">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6">
        How to reach you.
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Instagram handle"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Occupation"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        className={inputClass}
      />
    </div>,

    // Step 3 — Intent
    <div key="step-2" className="space-y-4">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6">
        What brings you here?
      </h2>
      {INTENTS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setIntent(option)}
          className={`w-full text-left rounded-xl py-4 px-5 text-[15px] font-medium transition-all cursor-pointer ${
            intent === option
              ? "bg-gradient-to-r from-gold to-[#b8935e] text-black border border-transparent"
              : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.07]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>,

    // Step 4 — Open Response
    <div key="step-3" className="space-y-4">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6">
        One more thing.
      </h2>
      <textarea
        placeholder="What would make a social event actually worth your time?"
        value={openResponse}
        onChange={(e) => setOpenResponse(e.target.value)}
        className={`${inputClass} resize-none`}
        style={{ minHeight: 130 }}
      />
    </div>,
  ];

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-white/30 text-xs font-medium">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-white/30 text-xs font-medium tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-sand"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step content with animated transitions */}
        <div className="relative" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-shrink-0 px-6 py-3.5 rounded-full text-white/60 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue()}
              className="flex-1 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canContinue() || submitting}
              className="flex-1 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>

        {/* Fine print */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          By applying you agree to our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-white/40 transition-colors">
            privacy policy
          </Link>
          {" & "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-white/40 transition-colors">
            terms
          </Link>.
        </p>
      </div>
    </div>
  );
}
