"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface EventDetail {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  neighborhood: string;
  price: number;
  age_range: string;
  dress_code: string;
  capacity: number;
  description: string;
  image_url: string;
  double_take_open: boolean;
  live_status: string;
}

interface Attendee {
  profile_id: string;
  profiles: { first_name: string } | null;
}

export default function DashboardEventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [attending, setAttending] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);

      // Check if user is attending
      const { data: attendance } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", eventData.id)
        .eq("profile_id", user.id)
        .neq("status", "cancelled")
        .maybeSingle();

      setAttending(!!attendance);

      // Get attendee previews
      const { data: attendeeData, count } = await supabase
        .from("event_attendees")
        .select("profile_id, profiles(first_name)", { count: "exact" })
        .eq("event_id", eventData.id)
        .neq("status", "cancelled")
        .limit(5);

      if (attendeeData) setAttendees(attendeeData as unknown as Attendee[]);
      if (count !== null) setAttendeeCount(count);

      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  const handleRSVP = async () => {
    setRsvpLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/rsvp`, { method: "POST" });
      if (res.ok) {
        setAttending(true);
        setAttendeeCount((c) => c + 1);
      }
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif text-3xl font-semibold text-dark mb-4">Event not found</h1>
        <Link href="/dashboard" className="text-copper font-medium hover:text-copper-dark transition-colors">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const attendeeNames = attendees
    .slice(0, 3)
    .map((a) => (a.profiles as unknown as { first_name: string })?.first_name)
    .filter(Boolean);
  const otherCount = attendeeCount - attendeeNames.length;

  return (
    <>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-dark text-sm font-medium transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
        {/* Event header */}
        <div className="bg-forest p-6 md:p-8">
          <p className="text-copper-light text-xs uppercase tracking-[0.15em] font-medium mb-2">
            {event.date} &middot; {event.time}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-2">
            {event.name}
          </h1>
          <p className="text-white/70 text-sm">
            {event.venue} &middot; {event.neighborhood}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Price", value: `$${event.price}` },
              { label: "Age Range", value: event.age_range },
              { label: "Dress Code", value: event.dress_code },
              { label: "Attending", value: `${attendeeCount} people` },
            ].map((item) => (
              <div key={item.label} className="bg-cream rounded-xl p-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-muted mb-1">{item.label}</p>
                <p className="font-semibold text-dark text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-dark mb-3">About</h2>
              <p className="text-muted leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Attendee preview */}
          {attendeeNames.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-dark mb-3">Who&apos;s Going</h2>
              <p className="text-muted text-sm">
                {attendeeNames.join(", ")}
                {otherCount > 0 && `, and ${otherCount} other${otherCount > 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!attending ? (
              <motion.button
                onClick={handleRSVP}
                disabled={rsvpLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="flex-1 py-4 rounded-xl bg-copper text-white font-semibold text-base tracking-wide transition-colors hover:bg-copper-dark cursor-pointer shadow-lg shadow-copper/15 disabled:opacity-50"
              >
                {rsvpLoading ? "RSVPing..." : `RSVP — $${event.price}`}
              </motion.button>
            ) : (
              <>
                <div className="flex-1 py-4 rounded-xl bg-forest/5 border border-forest/20 text-forest font-semibold text-base text-center">
                  You&apos;re attending
                </div>
                {event.live_status === "active" && (
                  <Link
                    href={`/dashboard/events/${slug}/live`}
                    className="flex-1 py-4 rounded-xl bg-forest text-white font-semibold text-base text-center tracking-wide hover:bg-forest/90 transition-colors shadow-lg shadow-forest/15 animate-pulse"
                  >
                    Join Live Event
                  </Link>
                )}
                {event.double_take_open && (
                  <Link
                    href={`/dashboard/events/${slug}/double-take`}
                    className="flex-1 py-4 rounded-xl bg-copper text-white font-semibold text-base text-center tracking-wide hover:bg-copper-dark transition-colors shadow-lg shadow-copper/15"
                  >
                    Open Double Take
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
