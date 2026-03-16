"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ────────────────────────────────────────────────────── */

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  instagram: string;
  neighborhood: string;
  occupation: string;
  heardFrom: string;
  interesting: string;
  intent: string;
  referralCode: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  instagram: "",
  neighborhood: "",
  occupation: "",
  heardFrom: "",
  interesting: "",
  intent: "",
  referralCode: "",
};

/* ── Constants ────────────────────────────────────────────────── */

const AGES = Array.from({ length: 30 }, (_, i) => String(i + 21));
const GENDERS = ["Male", "Female", "Non-binary"];
const NEIGHBORHOODS = [
  "Germantown",
  "East Nashville",
  "The Gulch",
  "12 South",
  "Sylvan Park",
  "Berry Hill",
  "Belmont / Hillsboro",
  "Downtown",
  "Franklin / Brentwood",
  "Other",
];
const HEARD_FROM = [
  "Instagram",
  "TikTok",
  "Friend referral",
  "Google",
  "Other",
];
const INTENTS = [
  "Intentional about meeting people",
  "Looking for a relationship",
  "Open to meeting great people",
];
const STEP_TITLES = ["About you.", "Your Nashville life.", "The fun stuff."];
const STEP_LABELS = ["About You", "Nashville", "Fun Stuff"];

/* ── Validation helpers ───────────────────────────────────────── */

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function isValidPhone(p: string) {
  return /^[\d\s()+-]{7,}$/.test(p);
}

/* ── Slide variants ───────────────────────────────────────────── */

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

/* ── Dark-themed form primitives ──────────────────────────────── */

const inputBase =
  "w-full rounded-xl bg-white/[0.04] border py-4 px-4 text-white text-[15px] placeholder:text-white/[0.22] transition-all focus:outline-none";
const inputNormal = `${inputBase} border-white/[0.08] focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,169,126,0.15)]`;
const inputError = `${inputBase} border-red-400/50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]`;

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline gap-1.5 text-sm font-medium text-white/60 mb-2"
    >
      {children}
      {optional && (
        <span className="text-white/25 font-normal text-xs">(optional)</span>
      )}
    </label>
  );
}

function Input({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? inputError : inputNormal}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${error ? inputError : inputNormal} appearance-none pr-10 ${!value ? "text-white/[0.22]" : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
        </svg>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength: number;
  error?: string;
}) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        rows={4}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={`${error ? inputError : inputNormal} resize-none`}
      />
      <div className="flex justify-between items-center mt-1 px-1">
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : (
          <span />
        )}
        <span
          className={`text-xs tabular-nums ${value.length >= maxLength ? "text-red-400 font-medium" : "text-white/20"}`}
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

function GenderPills({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {GENDERS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`rounded-full py-3 text-sm font-medium tracking-wide transition-all cursor-pointer ${
              value === g
                ? "bg-gradient-to-r from-gold to-[#b8935e] text-black"
                : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.07]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}

/* ── Step indicator ───────────────────────────────────────────── */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const completed = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  completed
                    ? "bg-gradient-to-r from-gold to-[#b8935e]"
                    : active
                      ? "bg-gradient-to-r from-gold to-[#b8935e]"
                      : "border-2 border-white/20"
                }`}
              >
                {completed ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : null}
              </div>
              <span
                className={`mt-2 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ${
                  completed || active ? "text-white/70" : "text-white/25"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-10 h-px mb-5 mx-1.5 transition-colors duration-300 ${
                  completed ? "bg-gold" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════ */

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 3;
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  const set = (f: keyof FormData) => (v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  };

  /* ── Validation ──────────────────────────────────────────────── */

  const validate = (): boolean => {
    const e: Errors = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!isValidEmail(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Required";
      else if (!isValidPhone(form.phone)) e.phone = "Enter a valid phone number";
      if (!form.age) e.age = "Required";
      if (!form.gender) e.gender = "Pick one";
    }
    if (step === 1) {
      if (!form.neighborhood) e.neighborhood = "Required";
      if (!form.occupation.trim()) e.occupation = "Required";
      if (!form.heardFrom) e.heardFrom = "Required";
    }
    if (step === 2) {
      if (!form.interesting.trim()) e.interesting = "Don\u2019t be shy!";
      if (!form.intent) e.intent = "Pick one";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
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
    if (!validate()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          age: form.age,
          gender: form.gender,
          instagram: form.instagram.trim() || undefined,
          neighborhood: form.neighborhood,
          work: form.occupation.trim(),
          heardFrom: form.heardFrom,
          interesting: form.interesting.trim(),
          idealDate: form.intent,
          referralCode: form.referralCode.trim() || undefined,
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
          <div className="mx-auto mb-8 w-20 h-20">
            <motion.svg viewBox="0 0 80 80" className="w-20 h-20">
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(200,169,126,0.3)"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7 }}
              />
              <motion.path
                d="M24 40L35 51L56 30"
                fill="none"
                stroke="#C8A97E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </motion.svg>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="font-serif text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Application submitted.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="text-white/50 text-[15px] mb-4"
          >
            We review every application personally. Expect to hear from us within 48 hours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="space-y-4"
          >
            <a
              href="https://instagram.com/trudatingnashville"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold text-sm font-medium hover:text-sand transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Follow @trudatingnashville
            </a>
            <div>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white/80 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Step content ──────────────────────────────────────────────── */

  const stepContent = [
    // Step 1 — About You
    <div key="step-0" className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fn">First Name</Label>
          <Input
            id="fn"
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="Jane"
            error={errors.firstName}
          />
        </div>
        <div>
          <Label htmlFor="ln">Last Name</Label>
          <Input
            id="ln"
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="Doe"
            error={errors.lastName}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="em">Email</Label>
        <Input
          id="em"
          value={form.email}
          onChange={set("email")}
          placeholder="jane@email.com"
          type="email"
          error={errors.email}
        />
      </div>
      <div>
        <Label htmlFor="ph">Phone</Label>
        <Input
          id="ph"
          value={form.phone}
          onChange={set("phone")}
          placeholder="(615) 555-1234"
          type="tel"
          error={errors.phone}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="age">Age</Label>
          <Select
            id="age"
            value={form.age}
            onChange={set("age")}
            options={AGES}
            placeholder="Select"
            error={errors.age}
          />
        </div>
        <div />
      </div>
      <div>
        <Label htmlFor="gd">Gender</Label>
        <GenderPills
          value={form.gender}
          onChange={set("gender")}
          error={errors.gender}
        />
      </div>
      <div>
        <Label htmlFor="ig" optional>
          Instagram
        </Label>
        <Input
          id="ig"
          value={form.instagram}
          onChange={set("instagram")}
          placeholder="@yourusername"
        />
      </div>
    </div>,

    // Step 2 — Nashville Life
    <div key="step-1" className="space-y-5">
      <div>
        <Label htmlFor="nb">Neighborhood</Label>
        <Select
          id="nb"
          value={form.neighborhood}
          onChange={set("neighborhood")}
          options={NEIGHBORHOODS}
          placeholder="Where in Nashville?"
          error={errors.neighborhood}
        />
      </div>
      <div>
        <Label htmlFor="occ">What do you do?</Label>
        <Input
          id="occ"
          value={form.occupation}
          onChange={set("occupation")}
          placeholder="Songwriter, Nurse, Engineer..."
          error={errors.occupation}
        />
      </div>
      <div>
        <Label htmlFor="hf">How did you hear about TR&Uuml;?</Label>
        <Select
          id="hf"
          value={form.heardFrom}
          onChange={set("heardFrom")}
          options={HEARD_FROM}
          placeholder="Select one"
          error={errors.heardFrom}
        />
      </div>
    </div>,

    // Step 3 — Fun Stuff
    <div key="step-2" className="space-y-5">
      <div>
        <Label htmlFor="interesting">What makes you interesting?</Label>
        <Textarea
          id="interesting"
          value={form.interesting}
          onChange={set("interesting")}
          placeholder="Don't be humble. Tell us what makes you, you."
          maxLength={200}
          error={errors.interesting}
        />
      </div>
      <div>
        <Label htmlFor="intent">What brings you here?</Label>
        <div className="space-y-2.5">
          {INTENTS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set("intent")(option)}
              className={`w-full text-left rounded-xl py-4 px-5 text-[15px] font-medium transition-all cursor-pointer ${
                form.intent === option
                  ? "bg-gradient-to-r from-gold to-[#b8935e] text-black border border-transparent"
                  : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.07]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.intent && (
          <p className="mt-1.5 text-xs text-red-400 pl-1">{errors.intent}</p>
        )}
      </div>
      <div>
        <Label htmlFor="ref" optional>
          Referral Code
        </Label>
        <Input
          id="ref"
          value={form.referralCode}
          onChange={set("referralCode")}
          placeholder="Enter code"
        />
      </div>
    </div>,
  ];

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex justify-center mb-10">
          <StepIndicator current={step} />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-sand"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step title */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="font-serif text-2xl md:text-3xl font-bold text-white"
            >
              {STEP_TITLES[step]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Step content with animated transitions */}
        <div className="relative" style={{ minHeight: 400 }}>
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

          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-shimmer flex-1 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-shimmer flex-1 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    opacity="0.3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>

        {/* Fine print */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          By applying you agree to our{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-white/40 transition-colors"
          >
            privacy policy
          </Link>
          {" & "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-white/40 transition-colors"
          >
            terms
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
