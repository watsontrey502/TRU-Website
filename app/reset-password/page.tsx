"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <>
      <title>Reset Password | TR{"\u00dc"} Dating Nashville</title>
      <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <p className="text-white/80 text-sm font-semibold tracking-[0.15em] uppercase mb-3">
              TR{"\u00dc"}
            </p>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">
              Reset your password
            </h1>
            <p className="text-white/40 text-sm">
              Choose a new password for your account.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white/[0.04] border border-gold/20 p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-xl font-bold text-white mb-2">Password updated</h2>
              <p className="text-white/40 text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-8 space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-white/60 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-white/60 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20 transition-all"
                />
              </div>

              {error && <p className="text-xs text-red-400 pl-1">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-[#b8935e] text-white font-semibold text-base tracking-wide transition-colors cursor-pointer shadow-lg shadow-gold/15 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
