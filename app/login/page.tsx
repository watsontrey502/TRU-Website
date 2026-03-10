"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white py-3.5 px-4 text-[15px] text-dark placeholder:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2";
  const inputNormal = `${inputBase} border-gray-200 focus:border-copper focus:ring-copper/20`;
  const inputErr = `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-200/40`;

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
          {/* Left — photo */}
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

          {/* Right — form */}
          <div className="bg-cream flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-6 py-16">
              {!sent ? (
                <>
                  <p className="text-xs uppercase tracking-[0.15em] text-copper font-medium mb-3">
                    Member Login
                  </p>
                  <div className="w-8 h-px bg-copper/40 mb-3" />
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-dark mb-2">
                    Sign in with email
                  </h2>
                  <p className="text-muted text-sm mb-8">
                    We&apos;ll send you a magic link — no password needed.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="flex items-baseline gap-1.5 text-sm font-medium text-gray-600 mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="jane@email.com"
                        className={error ? inputErr : inputNormal}
                      />
                      {error && <p className="mt-1.5 text-xs text-red-500 pl-1">{error}</p>}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="w-full py-4 rounded-xl bg-copper text-white font-semibold text-base tracking-wide transition-colors duration-200 hover:bg-copper-dark cursor-pointer shadow-lg shadow-copper/15 disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Magic Link"}
                    </motion.button>
                  </form>

                  <p className="text-center text-[11px] text-gray-300 mt-5">
                    Not a member yet?{" "}
                    <Link href="/apply" className="text-copper hover:text-copper-dark transition-colors">
                      Apply here
                    </Link>
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-dark mb-3">
                    Check your email
                  </h3>
                  <p className="text-muted leading-relaxed max-w-xs mx-auto mb-8 text-[15px]">
                    We sent a login link to <span className="font-medium text-dark">{email}</span>.
                    Click the link to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="text-sm text-copper hover:text-copper-dark transition-colors cursor-pointer"
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile form area */}
        <div className="md:hidden px-5 py-8 pb-16">
          {!sent ? (
            <>
              <p className="text-xs uppercase tracking-[0.15em] text-copper font-medium mb-3">
                Member Login
              </p>
              <div className="w-8 h-px bg-copper/40 mb-3" />
              <h2 className="font-serif text-2xl font-semibold text-dark mb-2">
                Sign in with email
              </h2>
              <p className="text-muted text-sm mb-8">
                We&apos;ll send you a magic link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email-mobile" className="flex items-baseline gap-1.5 text-sm font-medium text-gray-600 mb-2">
                    Email
                  </label>
                  <input
                    id="email-mobile"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="jane@email.com"
                    className={error ? inputErr : inputNormal}
                  />
                  {error && <p className="mt-1.5 text-xs text-red-500 pl-1">{error}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full py-4 rounded-xl bg-copper text-white font-semibold text-base tracking-wide transition-colors duration-200 hover:bg-copper-dark cursor-pointer shadow-lg shadow-copper/15 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </motion.button>
              </form>

              <p className="text-center text-[11px] text-gray-300 mt-5">
                Not a member yet?{" "}
                <Link href="/apply" className="text-copper hover:text-copper-dark transition-colors">
                  Apply here
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-dark mb-3">
                Check your email
              </h3>
              <p className="text-muted leading-relaxed max-w-xs mx-auto mb-8 text-[15px]">
                We sent a login link to <span className="font-medium text-dark">{email}</span>.
                Click the link to sign in.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-copper hover:text-copper-dark transition-colors cursor-pointer"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
