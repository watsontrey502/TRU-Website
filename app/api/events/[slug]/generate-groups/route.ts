import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateGroups } from "@/lib/grouping";
import type { AttendeeProfile, EventPhase } from "@/lib/types/live-event";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // Get event
  const { data: event } = await supabase
    .from("events")
    .select("id, phases")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const phases = (event.phases ?? []) as EventPhase[];
  const groupedRounds = phases
    .map((p, i) => ({ phase: p, index: i }))
    .filter((r) => r.phase.type === "grouped");

  if (groupedRounds.length === 0) {
    return NextResponse.json({ error: "No grouped phases" }, { status: 400 });
  }

  // Get checked-in attendees with profile data
  // Use service client to bypass RLS for reading all attendee profiles
  const serviceSupabase = createServiceClient();

  const { data: attendees } = await serviceSupabase
    .from("event_attendees")
    .select("profile_id, profiles(id, first_name, gender, neighborhood, age)")
    .eq("event_id", event.id)
    .eq("status", "checked_in");

  if (!attendees || attendees.length === 0) {
    return NextResponse.json({ error: "No checked-in attendees" }, { status: 400 });
  }

  const profiles: AttendeeProfile[] = attendees
    .map((a) => {
      const p = a.profiles as unknown as AttendeeProfile | null;
      return p ? { ...p, id: a.profile_id } : null;
    })
    .filter((p): p is AttendeeProfile => p !== null);

  // Generate groups for all grouped rounds
  // Map grouped round indices to actual phase indices
  const assignments = generateGroups(
    profiles,
    groupedRounds.length,
    event.id
  );

  // Remap the round indices (0, 1, 2...) to actual phase indices
  const remapped = assignments.map((a) => {
    const actualPhaseIndex = groupedRounds[a.phase_index]?.index ?? a.phase_index;
    return { ...a, phase_index: actualPhaseIndex };
  });

  // Delete old groups for this event, then insert new ones
  await serviceSupabase
    .from("event_round_groups")
    .delete()
    .eq("event_id", event.id);

  const { error } = await serviceSupabase
    .from("event_round_groups")
    .insert(remapped);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    groups_generated: remapped.length,
    rounds: groupedRounds.length,
    attendees: profiles.length,
  });
}
