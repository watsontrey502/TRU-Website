"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

// ─── Types ───────────────────────────────────────────────────────

interface Event {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string | null;
  price: number;
  age_range: string | null;
  dress_code: string | null;
  capacity: number | null;
  description: string | null;
  image_url: string | null;
  double_take_open: boolean;
  created_at: string;
  rsvp_count: number;
  checked_in_count: number;
}

interface Attendee {
  id: string;
  profile_id: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
}

interface DoubleTakeVote {
  voter_id: string;
  voted_for_id: string;
  voter: { first_name: string; last_name: string };
  voted_for: { first_name: string; last_name: string };
}

type TabFilter = "upcoming" | "past" | "all";
type View = "list" | "detail" | "form";

interface EventForm {
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string;
  price: string;
  age_range: string;
  dress_code: string;
  capacity: string;
  description: string;
  image_url: string;
}

const EMPTY_FORM: EventForm = {
  name: "",
  date: "",
  time: "",
  venue: "",
  neighborhood: "",
  price: "",
  age_range: "",
  dress_code: "",
  capacity: "",
  description: "",
  image_url: "",
};

const TABS: { key: TabFilter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
];

// ─── Main Component ──────────────────────────────────────────────

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>("upcoming");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("list");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState<Set<string>>(new Set());
  const [doubleTakeVotes, setDoubleTakeVotes] = useState<DoubleTakeVote[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Event | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // ─── Auth + data load ────────────────────────────────────────

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
      await fetchEvents();
    }
    load();
  }, [supabase, router]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Event CRUD ──────────────────────────────────────────────

  const openCreateForm = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setView("form");
  };

  const openEditForm = (event: Event) => {
    setEditingEvent(event);
    setForm({
      name: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      neighborhood: event.neighborhood || "",
      price: String(event.price),
      age_range: event.age_range || "",
      dress_code: event.dress_code || "",
      capacity: event.capacity ? String(event.capacity) : "",
      description: event.description || "",
      image_url: event.image_url || "",
    });
    setView("form");
  };

  const saveEvent = useCallback(async () => {
    if (!form.name || !form.date || !form.time || !form.venue || !form.price) {
      toast("Name, date, time, venue, and price are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editingEvent ? { id: editingEvent.id } : {}),
        name: form.name,
        date: form.date,
        time: form.time,
        venue: form.venue,
        neighborhood: form.neighborhood || null,
        price: parseInt(form.price),
        age_range: form.age_range || null,
        dress_code: form.dress_code || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        description: form.description || null,
        image_url: form.image_url || null,
      };

      const res = await fetch("/api/admin/events", {
        method: editingEvent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(
          editingEvent ? "Event updated" : "Event created",
          "success"
        );
        await fetchEvents();
        setView("list");
        setEditingEvent(null);
        setForm(EMPTY_FORM);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save event", "error");
      }
    } finally {
      setSaving(false);
    }
  }, [form, editingEvent, toast]);

  const deleteEvent = useCallback(
    async (event: Event) => {
      try {
        const res = await fetch(`/api/admin/events?id=${event.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast("Event deleted", "success");
          setEvents((prev) => prev.filter((e) => e.id !== event.id));
          if (selectedEvent?.id === event.id) {
            setView("list");
            setSelectedEvent(null);
          }
        } else {
          toast("Failed to delete event", "error");
        }
      } finally {
        setConfirmDelete(null);
      }
    },
    [selectedEvent, toast]
  );

  const toggleDoubleTake = useCallback(
    async (event: Event) => {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          double_take_open: !event.double_take_open,
        }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? { ...e, double_take_open: !e.double_take_open }
              : e
          )
        );
        if (selectedEvent?.id === event.id) {
          setSelectedEvent((prev) =>
            prev ? { ...prev, double_take_open: !prev.double_take_open } : prev
          );
        }
        toast(
          `Double Take ${!event.double_take_open ? "opened" : "closed"}`,
          "success"
        );
      }
    },
    [selectedEvent, toast]
  );

  // ─── Event detail / attendees ────────────────────────────────

  const openEventDetail = useCallback(
    async (event: Event) => {
      setSelectedEvent(event);
      setView("detail");
      setAttendeesLoading(true);
      setAttendeeSearch("");

      try {
        const { data, error } = await supabase
          .from("event_attendees")
          .select(
            "id, profile_id, status, checked_in_at, created_at, profiles(first_name, last_name, email, phone)"
          )
          .eq("event_id", event.id)
          .neq("status", "cancelled")
          .order("created_at", { ascending: true });

        if (!error && data) {
          setAttendees(data as unknown as Attendee[]);
        }

        // Load double take votes
        const { data: votes } = await supabase
          .from("double_take_votes")
          .select(
            "voter_id, voted_for_id, voter:profiles!double_take_votes_voter_id_fkey(first_name, last_name), voted_for:profiles!double_take_votes_voted_for_id_fkey(first_name, last_name)"
          )
          .eq("event_id", event.id);

        if (votes) {
          setDoubleTakeVotes(votes as unknown as DoubleTakeVote[]);
        }
      } finally {
        setAttendeesLoading(false);
      }
    },
    [supabase]
  );

  // ─── Check-in ────────────────────────────────────────────────

  const checkInAttendee = useCallback(
    async (attendee: Attendee, action: "checkin" | "undo") => {
      if (!selectedEvent) return;
      setCheckingIn((prev) => new Set(prev).add(attendee.id));
      try {
        const res = await fetch(
          `/api/events/${selectedEvent.slug}/checkin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attendee_id: attendee.id,
              action,
            }),
          }
        );
        if (res.ok) {
          setAttendees((prev) =>
            prev.map((a) =>
              a.id === attendee.id
                ? {
                    ...a,
                    status: action === "checkin" ? "checked_in" : "confirmed",
                    checked_in_at:
                      action === "checkin"
                        ? new Date().toISOString()
                        : null,
                  }
                : a
            )
          );
          toast(
            action === "checkin"
              ? `${attendee.profiles.first_name} checked in`
              : `${attendee.profiles.first_name} check-in undone`,
            "success"
          );
        }
      } finally {
        setCheckingIn((prev) => {
          const next = new Set(prev);
          next.delete(attendee.id);
          return next;
        });
      }
    },
    [selectedEvent, toast]
  );

  const bulkCheckIn = useCallback(async () => {
    if (!selectedEvent) return;
    const unchecked = attendees.filter((a) => a.status !== "checked_in");
    for (const a of unchecked) {
      await checkInAttendee(a, "checkin");
    }
  }, [selectedEvent, attendees, checkInAttendee]);

  // ─── Filtering ───────────────────────────────────────────────

  const now = new Date().toISOString().split("T")[0];

  const tabCounts = useMemo(() => {
    const upcoming = events.filter((e) => e.date >= now).length;
    const past = events.filter((e) => e.date < now).length;
    return { upcoming, past, all: events.length };
  }, [events, now]);

  const filtered = useMemo(() => {
    let list = events;

    if (activeTab === "upcoming") {
      list = list.filter((e) => e.date >= now);
    } else if (activeTab === "past") {
      list = list.filter((e) => e.date < now);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.neighborhood && e.neighborhood.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      if (activeTab === "past") return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    });
  }, [events, activeTab, search, now]);

  const filteredAttendees = useMemo(() => {
    if (!attendeeSearch) return attendees;
    const q = attendeeSearch.toLowerCase();
    return attendees.filter(
      (a) =>
        `${a.profiles.first_name} ${a.profiles.last_name}`
          .toLowerCase()
          .includes(q) ||
        a.profiles.email.toLowerCase().includes(q)
    );
  }, [attendees, attendeeSearch]);

  // ─── Helpers ─────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const isUpcoming = (date: string) => date >= now;

  // ─── Matches computation ─────────────────────────────────────

  const matches = useMemo(() => {
    const mutualPairs: {
      userA: string;
      userB: string;
      nameA: string;
      nameB: string;
    }[] = [];
    const seen = new Set<string>();

    for (const v of doubleTakeVotes) {
      const reciprocal = doubleTakeVotes.find(
        (r) =>
          r.voter_id === v.voted_for_id && r.voted_for_id === v.voter_id
      );
      if (reciprocal) {
        const key = [v.voter_id, v.voted_for_id].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          mutualPairs.push({
            userA: v.voter_id,
            userB: v.voted_for_id,
            nameA: `${v.voter.first_name} ${v.voter.last_name}`,
            nameB: `${v.voted_for.first_name} ${v.voted_for.last_name}`,
          });
        }
      }
    }
    return mutualPairs;
  }, [doubleTakeVotes]);

  // ─── Loading / auth gate ─────────────────────────────────────

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render: Create/Edit Form ────────────────────────────────

  if (view === "form") {
    return (
      <>
        <div className="mb-6">
          <button
            onClick={() => {
              setView(selectedEvent ? "detail" : "list");
              setEditingEvent(null);
              setForm(EMPTY_FORM);
            }}
            className="flex items-center gap-1.5 text-sm text-[#BDB8B2] hover:text-champagne transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
            {editingEvent ? "Edit Event" : "Create Event"}
          </h1>
          <p className="text-[#BDB8B2] text-sm">
            {editingEvent
              ? "Update event details below."
              : "Fill in the details to create a new event."}
          </p>
        </div>

        <div className="bg-[#131315] rounded-2xl border border-white/10 p-6 space-y-5">
          <FormField label="Event Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Speed Dating at The 404"
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="form-input"
              />
            </FormField>
            <FormField label="Time" required>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Venue" required>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="The 404 Kitchen"
                className="form-input"
              />
            </FormField>
            <FormField label="Neighborhood">
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
                placeholder="The Gulch"
                className="form-input"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField label="Price ($)" required>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="45"
                min="0"
                className="form-input"
              />
            </FormField>
            <FormField label="Capacity">
              <input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                placeholder="30"
                min="1"
                className="form-input"
              />
            </FormField>
            <FormField label="Age Range">
              <input
                type="text"
                value={form.age_range}
                onChange={(e) =>
                  setForm({ ...form, age_range: e.target.value })
                }
                placeholder="25-35"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Dress Code">
            <input
              type="text"
              value={form.dress_code}
              onChange={(e) =>
                setForm({ ...form, dress_code: e.target.value })
              }
              placeholder="Smart Casual"
              className="form-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the event..."
              rows={4}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              placeholder="https://..."
              className="form-input"
            />
          </FormField>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveEvent}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gold text-black hover:bg-gold/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editingEvent ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </button>
            <button
              onClick={() => {
                setView(selectedEvent ? "detail" : "list");
                setEditingEvent(null);
                setForm(EMPTY_FORM);
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-[#BDB8B2] hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        <style jsx>{`
          .form-input {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            padding: 0.625rem 0.875rem;
            font-size: 0.875rem;
            color: var(--champagne, #f5e6d3);
          }
          .form-input::placeholder {
            color: rgba(189, 184, 178, 0.4);
          }
          .form-input:focus {
            outline: none;
            border-color: var(--gold, #c9a96e);
            box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.2);
          }
        `}</style>
      </>
    );
  }

  // ─── Render: Event Detail ────────────────────────────────────

  if (view === "detail" && selectedEvent) {
    const checkedIn = attendees.filter((a) => a.status === "checked_in").length;
    const totalAttendees = attendees.length;

    return (
      <>
        {/* Back + Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              setView("list");
              setSelectedEvent(null);
              setAttendees([]);
              setDoubleTakeVotes([]);
            }}
            className="flex items-center gap-1.5 text-sm text-[#BDB8B2] hover:text-champagne transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Events
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
                {selectedEvent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#BDB8B2]">
                <span>{formatDate(selectedEvent.date)}</span>
                <span className="text-white/20">|</span>
                <span>{formatTime(selectedEvent.time)}</span>
                <span className="text-white/20">|</span>
                <span>{selectedEvent.venue}</span>
                {selectedEvent.neighborhood && (
                  <>
                    <span className="text-white/20">|</span>
                    <span>{selectedEvent.neighborhood}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEditForm(selectedEvent)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-[#BDB8B2] hover:bg-white/10 transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(selectedEvent)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard label="RSVPs" value={totalAttendees} />
          <StatCard
            label="Checked In"
            value={checkedIn}
            sub={
              totalAttendees > 0
                ? `${Math.round((checkedIn / totalAttendees) * 100)}%`
                : undefined
            }
          />
          <StatCard
            label="Capacity"
            value={selectedEvent.capacity || 0}
            sub={
              selectedEvent.capacity
                ? `${totalAttendees}/${selectedEvent.capacity} filled`
                : "Unlimited"
            }
          />
          <StatCard label="Price" value={`$${selectedEvent.price}`} />
          <div
            className={`rounded-2xl border px-4 py-4 ${
              selectedEvent.double_take_open
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-[#131315] border-white/10"
            }`}
          >
            <p className="text-xs text-[#BDB8B2] font-medium uppercase tracking-wide mb-1">
              Double Take
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  selectedEvent.double_take_open
                    ? "text-emerald-400"
                    : "text-[#BDB8B2]"
                }`}
              >
                {selectedEvent.double_take_open ? "Open" : "Closed"}
              </span>
              <button
                onClick={() => toggleDoubleTake(selectedEvent)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedEvent.double_take_open
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                }`}
              >
                {selectedEvent.double_take_open ? "Close" : "Open"}
              </button>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-[#131315] rounded-2xl border border-white/10 p-5 mb-6">
          <h2 className="font-serif text-lg font-semibold text-champagne mb-3">
            Event Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {selectedEvent.age_range && (
              <DetailItem label="Age Range" value={selectedEvent.age_range} />
            )}
            {selectedEvent.dress_code && (
              <DetailItem label="Dress Code" value={selectedEvent.dress_code} />
            )}
            <DetailItem label="Slug" value={selectedEvent.slug} />
          </div>
          {selectedEvent.description && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">
                Description
              </p>
              <p className="text-sm text-champagne/80 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>

        {/* Attendee List */}
        <div className="bg-[#131315] rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold text-champagne">
              Attendees ({totalAttendees})
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Search attendees..."
                className="rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-champagne placeholder:text-[#BDB8B2]/40 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20 w-full md:w-56"
              />
              {attendees.some((a) => a.status !== "checked_in") && (
                <button
                  onClick={bulkCheckIn}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-gold text-black hover:bg-gold/90 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Check In All
                </button>
              )}
            </div>
          </div>

          {attendeesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="p-8 text-center text-[#BDB8B2] text-sm">
              {attendeeSearch
                ? "No matching attendees."
                : "No attendees yet."}
            </div>
          ) : (
            <div>
              {/* Attendee header */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_120px_140px_100px] gap-3 px-5 py-2.5 border-b border-white/10 text-xs uppercase tracking-wide text-[#BDB8B2] font-medium">
                <span>Name</span>
                <span>Email</span>
                <span>Status</span>
                <span>Checked In</span>
                <span className="text-right">Action</span>
              </div>

              {filteredAttendees.map((a) => {
                const isCheckedIn = a.status === "checked_in";
                const isLoading = checkingIn.has(a.id);

                return (
                  <div
                    key={a.id}
                    className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="px-5 py-3 md:grid md:grid-cols-[1fr_1fr_120px_140px_100px] gap-3 items-center">
                      <div>
                        <span className="font-medium text-champagne text-sm">
                          {a.profiles.first_name} {a.profiles.last_name}
                        </span>
                        {a.profiles.phone && (
                          <p className="text-xs text-[#BDB8B2]/60 md:hidden">
                            {a.profiles.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-[#BDB8B2] truncate mt-0.5 md:mt-0">
                        {a.profiles.email}
                      </div>
                      <div className="mt-1 md:mt-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isCheckedIn
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCheckedIn
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                            }`}
                          />
                          {isCheckedIn ? "Checked In" : "Confirmed"}
                        </span>
                      </div>
                      <div className="text-xs text-[#BDB8B2]/60 mt-1 md:mt-0">
                        {a.checked_in_at
                          ? formatDateTime(a.checked_in_at)
                          : "---"}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2 md:mt-0">
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-gold/40 border-t-transparent rounded-full animate-spin" />
                        ) : isCheckedIn ? (
                          <button
                            onClick={() => checkInAttendee(a, "undo")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-[#BDB8B2] hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            onClick={() => checkInAttendee(a, "checkin")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Double Take Matches */}
        {doubleTakeVotes.length > 0 && (
          <div className="bg-[#131315] rounded-2xl border border-white/10 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="font-serif text-lg font-semibold text-champagne">
                Double Take Report
              </h2>
              <p className="text-xs text-[#BDB8B2] mt-0.5">
                {doubleTakeVotes.length} total vote{doubleTakeVotes.length !== 1 ? "s" : ""} &middot;{" "}
                {matches.length} mutual match{matches.length !== 1 ? "es" : ""}
              </p>
            </div>

            {matches.length > 0 ? (
              <div className="divide-y divide-white/5">
                {matches.map((m, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-pink-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <span className="text-champagne font-medium">
                        {m.nameA}
                      </span>
                      <span className="text-[#BDB8B2] mx-2">&harr;</span>
                      <span className="text-champagne font-medium">
                        {m.nameB}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[#BDB8B2] text-sm">
                No mutual matches yet.
              </div>
            )}
          </div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {confirmDelete && (
            <DeleteModal
              event={confirmDelete}
              onConfirm={() => deleteEvent(confirmDelete)}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ─── Render: Event List (default) ────────────────────────────

  const totalRsvps = events.reduce((s, e) => s + e.rsvp_count, 0);
  const totalCheckedIn = events.reduce((s, e) => s + e.checked_in_count, 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
            Events
          </h1>
          <p className="text-[#BDB8B2] text-sm">
            Manage events, attendees, and check-ins.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-black hover:bg-gold/90 transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Events" value={events.length} />
        <StatCard
          label="Upcoming"
          value={tabCounts.upcoming}
          highlight={tabCounts.upcoming > 0}
        />
        <StatCard label="Total RSVPs" value={totalRsvps} />
        <StatCard label="Total Checked In" value={totalCheckedIn} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tabCounts[tab.key];
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
          placeholder="Search by event name, venue, or neighborhood..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-champagne placeholder:text-[#BDB8B2]/40 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20"
        />
      </div>

      {/* Event Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#131315] rounded-2xl border border-white/10 p-8 text-center text-[#BDB8B2] text-sm">
            {search ? "No events match your search." : "No events yet."}
          </div>
        ) : (
          filtered.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#131315] rounded-2xl border border-white/10 hover:border-white/20 transition-all overflow-hidden"
            >
              <button
                onClick={() => openEventDetail(event)}
                className="w-full text-left px-5 py-4 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-serif text-lg font-semibold text-champagne truncate">
                        {event.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                          isUpcoming(event.date)
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-[#BDB8B2]/60"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isUpcoming(event.date)
                              ? "bg-emerald-400"
                              : "bg-[#BDB8B2]/40"
                          }`}
                        />
                        {isUpcoming(event.date) ? "Upcoming" : "Past"}
                      </span>
                      {event.double_take_open && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-pink-500/10 text-pink-400 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          DT Open
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#BDB8B2]">
                      <span>{formatDate(event.date)}</span>
                      <span className="text-white/20">|</span>
                      <span>{formatTime(event.time)}</span>
                      <span className="text-white/20">|</span>
                      <span>{event.venue}</span>
                      {event.neighborhood && (
                        <>
                          <span className="text-white/20">|</span>
                          <span>{event.neighborhood}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-sm">
                    <div className="text-center">
                      <p className="text-champagne font-semibold">
                        ${event.price}
                      </p>
                      <p className="text-[10px] text-[#BDB8B2]/60 uppercase tracking-wide">
                        Price
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-champagne font-semibold">
                        {event.rsvp_count}
                        {event.capacity ? (
                          <span className="text-[#BDB8B2]/40 font-normal">
                            /{event.capacity}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-[#BDB8B2]/60 uppercase tracking-wide">
                        RSVPs
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-emerald-400 font-semibold">
                        {event.checked_in_count}
                      </p>
                      <p className="text-[10px] text-[#BDB8B2]/60 uppercase tracking-wide">
                        Checked In
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#BDB8B2]/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <DeleteModal
            event={confirmDelete}
            onConfirm={() => deleteEvent(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
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
  value: number | string;
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

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-gold font-medium block mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gold font-medium mb-0.5">
        {label}
      </p>
      <p className="text-sm text-champagne">{value}</p>
    </div>
  );
}

function DeleteModal({
  event,
  onConfirm,
  onCancel,
}: {
  event: Event;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
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
          Delete Event
        </h3>
        <p className="text-sm text-[#BDB8B2] mb-1">
          Are you sure you want to delete{" "}
          <span className="font-medium text-champagne">{event.name}</span>?
        </p>
        <p className="text-xs text-[#BDB8B2]/60 mb-6">
          This will permanently remove the event and cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#BDB8B2] hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </>
  );
}
