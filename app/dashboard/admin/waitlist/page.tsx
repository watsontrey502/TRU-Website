"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

type Status = "pending" | "approved" | "waitlisted" | "rejected";
type SortField = "name" | "created_at" | "status";
type SortDir = "asc" | "desc";

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
  admin_notes: string | null;
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
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  waitlisted: {
    label: "Waitlisted",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-400",
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
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Status>("all");
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmReject, setConfirmReject] = useState<{
    ids: string[];
    names: string;
  } | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

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

  // --- Actions ---

  const updateStatus = useCallback(
    async (id: string, status: Status) => {
      setUpdating((prev) => new Set(prev).add(id));
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
          const sub = submissions.find((s) => s.id === id);
          toast(
            `${sub?.first_name ?? "Applicant"} ${STATUS_CONFIG[status].label.toLowerCase()}`,
            status === "rejected" ? "error" : "success"
          );
        } else {
          toast("Failed to update status", "error");
        }
      } finally {
        setUpdating((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [submissions, toast]
  );

  const bulkUpdateStatus = useCallback(
    async (status: Status) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;

      ids.forEach((id) =>
        setUpdating((prev) => new Set(prev).add(id))
      );

      try {
        const res = await fetch("/api/admin/waitlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, status }),
        });
        if (res.ok) {
          setSubmissions((prev) =>
            prev.map((s) =>
              ids.includes(s.id)
                ? { ...s, status, updated_at: new Date().toISOString() }
                : s
            )
          );
          setSelected(new Set());
          toast(
            `${ids.length} applicant${ids.length > 1 ? "s" : ""} ${STATUS_CONFIG[status].label.toLowerCase()}`,
            status === "rejected" ? "error" : "success"
          );
        } else {
          toast("Bulk update failed", "error");
        }
      } finally {
        setUpdating(new Set());
      }
    },
    [selected, toast]
  );

  const saveNotes = useCallback(
    async (id: string, notes: string) => {
      await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_notes: notes }),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, admin_notes: notes } : s))
      );
    },
    []
  );

  // --- Filtering, sorting ---

  const counts = submissions.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const tabFiltered =
    activeTab === "all"
      ? submissions
      : submissions.filter((s) => s.status === activeTab);

  const searched = search
    ? tabFiltered.filter((s) =>
        `${s.first_name} ${s.last_name} ${s.email} ${s.neighborhood ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : tabFiltered;

  const sorted = [...searched].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") {
      cmp = `${a.first_name} ${a.last_name}`.localeCompare(
        `${b.first_name} ${b.last_name}`
      );
    } else if (sortField === "status") {
      cmp = a.status.localeCompare(b.status);
    } else {
      cmp =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const filtered = sorted;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "created_at" ? "desc" : "asc");
    }
  };

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const detailSubmission = submissions.find((s) => s.id === detailId) ?? null;

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

  const approvalRate =
    submissions.length > 0
      ? Math.round(((counts.approved || 0) / submissions.length) * 100)
      : 0;

  const thisWeek = submissions.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
          Applications
        </h1>
        <p className="text-[#BDB8B2] text-sm">
          Manage waitlist submissions and review applicants.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Applicants" value={submissions.length} />
        <StatCard
          label="Pending Review"
          value={counts.pending || 0}
          highlight={!!counts.pending}
        />
        <StatCard label="Approved" value={counts.approved || 0} />
        <StatCard label="This Week" value={thisWeek} sub={`${approvalRate}% approval rate`} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count =
            tab.key === "all" ? submissions.length : counts[tab.key] || 0;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelected(new Set());
              }}
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
          placeholder="Search by name, email, or neighborhood..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-champagne placeholder:text-[#BDB8B2]/40 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20"
        />
      </div>

      {/* Table */}
      <div className="bg-[#131315] rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[40px_1fr_1fr_100px_100px_80px] gap-3 px-4 py-3 border-b border-white/10 text-xs uppercase tracking-wide text-[#BDB8B2] font-medium items-center">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-white/20 text-gold focus:ring-gold accent-gold cursor-pointer"
            />
          </div>
          <SortHeader
            label="Name"
            field="name"
            sortField={sortField}
            sortDir={sortDir}
            onSort={toggleSort}
          />
          <span>Contact</span>
          <SortHeader
            label="Status"
            field="status"
            sortField={sortField}
            sortDir={sortDir}
            onSort={toggleSort}
          />
          <SortHeader
            label="Applied"
            field="created_at"
            sortField={sortField}
            sortDir={sortDir}
            onSort={toggleSort}
          />
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#BDB8B2] text-sm">
            {search ? "No matches found." : "No applications yet."}
          </div>
        ) : (
          filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            const isUpdating = updating.has(s.id);
            const isSelected = selected.has(s.id);

            return (
              <div
                key={s.id}
                className={`group border-b border-white/5 transition-colors ${
                  isSelected ? "bg-gold/5" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="px-4 py-3 md:grid md:grid-cols-[40px_1fr_1fr_100px_100px_80px] gap-3 items-center">
                  {/* Checkbox */}
                  <div className="hidden md:flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(s.id);
                      }}
                      className="w-4 h-4 rounded border-white/20 text-gold focus:ring-gold accent-gold cursor-pointer"
                    />
                  </div>

                  {/* Name — clicking opens detail panel */}
                  <button
                    onClick={() => setDetailId(s.id)}
                    className="text-left cursor-pointer"
                  >
                    <span className="font-medium text-champagne text-sm hover:underline">
                      {s.first_name} {s.last_name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.gender && (
                        <span className="text-xs text-[#BDB8B2]">{s.gender}</span>
                      )}
                      {s.age && (
                        <span className="text-xs text-[#BDB8B2]">{s.age}</span>
                      )}
                      {s.instagram && (
                        <a
                          href={`https://instagram.com/${s.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-pink-500 hover:text-pink-600"
                          title="View Instagram"
                        >
                          <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </button>

                  {/* Contact */}
                  <div className="text-sm text-[#BDB8B2] mt-1 md:mt-0">
                    <div className="truncate">{s.email}</div>
                    {s.phone && <div className="text-xs text-[#BDB8B2]/60">{s.phone}</div>}
                  </div>

                  {/* Status badge */}
                  <div className="mt-1 md:mt-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-[#BDB8B2]/60 mt-1 md:mt-0 whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-end gap-1.5 mt-2 md:mt-0">
                    {s.status !== "approved" && (
                      <QuickAction
                        title="Approve"
                        onClick={() => updateStatus(s.id, "approved")}
                        disabled={isUpdating}
                        color="emerald"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </QuickAction>
                    )}
                    {s.status !== "waitlisted" && (
                      <QuickAction
                        title="Waitlist"
                        onClick={() => updateStatus(s.id, "waitlisted")}
                        disabled={isUpdating}
                        color="blue"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </QuickAction>
                    )}
                    {s.status !== "rejected" && (
                      <QuickAction
                        title="Reject"
                        onClick={() =>
                          setConfirmReject({
                            ids: [s.id],
                            names: `${s.first_name} ${s.last_name}`,
                          })
                        }
                        disabled={isUpdating}
                        color="red"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </QuickAction>
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

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white rounded-2xl px-6 py-3 flex items-center gap-4 shadow-[var(--shadow-elevated)]"
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {selected.size} selected
            </span>
            <div className="w-px h-5 bg-white/20" />
            <button
              onClick={() => bulkUpdateStatus("approved")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => bulkUpdateStatus("waitlisted")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Waitlist
            </button>
            <button
              onClick={() => {
                const names = submissions
                  .filter((s) => selected.has(s.id))
                  .map((s) => s.first_name)
                  .join(", ");
                setConfirmReject({
                  ids: Array.from(selected),
                  names: `${selected.size} applicant${selected.size > 1 ? "s" : ""}`,
                });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              Deselect
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Slide-Out Panel */}
      <AnimatePresence>
        {detailSubmission && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailId(null)}
              className="fixed inset-0 bg-black/30 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-[#1A1A1D] z-50 overflow-y-auto shadow-2xl"
            >
              <DetailPanel
                submission={detailSubmission}
                onClose={() => setDetailId(null)}
                onUpdateStatus={(status) => {
                  if (status === "rejected") {
                    setConfirmReject({
                      ids: [detailSubmission.id],
                      names: `${detailSubmission.first_name} ${detailSubmission.last_name}`,
                    });
                  } else {
                    updateStatus(detailSubmission.id, status);
                  }
                }}
                onSaveNotes={(notes) => saveNotes(detailSubmission.id, notes)}
                isUpdating={updating.has(detailSubmission.id)}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {confirmReject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmReject(null)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1A1A1D] border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl"
            >
              <h3 className="font-serif text-lg font-semibold text-champagne mb-2">
                Confirm Rejection
              </h3>
              <p className="text-sm text-[#BDB8B2] mb-1">
                Are you sure you want to reject{" "}
                <span className="font-medium text-champagne">
                  {confirmReject.names}
                </span>
                ?
              </p>
              <p className="text-xs text-[#BDB8B2]/60 mb-6">
                This will send a rejection email to the applicant
                {confirmReject.ids.length > 1 ? "s" : ""}.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmReject(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#BDB8B2] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmReject.ids.length === 1) {
                      updateStatus(confirmReject.ids[0], "rejected");
                    } else {
                      bulkUpdateStatus("rejected");
                    }
                    setConfirmReject(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
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
  sub,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        highlight
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-[#131315] border-white/10"
      }`}
    >
      <p className="text-xs text-[#BDB8B2] font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-semibold ${
          highlight ? "text-amber-400" : "text-champagne"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[#BDB8B2]/60 mt-0.5">{sub}</p>}
    </div>
  );
}

function SortHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 cursor-pointer hover:text-champagne transition-colors text-left"
    >
      <span>{label}</span>
      {active && (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sortDir === "asc" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          )}
        </svg>
      )}
    </button>
  );
}

function QuickAction({
  title,
  onClick,
  disabled,
  color,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled: boolean;
  color: "emerald" | "blue" | "red";
  children: React.ReactNode;
}) {
  const colors = {
    emerald:
      "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
    blue: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
    red: "text-red-500 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 opacity-60 md:opacity-0 md:group-hover:opacity-100 ${colors[color]}`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </button>
  );
}

function DetailPanel({
  submission: s,
  onClose,
  onUpdateStatus,
  onSaveNotes,
  isUpdating,
  formatDate,
  formatDateTime,
}: {
  submission: Submission;
  onClose: () => void;
  onUpdateStatus: (status: Status) => void;
  onSaveNotes: (notes: string) => void;
  isUpdating: boolean;
  formatDate: (iso: string) => string;
  formatDateTime: (iso: string) => string;
}) {
  const [notes, setNotes] = useState(s.admin_notes ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cfg = STATUS_CONFIG[s.status];

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
          Applicant Details
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
        {/* Name + Status */}
        <div>
          <h3 className="font-serif text-2xl font-semibold text-champagne">
            {s.first_name} {s.last_name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {s.age && <span className="text-sm text-[#BDB8B2]">{s.age}</span>}
            {s.gender && (
              <span className="text-sm text-[#BDB8B2]">{s.gender}</span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <PanelLabel>Contact</PanelLabel>
          <p className="text-sm text-champagne">{s.email}</p>
          {s.phone && <p className="text-sm text-[#BDB8B2]">{s.phone}</p>}
          {s.instagram && (
            <a
              href={`https://instagram.com/${s.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @{s.instagram.replace("@", "")}
            </a>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          {s.neighborhood && (
            <PanelDetail label="Neighborhood" value={s.neighborhood} />
          )}
          {s.work && <PanelDetail label="Work" value={s.work} />}
          {s.heard_from && (
            <PanelDetail label="How they heard" value={s.heard_from} />
          )}
          {s.referral_code && (
            <PanelDetail label="Referral code" value={s.referral_code} />
          )}
        </div>

        {/* Interview responses */}
        {s.interesting && (
          <div>
            <PanelLabel>What makes them interesting</PanelLabel>
            <p className="text-sm text-champagne/80 leading-relaxed mt-1">
              {s.interesting}
            </p>
          </div>
        )}

        {s.ideal_date && (
          <div>
            <PanelLabel>Ideal first date</PanelLabel>
            <p className="text-sm text-champagne/80 leading-relaxed mt-1">
              {s.ideal_date}
            </p>
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
            placeholder="Add private notes about this applicant..."
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-champagne placeholder:text-[#BDB8B2]/30 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20 resize-none"
          />
          <p className="text-[10px] text-[#BDB8B2]/40 mt-1">
            Auto-saves. Only visible to admins.
          </p>
        </div>

        {/* Dates */}
        <div className="text-xs text-[#BDB8B2]/50 space-y-1 pt-2 border-t border-white/10">
          <p>Applied: {formatDateTime(s.created_at)}</p>
          {s.updated_at && <p>Last updated: {formatDateTime(s.updated_at)}</p>}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex flex-wrap gap-2">
        {s.status !== "approved" && (
          <button
            onClick={() => onUpdateStatus("approved")}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {s.status !== "waitlisted" && (
          <button
            onClick={() => onUpdateStatus("waitlisted")}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Waitlist
          </button>
        )}
        {s.status !== "rejected" && (
          <button
            onClick={() => onUpdateStatus("rejected")}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Reject
          </button>
        )}
        {s.status !== "pending" && (
          <button
            onClick={() => onUpdateStatus("pending")}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-[#BDB8B2] transition-colors cursor-pointer disabled:opacity-50"
          >
            Reset
          </button>
        )}
        {isUpdating && (
          <div className="flex items-center justify-center px-2">
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

function PanelDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <p className="text-sm text-champagne mt-0.5">{value}</p>
    </div>
  );
}
