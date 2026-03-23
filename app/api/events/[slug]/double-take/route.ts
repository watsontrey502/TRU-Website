import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { canAccessDoubleTake } from "@/lib/stripe-helpers";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import { newMatchNotification } from "@/lib/email/templates";

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

  // ─── Tier gate: Double Take requires Social or Premier ───
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || !canAccessDoubleTake(profile.subscription_tier)) {
    return NextResponse.json(
      { error: "Double Take requires a Social or Premier membership" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { votedForIds } = body as { votedForIds: string[] };

  if (!votedForIds || !Array.isArray(votedForIds) || votedForIds.length === 0) {
    return NextResponse.json({ error: "No selections provided" }, { status: 400 });
  }

  // Look up event
  const { data: event } = await supabase
    .from("events")
    .select("id, name, double_take_open")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!event.double_take_open) {
    return NextResponse.json({ error: "Double Take is not open for this event" }, { status: 400 });
  }

  // Verify user was checked in (not just RSVPd)
  const { data: attendance } = await supabase
    .from("event_attendees")
    .select("id, checked_in_at")
    .eq("event_id", event.id)
    .eq("profile_id", user.id)
    .neq("status", "cancelled")
    .maybeSingle();

  if (!attendance) {
    return NextResponse.json({ error: "You did not attend this event" }, { status: 403 });
  }

  if (!attendance.checked_in_at) {
    return NextResponse.json({ error: "You must be checked in to use Double Take" }, { status: 403 });
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

  // ─── Check for mutual matches and create conversations ───
  const service = createServiceClient();
  const matches: string[] = [];

  for (const votedForId of votedForIds) {
    // Did they also vote for us?
    const { data: reciprocal } = await service
      .from("double_take_votes")
      .select("id")
      .eq("event_id", event.id)
      .eq("voter_id", votedForId)
      .eq("voted_for_id", user.id)
      .maybeSingle();

    if (reciprocal) {
      matches.push(votedForId);

      // Create conversation
      await service.rpc("create_conversation_for_match", {
        p_event_id: event.id,
        p_user_a: user.id,
        p_user_b: votedForId,
      });

      // Send match notification emails (non-blocking)
      const { data: matchProfile } = await service
        .from("profiles")
        .select("first_name, email")
        .eq("id", votedForId)
        .single();

      if (matchProfile) {
        // Notify the other person
        const { subject: s1, html: h1 } = newMatchNotification(
          matchProfile.first_name,
          profile.first_name,
          event.name
        );
        resend.emails
          .send({ from: FROM_EMAIL, to: matchProfile.email, subject: s1, html: h1 })
          .catch(console.error);

        // Notify current user
        const { data: currentProfile } = await service
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        if (currentProfile) {
          const { subject: s2, html: h2 } = newMatchNotification(
            profile.first_name,
            matchProfile.first_name,
            event.name
          );
          resend.emails
            .send({ from: FROM_EMAIL, to: currentProfile.email, subject: s2, html: h2 })
            .catch(console.error);
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    count: votedForIds.length,
    matches: matches.length,
  });
}
