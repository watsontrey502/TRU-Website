"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

type VerificationStatus =
  | "unverified"
  | "id_uploaded"
  | "id_approved"
  | "background_pending"
  | "verified"
  | "rejected";

type MembershipTier = "standard" | "premium" | "elite" | "founding";

type FilterTab =
  | "all"
  | "id_uploaded"
  | "background_pending"
  | "verified"
  | "rejected";

interface VerificationUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: string | null;
  gender: string | null;
  avatar_url: string | null;
  membership_tier: MembershipTier | null;
  verification_status: VerificationStatus;
  id_document_path: string | null;
  id_reviewed_at: string | null;
  background_check_id: string | null;
  background_check_status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  unverified: {
    label: "Unverified",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  id_uploaded: {
    label: "ID Pending Review",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  id_approved: {
    label: "ID Approved",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  background_pending: {
    label: "Background Pending",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  verified: {
    label: "Verified",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

const TIER_CONFIG: Record<
  MembershipTier,
  { label: string; bg: string; text: string }
> = {
  standard: {
    label: "Standard",
    bg: "bg-white/5",
    text: "text-[#BDB8B2]",
  },
  premium: {
    label: "Premium",
    bg: "bg-gold/10",
    text: "text-gold",
  },
  elite: {
    label: "Elite",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  founding: {
    label: "Founding",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
  },
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "id_uploaded", label: "Pending Review" },
  { key: "background_pending", label: "Background Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminVerificationPage() {
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [idImageUrl, setIdImageUrl] = useState<string | null>(null);
  const [idImageLoading, setIdImageLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // --- Load data ---

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/verification");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      } else {
        toast("Failed to load verification data", "error");
      }
    } catch {
      toast("Failed to load verification data", "error");
    }
  }, [toast]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/dashboard");
        return;
      }
      setIsAdmin(true);
      await fetchUsers();
      setLoading(false);
    }
    load();
  }, [supabase, router, fetchUsers]);

  // --- Actions ---

  const approveId = useCallback(
    async (userId: string, notes?: string) => {
      setUpdating((prev) => new Set(prev).add(userId));
      try {
        const res = await fetch("/api/admin/verification", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            action: "approve_id",
            admin_notes: notes,
          }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    verification_status: "id_approved" as VerificationStatus,
                    id_reviewed_at: new Date().toISOString(),
                    admin_notes: notes ?? u.admin_notes,
                  }
                : u
            )
          );
          toast("ID approved", "success");
        } else {
          toast("Failed to approve ID", "error");
        }
      } finally {
        setUpdating((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [toast]
  );

  const rejectId = useCallback(
    async (userId: string, notes?: string) => {
      setUpdating((prev) => new Set(prev).add(userId));
      try {
        const res = await fetch("/api/admin/verification", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            action: "reject_id",
            admin_notes: notes,
          }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    verification_status: "rejected" as VerificationStatus,
                    admin_notes: notes ?? u.admin_notes,
                  }
                : u
            )
          );
          toast("ID rejected", "error");
        } else {
          toast("Failed to reject ID", "error");
        }
      } finally {
        setUpdating((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [toast]
  );

  const triggerBackgroundCheck = useCallback(
    async (userId: string) => {
      setUpdating((prev) => new Set(prev).add(userId));
      try {
        const res = await fetch("/api/admin/verification", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            action: "run_background_check",
          }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    verification_status:
                      "background_pending" as VerificationStatus,
                  }
                : u
            )
          );
          toast("Background check initiated via Checkr", "success");
        } else {
          const data = await res.json().catch(() => ({}));
          toast(data.error ?? "Failed to trigger background check", "error");
        }
      } finally {
        setUpdating((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [toast]
  );

  const saveNotes = useCallback(
    async (userId: string, notes: string) => {
      await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "save_notes", admin_notes: notes }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, admin_notes: notes } : u))
      );
    },
    []
  );

  const fetchIdImage = useCallback(
    async (path: string) => {
      setIdImageLoading(true);
      setIdImageUrl(null);
      try {
        const { data, error } = await supabase.storage
          .from("id-documents")
          .createSignedUrl(path, 300);
        if (!error && data?.signedUrl) {
          setIdImageUrl(data.signedUrl);
        } else {
          toast("Failed to load ID image", "error");
        }
      } catch {
        toast("Failed to load ID image", "error");
      } finally {
        setIdImageLoading(false);
      }
    },
    [supabase, toast]
  );

  // --- Filtering ---

  const counts = users.reduce(
    (acc, u) => {
      acc[u.verification_status] = (acc[u.verification_status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const tabFiltered =
    activeTab === "all"
      ? users
      : users.filter((u) => {
          if (activeTab === "id_uploaded")
            return u.verification_status === "id_uploaded";
          if (activeTab === "background_pending")
            return (
              u.verification_status === "background_pending" ||
              u.verification_status === "id_approved"
            );
          return u.verification_status === activeTab;
        });

  const filtered = search
    ? tabFiltered.filter((u) =>
        `${u.first_name} ${u.last_name} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : tabFiltered;

  const detailUser = users.find((u) => u.id === detailId) ?? null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // --- Loading / auth gate ---

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalUnverified = users.filter(
    (u) => u.verification_status === "unverified"
  ).length;
  const pendingReview = counts.id_uploaded || 0;
  const backgroundPending =
    (counts.background_pending || 0) + (counts.id_approved || 0);
  const verifiedCount = counts.verified || 0;
  const rejectedCount = counts.rejected || 0;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
          Verification Review
        </h1>
        <p className="text-[#BDB8B2] text-sm">
          Review ID documents and manage background checks for members.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Unverified" value={totalUnverified} />
        <StatCard
          label="ID Pending Review"
          value={pendingReview}
          highlight={pendingReview > 0}
        />
        <StatCard
          label="Background Pending"
          value={backgroundPending}
          color="purple"
        />
        <StatCard label="Verified" value={verifiedCount} color="emerald" />
        <StatCard label="Rejected" value={rejectedCount} color="red" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          let count = 0;
          if (tab.key === "all") count = users.length;
          else if (tab.key === "id_uploaded") count = counts.id_uploaded || 0;
          else if (tab.key === "background_pending")
            count = (counts.background_pending || 0) + (counts.id_approved || 0);
          else count = counts[tab.key] || 0;

          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-gold text-black"
                  : "bg-white/5 text-[#BDB8B2] hover:bg-white/10"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs ${active ? "text-black/50" : "text-[#BDB8B2]/60"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-champagne placeholder:text-[#BDB8B2]/40 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20"
        />
      </div>

      {/* User List */}
      <div className="bg-[#131315] rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_120px_120px_140px] gap-3 px-4 py-3 border-b border-white/10 text-xs uppercase tracking-wide text-[#BDB8B2] font-medium items-center">
          <span>Member</span>
          <span>Contact</span>
          <span>Tier</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#BDB8B2] text-sm">
            {search ? "No matches found." : "No members to display."}
          </div>
        ) : (
          filtered.map((u) => {
            const cfg = STATUS_CONFIG[u.verification_status];
            const tierCfg = u.membership_tier
              ? TIER_CONFIG[u.membership_tier]
              : null;
            const isUpdating = updating.has(u.id);

            return (
              <div
                key={u.id}
                className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="px-4 py-3 md:grid md:grid-cols-[1fr_1fr_120px_120px_140px] gap-3 items-center">
                  {/* Name */}
                  <button
                    onClick={() => {
                      setDetailId(u.id);
                      if (u.id_document_path) {
                        fetchIdImage(u.id_document_path);
                      }
                    }}
                    className="text-left cursor-pointer"
                  >
                    <span className="font-medium text-champagne text-sm hover:underline">
                      {u.first_name} {u.last_name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {u.gender && (
                        <span className="text-xs text-[#BDB8B2]">
                          {u.gender}
                        </span>
                      )}
                      {u.age && (
                        <span className="text-xs text-[#BDB8B2]">
                          {u.age}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Contact */}
                  <div className="text-sm text-[#BDB8B2] mt-1 md:mt-0 truncate">
                    {u.email}
                  </div>

                  {/* Tier badge */}
                  <div className="mt-1 md:mt-0">
                    {tierCfg ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierCfg.bg} ${tierCfg.text}`}
                      >
                        {tierCfg.label}
                      </span>
                    ) : (
                      <span className="text-xs text-[#BDB8B2]/40">--</span>
                    )}
                  </div>

                  {/* Verification status */}
                  <div className="mt-1 md:mt-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-2 md:mt-0">
                    {u.verification_status === "id_uploaded" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailId(u.id);
                          if (u.id_document_path) {
                            fetchIdImage(u.id_document_path);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                      >
                        Review ID
                      </button>
                    )}
                    {u.verification_status === "id_approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerBackgroundCheck(u.id);
                        }}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Run Background Check
                      </button>
                    )}
                    {u.verification_status === "background_pending" && (
                      <span className="text-xs text-purple-400 flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </span>
                    )}
                    {u.verification_status === "verified" && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Complete
                      </span>
                    )}
                    {isUpdating && (
                      <div className="w-4 h-4 border-2 border-gold/40 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Slide-Out Panel */}
      <AnimatePresence>
        {detailUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDetailId(null);
                setIdImageUrl(null);
              }}
              className="fixed inset-0 bg-black/30 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-[#1A1A1D] z-50 overflow-y-auto shadow-2xl"
            >
              <IDReviewPanel
                user={detailUser}
                idImageUrl={idImageUrl}
                idImageLoading={idImageLoading}
                onClose={() => {
                  setDetailId(null);
                  setIdImageUrl(null);
                }}
                onApproveId={(notes) => approveId(detailUser.id, notes)}
                onRejectId={(notes) => rejectId(detailUser.id, notes)}
                onTriggerBackgroundCheck={() =>
                  triggerBackgroundCheck(detailUser.id)
                }
                onSaveNotes={(notes) => saveNotes(detailUser.id, notes)}
                isUpdating={updating.has(detailUser.id)}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  color?: "emerald" | "red" | "purple";
}) {
  let bgClass = "bg-[#131315] border-white/10";
  let textClass = "text-champagne";

  if (highlight) {
    bgClass = "bg-amber-500/10 border-amber-500/20";
    textClass = "text-amber-400";
  } else if (color === "emerald") {
    bgClass = "bg-emerald-500/5 border-emerald-500/10";
    textClass = "text-emerald-400";
  } else if (color === "red") {
    bgClass = "bg-red-500/5 border-red-500/10";
    textClass = "text-red-400";
  } else if (color === "purple") {
    bgClass = "bg-purple-500/5 border-purple-500/10";
    textClass = "text-purple-400";
  }

  return (
    <div className={`rounded-2xl border px-4 py-4 ${bgClass}`}>
      <p className="text-xs text-[#BDB8B2] font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-semibold ${textClass}`}>{value}</p>
    </div>
  );
}

function IDReviewPanel({
  user: u,
  idImageUrl,
  idImageLoading,
  onClose,
  onApproveId,
  onRejectId,
  onTriggerBackgroundCheck,
  onSaveNotes,
  isUpdating,
  formatDate,
  formatDateTime,
}: {
  user: VerificationUser;
  idImageUrl: string | null;
  idImageLoading: boolean;
  onClose: () => void;
  onApproveId: (notes?: string) => void;
  onRejectId: (notes?: string) => void;
  onTriggerBackgroundCheck: () => void;
  onSaveNotes: (notes: string) => void;
  isUpdating: boolean;
  formatDate: (iso: string) => string;
  formatDateTime: (iso: string) => string;
}) {
  const [notes, setNotes] = useState(u.admin_notes ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cfg = STATUS_CONFIG[u.verification_status];
  const tierCfg = u.membership_tier ? TIER_CONFIG[u.membership_tier] : null;

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSaveNotes(value), 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="font-serif text-lg font-semibold text-champagne">
          ID Review
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-[#BDB8B2]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Name + Status + Tier */}
        <div>
          <h3 className="font-serif text-2xl font-semibold text-champagne">
            {u.first_name} {u.last_name}
          </h3>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {tierCfg && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierCfg.bg} ${tierCfg.text}`}
              >
                {tierCfg.label}
              </span>
            )}
            {u.age && (
              <span className="text-sm text-[#BDB8B2]">{u.age}</span>
            )}
            {u.gender && (
              <span className="text-sm text-[#BDB8B2]">{u.gender}</span>
            )}
          </div>
        </div>

        {/* Profile Photo (for comparison) */}
        {u.avatar_url && (
          <div>
            <PanelLabel>Profile Photo</PanelLabel>
            <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.avatar_url}
                alt={`${u.first_name}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="space-y-2">
          <PanelLabel>Contact</PanelLabel>
          <p className="text-sm text-champagne">{u.email}</p>
        </div>

        {/* Uploaded ID Document */}
        <div>
          <PanelLabel>ID Document</PanelLabel>
          <div className="mt-2 rounded-xl border border-white/10 bg-black/20 overflow-hidden">
            {u.id_document_path ? (
              idImageLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : idImageUrl ? (
                <div className="relative group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={idImageUrl}
                    alt="Uploaded ID document"
                    className="w-full max-h-[400px] object-contain"
                  />
                  <a
                    href={idImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-black/60 text-xs text-white hover:bg-black/80"
                  >
                    Open full size
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-sm text-red-400">
                  Failed to load image
                </div>
              )
            ) : (
              <div className="flex items-center justify-center py-16 text-sm text-[#BDB8B2]/40">
                No ID document uploaded
              </div>
            )}
          </div>
        </div>

        {/* Background Check Info */}
        {(u.verification_status === "background_pending" ||
          u.verification_status === "verified" ||
          u.background_check_id) && (
          <div>
            <PanelLabel>Background Check</PanelLabel>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              {u.background_check_id && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#BDB8B2]">Checkr ID</span>
                  <span className="text-xs text-champagne font-mono">
                    {u.background_check_id}
                  </span>
                </div>
              )}
              {u.background_check_status && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#BDB8B2]">Status</span>
                  <span
                    className={`text-xs font-medium ${
                      u.background_check_status === "clear"
                        ? "text-emerald-400"
                        : u.background_check_status === "consider"
                          ? "text-amber-400"
                          : "text-[#BDB8B2]"
                    }`}
                  >
                    {u.background_check_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div>
          <PanelLabel>Admin Notes</PanelLabel>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              onSaveNotes(notes);
            }}
            placeholder="Add notes about this verification review..."
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-champagne placeholder:text-[#BDB8B2]/30 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20 resize-none"
          />
          <p className="text-[10px] text-[#BDB8B2]/40 mt-1">
            Auto-saves. Only visible to admins.
          </p>
        </div>

        {/* Dates */}
        <div className="text-xs text-[#BDB8B2]/50 space-y-1 pt-2 border-t border-white/10">
          <p>Joined: {formatDateTime(u.created_at)}</p>
          {u.id_reviewed_at && (
            <p>ID reviewed: {formatDateTime(u.id_reviewed_at)}</p>
          )}
          {u.updated_at && (
            <p>Last updated: {formatDateTime(u.updated_at)}</p>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 border-t border-white/10 space-y-3">
        {/* ID Review actions */}
        {u.verification_status === "id_uploaded" && (
          <div className="flex gap-2">
            <button
              onClick={() => onApproveId(notes || undefined)}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Approve ID
            </button>
            <button
              onClick={() => onRejectId(notes || undefined)}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Reject ID
            </button>
          </div>
        )}

        {/* After ID approval: trigger background check */}
        {u.verification_status === "id_approved" && (
          <button
            onClick={onTriggerBackgroundCheck}
            disabled={isUpdating}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Run Background Check (Checkr)
          </button>
        )}

        {/* Background pending info */}
        {u.verification_status === "background_pending" && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-purple-400">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Background check in progress...
          </div>
        )}

        {/* Verified badge */}
        {u.verification_status === "verified" && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Fully Verified
          </div>
        )}

        {/* Rejected — allow re-review */}
        {u.verification_status === "rejected" && (
          <div className="text-center">
            <p className="text-xs text-red-400/60 mb-2">
              This member was rejected.
            </p>
          </div>
        )}

        {isUpdating && (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gold/40 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-wide text-gold font-medium block">
      {children}
    </span>
  );
}
