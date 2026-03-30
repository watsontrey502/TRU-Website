import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call the SECURITY DEFINER function that bypasses RLS
  // to detect mutual votes across both sides of double_take_votes
  const { data: matches, error } = await supabase.rpc("get_my_matches", {
    requesting_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Auto-create conversations for new mutual matches
  const service = createServiceClient();

  for (const match of matches) {
    // Normalize participant order so the unique constraint works
    const [participantA, participantB] = [user.id, match.matched_user_id].sort();

    // Check if conversation already exists
    const { data: existing } = await service
      .from("conversations")
      .select("id")
      .eq("event_id", match.event_id)
      .eq("participant_a", participantA)
      .eq("participant_b", participantB)
      .maybeSingle();

    if (!existing) {
      // Create conversation with 7-day expiry
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: newConvo } = await service
        .from("conversations")
        .insert({
          event_id: match.event_id,
          participant_a: participantA,
          participant_b: participantB,
          expires_at: expiresAt,
          status: "active",
        })
        .select("id")
        .single();

      if (newConvo) {
        match.conversation_id = newConvo.id;
      }
    } else {
      match.conversation_id = existing.id;
    }
  }

  return NextResponse.json({ matches });
}
