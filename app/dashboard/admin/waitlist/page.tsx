"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  created_at: string;
}

export default function AdminWaitlistPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check admin status
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

      // Load waitlist
      const { data, error } = await supabase
        .from("waitlist_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setSubmissions(data);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = search
    ? submissions.filter((s) =>
        `${s.first_name} ${s.last_name} ${s.email} ${s.neighborhood ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : submissions;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-dark mb-2">
          Waitlist
        </h1>
        <p className="text-muted">
          {submissions.length} total application{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or neighborhood..."
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-copper focus:ring-copper/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 text-xs uppercase tracking-wide text-muted font-medium">
          <span>Name</span>
          <span>Email / Phone</span>
          <span>Details</span>
          <span>Applied</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted">
            {search ? "No matches found." : "No applications yet."}
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id}>
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center">
                  <div>
                    <span className="font-medium text-dark text-sm">
                      {s.first_name} {s.last_name}
                    </span>
                    {s.gender && (
                      <span className="ml-2 text-xs text-muted">{s.gender}</span>
                    )}
                    {s.age && (
                      <span className="ml-1 text-xs text-muted">· {s.age}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted mt-1 md:mt-0">
                    <div>{s.email}</div>
                    {s.phone && <div className="text-xs">{s.phone}</div>}
                  </div>
                  <div className="text-sm text-muted mt-1 md:mt-0">
                    {s.neighborhood && <span>{s.neighborhood}</span>}
                    {s.heard_from && <span className="text-xs"> · via {s.heard_from}</span>}
                  </div>
                  <div className="text-xs text-muted mt-1 md:mt-0 whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {expanded === s.id && (
                <div className="px-5 py-4 bg-cream/50 border-b border-gray-100 space-y-3">
                  {s.instagram && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted font-medium">Instagram</span>
                      <p className="text-sm text-dark">{s.instagram}</p>
                    </div>
                  )}
                  {s.work && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted font-medium">Work</span>
                      <p className="text-sm text-dark">{s.work}</p>
                    </div>
                  )}
                  {s.interesting && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted font-medium">What makes them interesting</span>
                      <p className="text-sm text-dark">{s.interesting}</p>
                    </div>
                  )}
                  {s.ideal_date && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted font-medium">Ideal first date</span>
                      <p className="text-sm text-dark">{s.ideal_date}</p>
                    </div>
                  )}
                  {s.referral_code && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted font-medium">Referral code</span>
                      <p className="text-sm text-dark">{s.referral_code}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
