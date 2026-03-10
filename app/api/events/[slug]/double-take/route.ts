import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { votedForIds } = body as { votedForIds: string[] };

  if (!votedForIds || !Array.isArray(votedForIds) || votedForIds.length === 0) {
    return NextResponse.json({ error: "No selections provided" }, { status: 400 });
  }

  // Look up event
  const { data: event } = await supabase
    .from("events")
    .select("id, double_take_open")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!event.double_take_open) {
    return NextResponse.json({ error: "Double Take is not open for this event" }, { status: 400 });
  }

  // Verify user attended this event
  const { data: attendance } = await supabase
    .from("event_attendees")
    .select("id")
    .eq("event_id", event.id)
    .eq("profile_id", user.id)
    .neq("status", "cancelled")
    .maybeSingle();

  if (!attendance) {
    return NextResponse.json({ error: "You did not attend this event" }, { status: 403 });
  }

  // Check for existing votes
  const { data: existingVotes } = await supabase
    .from("double_take_votes")
    .select("id")
    .eq("event_id", event.id)
    .eq("voter_id", user.id)
    .limit(1);

  if (existingVotes && existingVotes.length > 0) {
    return NextResponse.json({ error: "Already voted for this event" }, { status: 400 });
  }

  // Insert votes
  const votes = votedForIds.map((votedForId) => ({
    event_id: event.id,
    voter_id: user.id,
    voted_for_id: votedForId,
  }));

  const { error } = await supabase.from("double_take_votes").insert(votes);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: votedForIds.length });
}
