"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "pending" | "approved" | "waitlisted" | "rejected";

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  age: string | null;
  gender: string | null;
  instagram: string | null;
  neighborhood: string | null;
  work: string | null;
  heard_from: string | null;
  interesting: string | null;
  ideal_date: string | null;
  referral_code: string | null;
  status: Status;
  updated_at: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  waitlisted: {
    label: "Waitlisted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

const TABS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminWaitlistPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Status>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

      const { data, error } = await supabase
        .from("waitlist_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setSubmissions(data);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const updateStatus = useCallback(
    async (id: string, status: Status) => {
      setUpdating(id);
      try {
        const res = await fetch("/api/admin/waitlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });

        if (res.ok) {
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === id
                ? { ...s, status, updated_at: new Date().toISOString() }
                : s
            )
          );
        }
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Counts per status
  const counts = submissions.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter by tab then search
  const tabFiltered =
    activeTab === "all"
      ? submissions
      : submissions.filter((s) => s.status === activeTab);

  const filtered = search
    ? tabFiltered.filter((s) =>
        `${s.first_name} ${s.last_name} ${s.email} ${s.neighborhood ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : tabFiltered;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-2">
          Applications
        </h1>
        <p className="text-stone">
          {submissions.length} total &middot;{" "}
          {counts.pending || 0} pending review
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count =
            tab.key === "all" ? submissions.length : counts[tab.key] || 0;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-black text-white"
                  : "bg-gray-100 text-stone hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs ${active ? "text-white/60" : "text-stone"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or neighborhood..."
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-100 text-xs uppercase tracking-wide text-stone font-medium">
          <span>Name</span>
          <span>Email / Phone</span>
          <span>Status</span>
          <span>Applied</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-stone">
            {search ? "No matches found." : "No applications yet."}
          </div>
        ) : (
          filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
            const isExpanded = expanded === s.id;
            const isUpdating = updating === s.id;

            return (
              <div key={s.id}>
                {/* Row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : s.id)}
                  className="w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="md:grid md:grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center">
                    {/* Name */}
                    <div>
                      <span className="font-medium text-black text-sm">
                        {s.first_name} {s.last_name}
                      </span>
                      {s.gender && (
                        <span className="ml-2 text-xs text-stone">
                          {s.gender}
                        </span>
                      )}
                      {s.age && (
                        <span className="ml-1 text-xs text-stone">
                          &middot; {s.age}
                        </span>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="text-sm text-stone mt-1 md:mt-0">
                      <div>{s.email}</div>
                      {s.phone && <div className="text-xs">{s.phone}</div>}
                    </div>

                    {/* Status badge */}
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

                    {/* Date */}
                    <div className="text-xs text-stone mt-1 md:mt-0 whitespace-nowrap">
                      {formatDate(s.created_at)}
                    </div>

                    {/* Chevron */}
                    <div className="hidden md:flex justify-end">
                      <svg
                        className={`w-4 h-4 text-stone transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 py-5 bg-gray-50/80 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      {s.neighborhood && (
                        <Detail label="Neighborhood" value={s.neighborhood} />
                      )}
                      {s.work && <Detail label="Work" value={s.work} />}
                      {s.instagram && (
                        <Detail label="Instagram" value={s.instagram} />
                      )}
                      {s.heard_from && (
                        <Detail label="How they heard" value={s.heard_from} />
                      )}
                      {s.referral_code && (
                        <Detail label="Referral code" value={s.referral_code} />
                      )}
                    </div>

                    {s.interesting && (
                      <div className="mb-4">
                        <span className="text-xs uppercase tracking-wide text-stone font-medium block mb-1">
                          What makes them interesting
                        </span>
                        <p className="text-sm text-black leading-relaxed">
                          {s.interesting}
                        </p>
                      </div>
                    )}

                    {s.ideal_date && (
                      <div className="mb-5">
                        <span className="text-xs uppercase tracking-wide text-stone font-medium block mb-1">
                          Ideal first date
                        </span>
                        <p className="text-sm text-black leading-relaxed">
                          {s.ideal_date}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
                      {s.status !== "approved" && (
                        <ActionButton
                          label="Approve"
                          onClick={() => updateStatus(s.id, "approved")}
                          disabled={isUpdating}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        />
                      )}
                      {s.status !== "waitlisted" && (
                        <ActionButton
                          label="Waitlist"
                          onClick={() => updateStatus(s.id, "waitlisted")}
                          disabled={isUpdating}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        />
                      )}
                      {s.status !== "rejected" && (
                        <ActionButton
                          label="Reject"
                          onClick={() => updateStatus(s.id, "rejected")}
                          disabled={isUpdating}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        />
                      )}
                      {s.status !== "pending" && (
                        <ActionButton
                          label="Reset to Pending"
                          onClick={() => updateStatus(s.id, "pending")}
                          disabled={isUpdating}
                          className="bg-gray-200 hover:bg-gray-300 text-black"
                        />
                      )}
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-stone font-medium block mb-0.5">
        {label}
      </span>
      <p className="text-sm text-black">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  className: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
}
