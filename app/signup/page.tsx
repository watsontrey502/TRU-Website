"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type TokenState =
  | { status: "loading" }
  | { status: "invalid"; error: string }
  | { status: "valid"; email: string; firstName: string };

export default function SignupPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState({ status: "invalid", error: "You need an invitation to join TR\u00dc." });
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/validate-token?token=${token}`);
        const data = await res.json();
        if (data.valid) {
          setTokenState({ status: "valid", email: data.email, firstName: data.firstName });
          setEmail(data.email);
        } else {
          setTokenState({ status: "invalid", error: data.error || "Invalid invitation." });
        }
      } catch {
        setTokenState({ status: "invalid", error: "Failed to validate invitation." });
      }
    }

    validateToken();
  }, [token]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding?token=${token}`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?token=${token}`,
      },
    });
  };

  const inputBase =
    "w-full rounded-xl border bg-white/5 py-3.5 px-4 text-[15px] text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:ring-2";
  const inputNormal = `${inputBase} border-white/10 focus:border-gold focus:ring-gold/20`;
  const inputErr = `${inputBase} border-red-400/50 focus:border-red-400 focus:ring-red-400/20`;

  // Invalid token state
  if (tokenState.status === "invalid") {
    return (
      <>
        <title>Join TR{"\u00dc"} | Invitation Required</title>
        <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <p className="text-gold font-sans text-2xl font-extrabold tracking-tighter mb-6">
              TR&Uuml;
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-white mb-3">
                Invitation Required
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {tokenState.error}
              </p>
              <Link
                href="/apply"
                className="inline-block px-8 py-3 rounded-full text-white text-sm font-medium tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(200,169,126,0.3)]"
                style={{ background: "linear-gradient(135deg, #C8A97E, #b8935e)" }}
              >
                Apply to Join
              </Link>
              <p className="text-white/30 text-xs mt-4">
                Already a member?{" "}
                <Link href="/login" className="text-gold hover:text-gold/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // Loading state
  if (tokenState.status === "loading") {
    return (
      <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gold font-sans text-2xl font-extrabold tracking-tighter mb-4">
            TR&Uuml;
          </p>
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Success state (email confirmation needed)
  if (success) {
    return (
      <>
        <title>Check Your Email | TR{"\u00dc"}</title>
        <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <p className="text-gold font-sans text-2xl font-extrabold tracking-tighter mb-6">
              TR&Uuml;
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-3">
                Check your email
              </h3>
              <p className="text-white/50 leading-relaxed max-w-xs mx-auto text-[15px]">
                We sent a confirmation link to{" "}
                <span className="font-medium text-white">{email}</span>.
                Click the link to verify your email and continue.
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // Main signup form
  return (
    <>
      <title>Create Account | TR{"\u00dc"} Dating Nashville</title>
      <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-gold font-sans text-2xl font-extrabold tracking-tighter">
              TR&Uuml;
            </Link>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
            <p className="text-xs uppercase tracking-[0.15em] text-gold font-medium mb-3">
              Create Account
            </p>
            <div className="w-8 h-px bg-gold/40 mb-3" />
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">
              Welcome, {tokenState.firstName}.
            </h2>
            <p className="text-white/50 text-sm mb-8">
              You&apos;ve been approved. Set up your account to get started.
            </p>

            {/* OAuth buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email + Password form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
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
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Minimum 8 characters"
                    className={error ? inputErr : inputNormal}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
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
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-white/60 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Re-enter your password"
                    className={error ? inputErr : inputNormal}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    {showConfirm ? (
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
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 pl-1">{error}</p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-4 rounded-xl text-white font-semibold text-base tracking-wide transition-colors duration-200 hover:opacity-90 cursor-pointer shadow-[0_0_20px_rgba(200,169,126,0.3)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C8A97E, #b8935e)" }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            <p className="text-center text-white/30 text-xs mt-6">
              Already a member?{" "}
              <Link href="/login" className="text-gold hover:text-gold/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
