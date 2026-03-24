"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  const inputBase =
    "w-full rounded-xl border bg-white py-3.5 px-4 text-[15px] text-black placeholder:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2";
  const inputNormal = `${inputBase} border-gray-200 focus:border-gold focus:ring-gold/20`;
  const inputErr = `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-200/40`;

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
    >
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  const OAuthButtons = ({ variant }: { variant: "light" | "dark" }) => {
    const btnClass = variant === "light"
      ? "w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-gray-200 bg-white text-black text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
      : "w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer";

    return (
      <div className="space-y-3">
        <button type="button" onClick={() => handleOAuth("google")} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        <button type="button" onClick={() => handleOAuth("apple")} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>
      </div>
    );
  };

  const Divider = ({ variant }: { variant: "light" | "dark" }) => (
    <div className="flex items-center gap-4 my-6">
      <div className={`flex-1 h-px ${variant === "light" ? "bg-gray-200" : "bg-white/10"}`} />
      <span className={`text-xs uppercase tracking-wider ${variant === "light" ? "text-gray-300" : "text-white/30"}`}>or</span>
      <div className={`flex-1 h-px ${variant === "light" ? "bg-gray-200" : "bg-white/10"}`} />
    </div>
  );

  const FormContent = ({ id_suffix }: { id_suffix: string }) => (
    <>
      <p className="text-xs uppercase tracking-[0.15em] text-gold font-medium mb-3">
        Member Login
      </p>
      <div className="w-8 h-px bg-gold/40 mb-3" />
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-black mb-2">
        Welcome back
      </h2>
      <p className="text-stone text-sm mb-8">
        Sign in to your TR&Uuml; account.
      </p>

      <OAuthButtons variant="light" />
      <Divider variant="light" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`email-${id_suffix}`} className="flex items-baseline gap-1.5 text-sm font-medium text-gray-600 mb-2">
            Email
          </label>
          <input
            id={`email-${id_suffix}`}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="jane@email.com"
            className={error ? inputErr : inputNormal}
          />
        </div>

        <div>
          <label htmlFor={`password-${id_suffix}`} className="flex items-baseline gap-1.5 text-sm font-medium text-gray-600 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id={`password-${id_suffix}`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter your password"
              className={error ? inputErr : inputNormal}
            />
            <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 pl-1">{error}</p>}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="w-full py-4 rounded-xl bg-gold text-white font-semibold text-base tracking-wide transition-colors duration-200 hover:bg-gold cursor-pointer shadow-lg shadow-gold/15 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </motion.button>
      </form>

      <p className="text-center text-[11px] text-gray-300 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/apply" className="text-gold hover:text-gold transition-colors">
          You need an invitation
        </Link>
      </p>
    </>
  );

  return (
    <>
      <title>Login | TR{"\u00dc"} Dating Nashville</title>

      <div className="min-h-screen bg-cream">
        {/* Mobile hero */}
        <div className="md:hidden relative h-[48vw] min-h-[200px] max-h-[320px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80"
            alt="Candlelight ambiance"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <p className="text-white/80 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              TR{"\u00dc"}
            </p>
            <h2 className="font-serif text-2xl font-bold text-white text-center leading-snug">
              Welcome back.
            </h2>
          </div>
        </div>

        {/* Desktop split-screen */}
        <div className="hidden md:grid md:grid-cols-2 min-h-screen">
          {/* Left photo */}
          <div className="sticky top-0 h-screen relative">
            <Image
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80"
              alt="Candlelight ambiance"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
              <p className="text-white/80 text-sm font-semibold tracking-[0.15em] uppercase">
                TR{"\u00dc"}
              </p>
              <div className="flex-1 flex items-center justify-center px-4">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center leading-snug">
                  Welcome back.
                </h2>
              </div>
              <div />
            </div>
          </div>

          {/* Right form */}
          <div className="bg-cream flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-6 py-16">
              <FormContent id_suffix="desktop" />
            </div>
          </div>
        </div>

        {/* Mobile form area */}
        <div className="md:hidden px-5 py-8 pb-16">
          <FormContent id_suffix="mobile" />
        </div>
      </div>
    </>
  );
}
