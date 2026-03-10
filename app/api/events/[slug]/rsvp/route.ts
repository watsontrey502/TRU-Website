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

  // Look up event by slug
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Insert attendance (unique constraint handles duplicates)
  const { error } = await supabase.from("event_attendees").insert({
    event_id: event.id,
    profile_id: user.id,
    status: "confirmed",
  });

  if (error) {
    if (error.code === "23505") {
      // Already RSVP'd
      return NextResponse.json({ success: true, message: "Already attending" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
