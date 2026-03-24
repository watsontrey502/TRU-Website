"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { hapticSuccess } from "@/lib/haptics";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  instagram: string;
  neighborhood: string;
  work: string;
  status: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_current_period_end: string | null;
  verification_status: string;
  id_document_path: string | null;
}

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  social: "Social",
  premier: "Premier",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-white/10 text-[#BDB8B2]",
  social: "bg-gold/15 text-gold",
  premier: "bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold",
};

const TIER_PRICES: Record<string, string> = {
  social: "$49",
  premier: "$125",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  social: "25% off event tickets, Double Take access, priority RSVP",
  premier: "1 free event/month, 25% off additional, VIP access",
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-400" },
  past_due: { label: "Past Due", color: "bg-red-500/10 text-red-400" },
  canceled: { label: "Canceled", color: "bg-[#BDB8B2]/10 text-[#BDB8B2]" },
};

const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "bg-red-500/10 text-red-400" },
  id_uploaded: { label: "ID Under Review", color: "bg-yellow-500/10 text-yellow-400" },
  id_approved: { label: "ID Approved", color: "bg-blue-500/10 text-blue-400" },
  background_pending: { label: "Background Check Pending", color: "bg-yellow-500/10 text-yellow-400" },
  verified: { label: "Verified", color: "bg-emerald-500/10 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400" },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    instagram: "",
    neighborhood: "",
    phone: "",
    age: "",
    gender: "",
    work: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, age, gender, instagram, neighborhood, work, status, subscription_tier, subscription_status, subscription_current_period_end, verification_status, id_document_path")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          instagram: data.instagram ?? "",
          neighborhood: data.neighborhood ?? "",
          phone: data.phone ?? "",
          age: data.age ? String(data.age) : "",
          gender: data.gender ?? "",
          work: data.work ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        instagram: form.instagram,
        neighborhood: form.neighborhood,
        phone: form.phone,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        work: form.work,
      })
      .eq("id", user.id);

    setSaving(false);
    toast("Profile saved");
    hapticSuccess();
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        toast("Failed to open billing portal");
      }
    } catch {
      toast("Failed to open billing portal");
    }
    setPortalLoading(false);
  };

  const handleUpgrade = async (tier: string) => {
    setUpgradeLoading(tier);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast("Upgrade initiated");
          window.location.reload();
        }
      } else {
        toast("Failed to start upgrade");
      }
    } catch {
      toast("Failed to start upgrade");
    }
    setUpgradeLoading(null);
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast("File must be under 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast("Please upload a JPEG, PNG, or PDF");
      return;
    }

    setUploadingId(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/verification/upload-id", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast("ID uploaded successfully");
        hapticSuccess();
        // Refresh profile to get updated verification status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("verification_status, id_document_path")
            .eq("id", user.id)
            .single();
          if (data) {
            setProfile((prev) => prev ? { ...prev, ...data } : prev);
          }
        }
      } else {
        toast("Failed to upload ID");
      }
    } catch {
      toast("Failed to upload ID");
    }
    setUploadingId(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tier = profile?.subscription_tier ?? "free";
  const subscriptionStatus = profile?.subscription_status ?? "";
  const verification = profile?.verification_status ?? "unverified";
  const verificationInfo = VERIFICATION_LABELS[verification] ?? VERIFICATION_LABELS.unverified;
  const subscriptionStatusInfo = SUBSCRIPTION_STATUS_LABELS[subscriptionStatus];

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#1A1A1D] py-3.5 px-4 text-[15px] text-champagne placeholder:text-[#BDB8B2]/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-2">
          Your Profile
        </h1>
        <p className="text-[#BDB8B2]">Manage your account, membership, and verification.</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* ─── Membership Section ─── */}
        <section className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-champagne mb-4">Membership</h2>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Tier badge */}
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold ${TIER_COLORS[tier] ?? TIER_COLORS.free}`}>
              {TIER_LABELS[tier] ?? "Free"} Member
            </span>
            {/* Subscription status badge (for paid tiers) */}
            {tier !== "free" && subscriptionStatusInfo && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${subscriptionStatusInfo.color}`}>
                {subscriptionStatusInfo.label}
              </span>
            )}
          </div>

          {/* Billing info for paid tiers */}
          {tier !== "free" && profile?.subscription_current_period_end && (
            <p className="text-[#BDB8B2] text-sm mb-5">
              Next billing date:{" "}
              <span className="text-champagne font-medium">
                {new Date(profile.subscription_current_period_end).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          )}

          {/* Paid tier: Manage subscription + optional upgrade to Premier */}
          {tier !== "free" && (
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-champagne font-medium text-sm hover:border-gold/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {portalLoading ? "Opening..." : "Manage Subscription"}
              </motion.button>

              {tier === "social" && (
                <motion.button
                  onClick={() => handleUpgrade("premier")}
                  disabled={upgradeLoading === "premier"}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="px-5 py-2.5 rounded-xl bg-gold text-white font-semibold text-sm shadow-lg shadow-gold/15 disabled:opacity-50 cursor-pointer"
                >
                  {upgradeLoading === "premier" ? "Processing..." : "Upgrade to Premier — $125/mo"}
                </motion.button>
              )}
            </div>
          )}

          {/* Free tier: Upgrade cards */}
          {tier === "free" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["social", "premier"] as const).map((upgradeTier) => (
                <div
                  key={upgradeTier}
                  className="bg-[#0C0C0D] border border-white/10 rounded-xl p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[upgradeTier]}`}>
                      {TIER_LABELS[upgradeTier]}
                    </span>
                    <span className="text-champagne font-semibold text-sm ml-auto">
                      {TIER_PRICES[upgradeTier]}/mo
                    </span>
                  </div>
                  <p className="text-[#BDB8B2] text-xs mb-4 flex-1">
                    {TIER_DESCRIPTIONS[upgradeTier]}
                  </p>
                  <motion.button
                    onClick={() => handleUpgrade(upgradeTier)}
                    disabled={upgradeLoading === upgradeTier}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full py-2.5 rounded-xl bg-gold text-white font-semibold text-sm shadow-lg shadow-gold/15 disabled:opacity-50 cursor-pointer"
                  >
                    {upgradeLoading === upgradeTier ? "Processing..." : "Upgrade"}
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Verification Section ─── */}
        <section className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-champagne mb-4">Verification</h2>

          <div className="flex items-center gap-3 mb-5">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${verificationInfo.color}`}>
              {verification === "verified" && (
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              {verificationInfo.label}
            </span>
          </div>

          {/* Unverified: upload prompt */}
          {verification === "unverified" && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-400 font-medium text-sm mb-1">Upload your ID to get verified</p>
                  <p className="text-[#BDB8B2] text-xs mb-4">
                    Upload a government-issued photo ID (driver&apos;s license, passport, or state ID). Accepted formats: JPEG, PNG, or PDF. Max 10MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleIdUpload}
                    className="hidden"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingId}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="px-5 py-2.5 rounded-xl bg-gold text-white font-semibold text-sm shadow-lg shadow-gold/15 disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingId ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Upload ID Document"
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* ID Uploaded: under review */}
          {verification === "id_uploaded" && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-400 font-medium text-sm">Your ID is under review</p>
                <p className="text-[#BDB8B2] text-xs mt-0.5">We&apos;re reviewing your document. This usually takes 1-2 business days.</p>
              </div>
            </div>
          )}

          {/* ID Approved */}
          {verification === "id_approved" && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-400 font-medium text-sm">ID Approved</p>
                <p className="text-[#BDB8B2] text-xs mt-0.5">Your ID has been approved. Background check processing may follow.</p>
              </div>
            </div>
          )}

          {/* Background Pending */}
          {verification === "background_pending" && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-400 font-medium text-sm">Background check in progress</p>
                <p className="text-[#BDB8B2] text-xs mt-0.5">Your background check is being processed. We&apos;ll notify you when it&apos;s complete.</p>
              </div>
            </div>
          )}

          {/* Verified */}
          {verification === "verified" && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-400 font-medium text-sm">Fully Verified</p>
                <p className="text-[#BDB8B2] text-xs mt-0.5">Your identity has been verified. You have full access to all features.</p>
              </div>
            </div>
          )}

          {/* Rejected */}
          {verification === "rejected" && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-400 font-medium text-sm mb-1">Verification Rejected</p>
                  <p className="text-[#BDB8B2] text-xs mb-4">Your ID could not be verified. Please upload a clearer photo of your government-issued ID.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleIdUpload}
                    className="hidden"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingId}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="px-5 py-2.5 rounded-xl bg-gold text-white font-semibold text-sm shadow-lg shadow-gold/15 disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingId ? "Uploading..." : "Re-upload ID Document"}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── Profile Edit Form ─── */}
        <section className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-champagne mb-6">Edit Profile</h2>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Email</label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>

          {/* Editable fields */}
          <div className="space-y-5 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(615) 555-1234"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="28"
                  min="18"
                  max="100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Work</label>
              <input
                type="text"
                value={form.work}
                onChange={(e) => setForm({ ...form, work: e.target.value })}
                placeholder="e.g. Product Designer at Acme"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@yourusername"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#BDB8B2] mb-2 block">Neighborhood</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="e.g. East Nashville"
                className={inputClass}
              />
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="px-8 py-3.5 rounded-xl bg-gold text-white font-semibold text-sm tracking-wide transition-colors hover:bg-gold cursor-pointer shadow-lg shadow-gold/15 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </section>
      </div>
    </>
  );
}
