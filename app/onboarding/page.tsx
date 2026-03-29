"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  instagram: string | null;
  neighborhood: string | null;
  work: string | null;
  avatar_upload_path: string | null;
  bio: string | null;
  interests: string[] | null;
  drinking: string | null;
  smoking: string | null;
  intentions: string | null;
};

const STEPS = [
  "profile",
  "verify-id",
  "choose-tier",
  "payment",
  "welcome",
] as const;

type Step = (typeof STEPS)[number];

const INTEREST_OPTIONS = [
  "Live Music",
  "Foodie",
  "Outdoors",
  "Fitness",
  "Travel",
  "Art & Culture",
  "Wine & Cocktails",
  "Sports",
  "Reading",
  "Gaming",
  "Cooking",
  "Photography",
  "Hiking",
  "Dancing",
  "Yoga",
  "Volunteering",
];

const DRINKING_OPTIONS = [
  { label: "I don't drink", value: "dont_drink" },
  { label: "Socially", value: "socially" },
  { label: "Regularly", value: "regularly" },
];

const SMOKING_OPTIONS = [
  { label: "I don't smoke", value: "dont_smoke" },
  { label: "Socially", value: "socially" },
  { label: "Occasionally", value: "occasionally" },
];

const INTENTIONS_OPTIONS = [
  { label: "Looking for a relationship", value: "relationship" },
  { label: "Something casual", value: "casual" },
  { label: "Just here to meet people", value: "meet_people" },
  { label: "Not sure yet", value: "not_sure" },
];

const TIERS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "",
    features: [
      "Browse and discover events",
      "Buy individual tickets ($50–100)",
      "Basic member profile",
    ],
    notIncluded: ["Double Take matching", "Priority RSVP", "+1 Guest pass"],
    cta: "Continue Free",
  },
  {
    id: "social" as const,
    name: "Social",
    price: "$49",
    period: "/mo",
    popular: true,
    features: [
      "25% off all event tickets",
      "Double Take matching",
      "Priority RSVP",
      "ID verification included",
    ],
    notIncluded: ["+1 Guest pass", "Early event announcements"],
    cta: "Choose Social",
  },
  {
    id: "premier" as const,
    name: "Premier",
    price: "$125",
    period: "/mo",
    features: [
      "1 event ticket included per month",
      "25% off additional tickets",
      "Double Take matching",
      "+1 Guest pass per event",
      "Priority RSVP & matching",
      "Early event announcements",
      "ID verification included",
    ],
    notIncluded: [],
    cta: "Choose Premier",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const checkoutStep = searchParams.get("step");

  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<
    "free" | "social" | "premier"
  >("free");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState(false);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    age: "",
    gender: "",
    instagram: "",
    neighborhood: "",
    work: "",
    bio: "",
    interests: [] as string[],
    drinking: "",
    smoking: "",
    intentions: "",
  });

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          age: data.age?.toString() || "",
          gender: data.gender || "",
          instagram: data.instagram || "",
          neighborhood: data.neighborhood || "",
          work: data.work || "",
          bio: data.bio || "",
          interests: data.interests || [],
          drinking: data.drinking || "",
          smoking: data.smoking || "",
          intentions: data.intentions || "",
        });

        // Load existing avatar preview if available
        if (data.avatar_upload_path) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.avatar_upload_path);
          if (urlData?.publicUrl) {
            setAvatarPreview(urlData.publicUrl);
          }
        }

        // If onboarding already completed, go to dashboard
        if (data.onboarding_completed) {
          router.push("/dashboard");
          return;
        }
      }

      setLoading(false);
    }

    // If returning from Stripe checkout
    if (checkoutStep === "complete") {
      setStep("welcome");
      setLoading(false);
      return;
    }

    loadProfile();
  }, [router, checkoutStep]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      setError("Please upload a JPG, PNG, WebP, or HEIC image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }

    setError(null);
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleProfileSave = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    // Validation
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      setSaving(false);
      return;
    }
    if (!avatarFile && !avatarPreview) {
      setError("A profile photo is required.");
      setSaving(false);
      return;
    }
    if (form.interests.length < 3) {
      setError("Please select at least 3 interests.");
      setSaving(false);
      return;
    }
    if (!form.intentions) {
      setError("Please select your intentions.");
      setSaving(false);
      return;
    }

    let avatarPath = profile.avatar_upload_path;

    // Upload avatar if a new file was selected
    if (avatarFile) {
      setUploadingAvatar(true);
      const fileExt = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Determine content type — iPhone sometimes sends empty type for HEIC
      let contentType = avatarFile.type;
      if (!contentType || contentType === "application/octet-stream") {
        const extMap: Record<string, string> = {
          jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
          webp: "image/webp", heic: "image/heic", heif: "image/heif",
        };
        contentType = extMap[fileExt] || "image/jpeg";
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType,
        });

      setUploadingAvatar(false);

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        setError(`Failed to upload photo: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      avatarPath = filePath;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        instagram: form.instagram || null,
        neighborhood: form.neighborhood || null,
        work: form.work || null,
        avatar_upload_path: avatarPath,
        bio: form.bio || null,
        interests: form.interests.length > 0 ? form.interests : null,
        drinking: form.drinking || null,
        smoking: form.smoking || null,
        intentions: form.intentions || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (updateError) {
      setError("Failed to save profile. Please try again.");
      return;
    }
    setStep("verify-id");
  }, [profile, form, avatarFile, avatarPreview]);

  const handleIdUpload = useCallback(async () => {
    if (!idFile || !profile) return;
    setUploadingId(true);
    setError(null);

    const fileExt = idFile.name.split(".").pop();
    const filePath = `${profile.id}/id-document.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("id-documents")
      .upload(filePath, idFile, { upsert: true });

    if (uploadError) {
      setUploadingId(false);
      setError("Failed to upload ID. Please try again.");
      return;
    }

    // Update profile with document path and status
    await supabase
      .from("profiles")
      .update({
        id_document_path: filePath,
        verification_status: "id_uploaded",
      })
      .eq("id", profile.id);

    setUploadingId(false);
    setStep("choose-tier");
  }, [idFile, profile]);

  const handleTierSelect = useCallback(
    async (tier: "free" | "social" | "premier") => {
      setSelectedTier(tier);

      if (tier === "free") {
        // Mark onboarding complete, go to welcome
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            onboarding_completed: true,
          })
          .eq("id", profile!.id);

        // Claim invite token
        if (token) {
          const service = await fetch("/api/onboarding/claim-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }

        setStep("welcome");
        return;
      }

      // For paid tiers, redirect to Stripe Checkout
      setSaving(true);
      try {
        const res = await fetch("/api/onboarding/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier, token }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Failed to create checkout session");
          setSaving(false);
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setSaving(false);
      }
    },
    [profile, token]
  );

  const handleCompleteOnboarding = useCallback(async () => {
    if (!profile) return;
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", profile.id);

    if (token) {
      await fetch("/api/onboarding/claim-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }

    router.push("/dashboard");
  }, [profile, token, router]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(step);

  const isProfileValid =
    form.first_name.trim() !== "" &&
    form.last_name.trim() !== "" &&
    (!!avatarFile || !!avatarPreview) &&
    form.interests.length >= 3 &&
    form.intentions !== "";

  return (
    <>
      {/* Progress bar */}
      <div className="flex gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= stepIndex ? "bg-gold" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-widest">
          TR&Uuml;
        </h1>
        <p className="text-[10px] text-white/30 tracking-[0.35em] uppercase mt-1">
          Nashville
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* ─── STEP 1: Profile ─── */}
          {step === "profile" && (
            <div className="bg-[#141415] border border-white/[0.06] rounded-2xl p-8">
              <p className="text-gold text-[10px] font-medium tracking-[0.25em] uppercase mb-3">
                Step 1 of 5
              </p>
              <h2 className="text-xl font-bold text-white mb-1">
                Confirm your profile
              </h2>
              <p className="text-white/40 text-sm mb-8">
                We&apos;ve pre-filled your info from your application.
              </p>

              <div className="space-y-6">
                {/* ── Profile Photo ── */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-gold/40 transition-colors group focus:outline-none focus:border-gold/60"
                  >
                    {avatarPreview ? (
                      <>
                        <Image
                          src={avatarPreview}
                          alt="Profile photo"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                            />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-7 h-7 text-white/30 group-hover:text-gold/60 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                          />
                        </svg>
                        <span className="text-white/30 text-[10px] font-medium">
                          Add Photo
                        </span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <p className="text-white/30 text-[10px] mt-2">
                    JPG or PNG &mdash; max 5MB
                  </p>
                </div>

                {/* ── Name Fields ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) =>
                        setForm({ ...form, last_name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40"
                    />
                  </div>
                </div>

                {/* ── Bio ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    About You
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setForm({ ...form, bio: e.target.value });
                      }
                    }}
                    placeholder="Tell people a little about yourself..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40 placeholder:text-white/20 resize-none"
                  />
                  <p className="text-white/25 text-[10px] text-right mt-1">
                    {form.bio.length}/200
                  </p>
                </div>

                {/* ── Phone ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40"
                  />
                </div>

                {/* ── Age / Gender ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) =>
                        setForm({ ...form, age: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>
                </div>

                {/* ── Instagram ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) =>
                      setForm({ ...form, instagram: e.target.value })
                    }
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40 placeholder:text-white/20"
                  />
                </div>

                {/* ── Neighborhood ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    Neighborhood
                  </label>
                  <select
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm({ ...form, neighborhood: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40 appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Germantown">Germantown</option>
                    <option value="East Nashville">East Nashville</option>
                    <option value="The Gulch">The Gulch</option>
                    <option value="12 South">12 South</option>
                    <option value="Midtown">Midtown</option>
                    <option value="West End">West End</option>
                    <option value="Hillsboro Village">Hillsboro Village</option>
                    <option value="Berry Hill">Berry Hill</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* ── Work ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    What do you do?
                  </label>
                  <input
                    type="text"
                    value={form.work}
                    onChange={(e) =>
                      setForm({ ...form, work: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40"
                  />
                </div>

                {/* ── Interests ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">
                    Interests *{" "}
                    <span className="text-white/25">
                      ({form.interests.length} selected &mdash; pick at least 3)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {INTEREST_OPTIONS.map((interest) => {
                      const selected = form.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            selected
                              ? "bg-gold/15 border border-gold text-gold"
                              : "bg-white/5 border border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Drinking ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-2">
                    Drinking
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DRINKING_OPTIONS.map((opt) => {
                      const selected = form.drinking === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, drinking: opt.value })
                          }
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            selected
                              ? "bg-gold/15 border border-gold text-gold"
                              : "bg-white/5 border border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Smoking ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-2">
                    Smoking
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SMOKING_OPTIONS.map((opt) => {
                      const selected = form.smoking === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, smoking: opt.value })
                          }
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            selected
                              ? "bg-gold/15 border border-gold text-gold"
                              : "bg-white/5 border border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Intentions ── */}
                <div>
                  <label className="block text-white/50 text-xs mb-2">
                    Intentions *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTENTIONS_OPTIONS.map((opt) => {
                      const selected = form.intentions === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, intentions: opt.value })
                          }
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            selected
                              ? "bg-gold/15 border border-gold text-gold"
                              : "bg-white/5 border border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}

              <button
                onClick={handleProfileSave}
                disabled={saving || uploadingAvatar || !isProfileValid}
                className="w-full mt-8 py-4 rounded-full bg-gradient-to-r from-gold to-[#b8935e] text-[#0C0C0D] font-semibold text-sm tracking-wide disabled:opacity-40 transition-opacity"
              >
                {uploadingAvatar
                  ? "Uploading photo..."
                  : saving
                    ? "Saving..."
                    : "Continue"}
              </button>
            </div>
          )}

          {/* ─── STEP 2: ID Verification ─── */}
          {step === "verify-id" && (
            <div className="bg-[#141415] border border-white/[0.06] rounded-2xl p-8">
              <p className="text-gold text-[10px] font-medium tracking-[0.25em] uppercase mb-3">
                Step 2 of 5
              </p>
              <h2 className="text-xl font-bold text-white mb-1">
                Verify your identity
              </h2>
              <p className="text-white/40 text-sm mb-8">
                Upload a photo of your driver&apos;s license or passport. This
                keeps our community safe and verified.
              </p>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-gold/30 transition-colors">
                {idFile ? (
                  <div>
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-gold text-xl">&#10003;</span>
                    </div>
                    <p className="text-white text-sm font-medium">
                      {idFile.name}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {(idFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      onClick={() => setIdFile(null)}
                      className="text-white/40 text-xs mt-3 hover:text-white/60"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <span className="text-white/40 text-xl">&#128247;</span>
                    </div>
                    <p className="text-white/60 text-sm font-medium">
                      Click to upload
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      JPG, PNG, or PDF &mdash; max 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size <= 10 * 1024 * 1024) {
                          setIdFile(file);
                        } else if (file) {
                          setError("File must be under 10MB");
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="mt-6 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-white/50 text-xs leading-relaxed">
                  <span className="text-white/70 font-medium">
                    Why do we need this?
                  </span>{" "}
                  Every TR&Uuml; member is verified. Your ID is stored securely
                  and only reviewed by our team. It&apos;s never shared with
                  other members.
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep("choose-tier")}
                  className="flex-1 py-4 rounded-full border border-white/10 text-white/60 font-medium text-sm hover:border-white/20 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleIdUpload}
                  disabled={!idFile || uploadingId}
                  className="flex-1 py-4 rounded-full bg-gradient-to-r from-gold to-[#b8935e] text-[#0C0C0D] font-semibold text-sm disabled:opacity-40 transition-opacity"
                >
                  {uploadingId ? "Uploading..." : "Upload & Continue"}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Choose Tier ─── */}
          {step === "choose-tier" && (
            <div>
              <p className="text-gold text-[10px] font-medium tracking-[0.25em] uppercase mb-3 text-center">
                Step 3 of 5
              </p>
              <h2 className="text-xl font-bold text-white mb-1 text-center">
                Choose your membership
              </h2>
              <p className="text-white/40 text-sm mb-8 text-center">
                You can always upgrade or change your plan later.
              </p>

              <div className="space-y-4">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => handleTierSelect(tier.id)}
                    disabled={saving}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 ${
                      tier.popular
                        ? "bg-gold/[0.06] border-gold/20 hover:border-gold/40"
                        : "bg-[#141415] border-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold text-lg">
                          {tier.name}
                        </h3>
                        {tier.popular && (
                          <span className="text-[9px] text-gold font-bold tracking-widest uppercase bg-gold/10 px-2.5 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-xl">
                          {tier.price}
                        </span>
                        <span className="text-white/40 text-sm">
                          {tier.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-white/60"
                        >
                          <span className="text-gold mt-0.5 text-xs">
                            &#10003;
                          </span>
                          {f}
                        </li>
                      ))}
                      {tier.notIncluded.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-white/25"
                        >
                          <span className="mt-0.5 text-xs">&mdash;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-4 text-center">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ─── STEP 4: Payment (redirect state) ─── */}
          {step === "payment" && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                Redirecting to checkout...
              </p>
            </div>
          )}

          {/* ─── STEP 5: Welcome ─── */}
          {step === "welcome" && (
            <div className="bg-[#141415] border border-white/[0.06] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-6">
                <span className="text-gold text-3xl">&#10024;</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                You&apos;re all set.
              </h2>
              <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">
                Welcome to TR&Uuml;. Browse upcoming events, RSVP, and meet
                interesting people in Nashville.
              </p>

              <button
                onClick={handleCompleteOnboarding}
                className="w-full py-4 rounded-full bg-gradient-to-r from-gold to-[#b8935e] text-[#0C0C0D] font-semibold text-sm tracking-wide"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
