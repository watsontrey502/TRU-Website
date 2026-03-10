"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Link from "next/link";
import { hapticTap, hapticSuccess, hapticError } from "@/lib/haptics";

/* ── Types & data ──────────────────────────────────────────────── */

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  instagram: string;
  neighborhood: string;
  work: string;
  heardFrom: string;
  interesting: string;
  idealDate: string;
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
  work: "",
  heardFrom: "",
  interesting: "",
  idealDate: "",
  referralCode: "",
};

const AGES = Array.from({ length: 30 }, (_, i) => String(i + 21));
const GENDERS = ["Male", "Female", "Non-binary"];
const NEIGHBORHOODS = [
  "Germantown", "East Nashville", "The Gulch", "12 South",
  "Sylvan Park", "Berry Hill", "Belmont/Hillsboro", "Downtown",
  "Franklin/Brentwood", "Other",
];
const HEARD_FROM = ["Instagram", "TikTok", "Friend referral", "Google", "Other"];
const STEP_LABELS = ["About You", "Nashville", "Fun Stuff"];

function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function isValidPhone(p: string) { return /^[\d\s()+-]{7,}$/.test(p); }

/* ── Animation variants ──────────────────────────────────────── */

const fieldContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const errorAnim = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2 },
};

/* ── Styled form primitives ────────────────────────────────────── */

const inputBase =
  "w-full rounded-xl border bg-white py-3.5 px-4 text-[15px] text-dark placeholder:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2";
const inputNormal = `${inputBase} border-gray-200 focus:border-copper focus:ring-copper/20`;
const inputError = `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-200/40`;

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-sm font-medium text-gray-600 mb-2">
      {children}
      {optional && <span className="text-gray-300 font-normal text-xs">(optional)</span>}
    </label>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <motion.p {...errorAnim} className="mt-1.5 text-xs text-red-500 pl-1">
      {message}
    </motion.p>
  );
}

function Input({
  id, value, onChange, placeholder, type = "text", error,
  inputMode, enterKeyHint,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "search";
  enterKeyHint?: "next" | "done" | "go" | "send";
}) {
  return (
    <div>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        className={error ? inputError : inputNormal}
      />
      {error && <ErrorMsg message={error} />}
    </div>
  );
}

function Select({
  id, value, onChange, options, placeholder, error,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <select
          id={id} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${error ? inputError : inputNormal} appearance-none pr-10 ${!value ? "text-gray-300" : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
        </svg>
      </div>
      {error && <ErrorMsg message={error} />}
    </div>
  );
}

function Textarea({
  id, value, onChange, placeholder, maxLength, error,
  enterKeyHint,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength: number; error?: string;
  enterKeyHint?: "next" | "done";
}) {
  return (
    <div>
      <textarea
        id={id} value={value} rows={4}
        onChange={(e) => { if (e.target.value.length <= maxLength) onChange(e.target.value); }}
        placeholder={placeholder}
        enterKeyHint={enterKeyHint}
        className={`${error ? inputError : inputNormal} resize-none`}
      />
      <div className="flex justify-between items-center mt-1 px-1">
        {error ? <ErrorMsg message={error} /> : <span />}
        <span className={`text-xs tabular-nums ${value.length >= maxLength ? "text-red-500 font-medium" : "text-gray-300"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

function GenderPills({
  value, onChange, error,
}: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {GENDERS.map((g) => (
          <button
            key={g} type="button"
            onClick={() => onChange(g)}
            className={`rounded-full py-3 text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer ${
              value === g
                ? "bg-forest text-white shadow-sm"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      {error && <ErrorMsg message={error} />}
    </div>
  );
}

/* ── Step completion celebration ──────────────────────────────── */

function StepCelebration({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-cream/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="w-8 h-8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <motion.path
            d="M5 12l5 5L20 7"
            fill="none"
            stroke="#2C4A3E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

/* ── Step indicator (left panel) ─────────────────────────────────── */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const completed = i < current && current < 3;
        const active = i === current && current < 3;
        const future = i > current || current >= 3;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                completed
                  ? "bg-copper"
                  : active
                    ? "bg-copper"
                    : future
                      ? "border-2 border-white/30 bg-transparent"
                      : ""
              }`}>
                {completed ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : null}
              </div>
              {/* Label */}
              <span className={`mt-2.5 text-[11px] uppercase tracking-wider font-medium whitespace-nowrap ${
                completed || active ? "text-white" : "text-white/40"
              }`}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-12 h-px mb-5 mx-1.5 transition-colors duration-300 ${
                i < current && current < 3 ? "bg-copper" : "bg-white/20"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Slide variants ────────────────────────────────────────────── */

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

/* ── First-field IDs per step (for auto-focus) ──────────────── */

const FIRST_FIELD: Record<number, string> = { 0: "fn", 1: "nb", 2: "int" };

/* ═══════════════════════ Main Component ═══════════════════════════ */

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const set = (f: keyof FormData) => (v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  };

  /* ── Auto-focus first field on step change ─────────────────── */

  useEffect(() => {
    const id = FIRST_FIELD[step];
    if (!id) return;
    const t = setTimeout(() => {
      document.getElementById(id)?.focus({ preventScroll: true });
    }, 350);
    return () => clearTimeout(t);
  }, [step]);

  const validate = (): boolean => {
    const e: Errors = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!isValidEmail(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Required";
      else if (!isValidPhone(form.phone)) e.phone = "Enter a valid phone";
      if (!form.age) e.age = "Required";
      if (!form.gender) e.gender = "Pick one";
    }
    if (step === 1) {
      if (!form.neighborhood) e.neighborhood = "Required";
      if (!form.work.trim()) e.work = "Required";
      if (!form.heardFrom) e.heardFrom = "Required";
    }
    if (step === 2) {
      if (!form.interesting.trim()) e.interesting = "Don\u2019t be shy!";
      if (!form.idealDate.trim()) e.idealDate = "We\u2019d love to hear this";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setShaking(true);
      hapticError();
      setTimeout(() => setShaking(false), 400);
      return false;
    }
    return true;
  };

  const advanceStep = useCallback(() => {
    setDir(1);
    setStep((s) => s + 1);
  }, []);

  const next = async () => {
    if (!validate()) return;
    if (step === 2) {
      setSubmitting(true);
      try {
        await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch {
        // Still proceed to success — don't block the user
      } finally {
        setSubmitting(false);
      }
      setDir(1);
      setStep(3);
      return;
    }
    // Show celebration between form steps
    hapticSuccess();
    setCelebrating(true);
  };

  const onCelebrationComplete = useCallback(() => {
    setCelebrating(false);
    advanceStep();
  }, [advanceStep]);

  const back = () => { setDir(-1); setStep((s) => s - 1); };

  /* ── Swipe handler ─────────────────────────────────────────── */

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && step < 2) {
      hapticTap();
      next();
    } else if (info.offset.x > threshold && step > 0) {
      hapticTap();
      back();
    }
  };

  const progress = step >= 3 ? 100 : ((step + 1) / 3) * 100;
  const isSuccess = step === 3;

  const STEP_TITLES = ["Tell us about you", "Your Nashville life", "The fun stuff"];
  const STEP_SUBTITLES = ["Step 1 of 3", "Step 2 of 3", "Step 3 of 3"];

  /* ── Steps ───────────────────────────────────────────────────── */

  const step0 = (
    <motion.div variants={fieldContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fieldItem} className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="fn">First Name</Label><Input id="fn" value={form.firstName} onChange={set("firstName")} placeholder="Jane" error={errors.firstName} enterKeyHint="next" /></div>
        <div><Label htmlFor="ln">Last Name</Label><Input id="ln" value={form.lastName} onChange={set("lastName")} placeholder="Doe" error={errors.lastName} enterKeyHint="next" /></div>
      </motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="em">Email</Label><Input id="em" value={form.email} onChange={set("email")} placeholder="jane@email.com" type="email" inputMode="email" error={errors.email} enterKeyHint="next" /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="ph">Phone</Label><Input id="ph" value={form.phone} onChange={set("phone")} placeholder="(615) 555-1234" type="tel" inputMode="tel" error={errors.phone} enterKeyHint="next" /></motion.div>
      <motion.div variants={fieldItem} className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="age">Age</Label><Select id="age" value={form.age} onChange={set("age")} options={AGES} placeholder="Select" error={errors.age} /></div>
        <div />
      </motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="gd">Gender</Label><GenderPills value={form.gender} onChange={set("gender")} error={errors.gender} /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="ig" optional>Instagram</Label><Input id="ig" value={form.instagram} onChange={set("instagram")} placeholder="@yourusername" enterKeyHint="done" /></motion.div>
    </motion.div>
  );

  const step1 = (
    <motion.div variants={fieldContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fieldItem}><Label htmlFor="nb">Neighborhood</Label><Select id="nb" value={form.neighborhood} onChange={set("neighborhood")} options={NEIGHBORHOODS} placeholder="Where in Nashville?" error={errors.neighborhood} /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="wk">What do you do for work?</Label><Input id="wk" value={form.work} onChange={set("work")} placeholder="Songwriter, Nurse, Engineer…" error={errors.work} enterKeyHint="next" /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="hf">How did you hear about TR{"\u00dc"}?</Label><Select id="hf" value={form.heardFrom} onChange={set("heardFrom")} options={HEARD_FROM} placeholder="Select one" error={errors.heardFrom} /></motion.div>
    </motion.div>
  );

  const step2 = (
    <motion.div variants={fieldContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fieldItem}><Label htmlFor="int">What makes you interesting?</Label><Textarea id="int" value={form.interesting} onChange={set("interesting")} placeholder="Don't be humble. Tell us what makes you, you." maxLength={200} error={errors.interesting} enterKeyHint="next" /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="dt">Ideal first date?</Label><Textarea id="dt" value={form.idealDate} onChange={set("idealDate")} placeholder="Dive bar? Rooftop dinner? A long walk?" maxLength={150} error={errors.idealDate} enterKeyHint="done" /></motion.div>
      <motion.div variants={fieldItem}><Label htmlFor="ref" optional>Referral Code</Label><Input id="ref" value={form.referralCode} onChange={set("referralCode")} placeholder="Enter code" enterKeyHint="done" /></motion.div>
    </motion.div>
  );

  const step3 = (
    <div className="text-center py-8">
      {/* Animated checkmark */}
      <div className="mx-auto mb-8 w-20 h-20">
        <motion.svg viewBox="0 0 80 80" className="w-20 h-20" initial="h" animate="v">
          <motion.circle cx="40" cy="40" r="36" fill="none" stroke="#2C4A3E" strokeWidth="2.5"
            variants={{ h: { pathLength: 0, opacity: 0 }, v: { pathLength: 1, opacity: 1, transition: { duration: 0.7 } } }} />
          <motion.path d="M24 40L35 51L56 30" fill="none" stroke="#B87333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            variants={{ h: { pathLength: 0, opacity: 0 }, v: { pathLength: 1, opacity: 1, transition: { duration: 0.4, delay: 0.6 } } }} />
        </motion.svg>
      </div>

      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        className="font-serif text-2xl font-semibold text-dark mb-3">
        You{"\u2019"}re on the list!
      </motion.h3>

      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
        className="text-gray-500 leading-relaxed max-w-xs mx-auto mb-8 text-[15px]">
        We review every application personally. Expect to hear from us within 48 hours.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        <p className="text-sm text-gray-400 mb-4">Follow us for updates</p>
        <a
          href="https://instagram.com/trudatingnashville"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-copper font-medium hover:text-copper-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          @trudatingnashville
        </a>
      </motion.div>
    </div>
  );

  const steps = [step0, step1, step2, step3];

  /* ── Shared form section (used by both mobile & desktop) ──── */

  const formSection = (keyPrefix: string) => (
    <>
      {/* Progress bar */}
      {!isSuccess && (
        <div className={keyPrefix === "d" ? "mb-10" : "mb-8"}>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-copper rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Step title area */}
      {!isSuccess && (
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.p key={`${keyPrefix}-label-${step}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-xs uppercase tracking-[0.15em] text-copper font-medium mb-3">
              {STEP_SUBTITLES[step]}
            </motion.p>
          </AnimatePresence>
          {/* Decorative copper line */}
          <div className="w-8 h-px bg-copper/40 mb-3" />
          <AnimatePresence mode="wait">
            <motion.h2 key={`${keyPrefix}-title-${step}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className={`font-serif font-semibold text-dark ${keyPrefix === "d" ? "text-2xl md:text-3xl" : "text-2xl"}`}>
              {STEP_TITLES[step]}
            </motion.h2>
          </AnimatePresence>
        </div>
      )}

      {/* Step content with shake + swipe + celebration */}
      <motion.div
        className="relative overflow-hidden"
        style={{ minHeight: isSuccess ? "auto" : "340px" }}
        animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={shaking ? { duration: 0.4 } : undefined}
      >
        <AnimatePresence>
          {celebrating && <StepCelebration onComplete={onCelebrationComplete} />}
        </AnimatePresence>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`${keyPrefix}-${step}`}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            drag={step < 3 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={step < 3 ? handleDragEnd : undefined}
            style={{ touchAction: "pan-y" }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Buttons */}
      {step < 3 && (
        <div className="mt-8 space-y-3">
          <motion.button type="button" onClick={next}
            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
            className="w-full py-4 rounded-xl bg-copper text-white font-semibold text-base tracking-wide transition-colors duration-200 hover:bg-copper-dark cursor-pointer shadow-lg shadow-copper/15">
            {submitting ? "Submitting..." : step === 2 ? "Submit Application" : "Continue"}
          </motion.button>
          {step > 0 && (
            <button type="button" onClick={back}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-2">
              {"\u2190"} Go back
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 flex justify-center">
          <Link href="/"
            className="inline-flex items-center justify-center w-full py-4 rounded-xl bg-forest text-white font-semibold text-base tracking-wide hover:bg-forest-dark transition-colors">
            Back to Home
          </Link>
        </div>
      )}

      {/* Fine print */}
      {step < 3 && (
        <p className="text-center text-[11px] text-gray-300 mt-5">
          By applying you agree to our community guidelines & privacy policy.
        </p>
      )}
    </>
  );

  /* ── Left panel content ─────────────────────────────────────── */

  const leftPanel = (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* Success gradient */
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-br from-copper via-forest to-forest-dark flex flex-col items-center justify-center px-8"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/60 text-sm uppercase tracking-[0.2em] font-medium mb-4"
            >
              You{"\u2019"}re in
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-serif text-5xl md:text-6xl font-bold text-white text-center leading-tight"
            >
              Welcome to<br />TR{"\u00dc"}
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 w-16 h-px bg-copper-light origin-center"
            />
          </motion.div>
        ) : (
          /* Photo panel */
          <motion.div
            key="photo"
            className="absolute inset-0"
          >
            <Image
              src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80"
              alt="People connecting"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

            {/* Overlaid content */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
              {/* Brand */}
              <p className="text-white/80 text-sm font-semibold tracking-[0.15em] uppercase">
                TR{"\u00dc"}
              </p>

              {/* Motivational copy */}
              <div className="flex-1 flex items-center justify-center px-4">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center leading-snug">
                  Your next chapter<br />starts in person.
                </h2>
              </div>

              {/* Step indicator */}
              <div className="flex justify-center">
                <StepIndicator current={step} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <>
      <title>Apply | TR{"\u00dc"} Dating Nashville</title>

      <div className="min-h-screen bg-cream pt-20">
        {/* ── Mobile hero ── */}
        <div className="md:hidden relative h-[48vw] min-h-[200px] max-h-[280px] overflow-hidden">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="mobile-success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-br from-copper via-forest to-forest-dark flex flex-col items-center justify-center px-6"
              >
                <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-medium mb-2">
                  You{"\u2019"}re in
                </p>
                <h2 className="font-serif text-3xl font-bold text-white text-center">
                  Welcome to TR{"\u00dc"}
                </h2>
              </motion.div>
            ) : (
              <motion.div key="mobile-photo" className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80"
                  alt="People connecting"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <p className="text-white/80 text-xs font-semibold tracking-[0.15em] uppercase">
                    TR{"\u00dc"}
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    <h2 className="font-serif text-2xl font-bold text-white text-center leading-snug">
                      Your next chapter<br />starts in person.
                    </h2>
                  </div>
                  <div className="flex justify-center pb-1">
                    <StepIndicator current={step} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Desktop split-screen ── */}
        <div className="hidden md:grid md:grid-cols-2 min-h-[calc(100vh-5rem)]">
          {/* Left half — sticky photo panel */}
          <div className="sticky top-20 h-[calc(100vh-5rem)]">
            {leftPanel}
          </div>

          {/* Right half — form */}
          <div className="bg-cream flex items-start justify-center overflow-y-auto">
            <div className="w-full max-w-md mx-auto px-6 py-16">
              {formSection("d")}
            </div>
          </div>
        </div>

        {/* ── Mobile form area ── */}
        <div className="md:hidden px-5 py-8 pb-16">
          {formSection("m")}
        </div>
      </div>
    </>
  );
}
