import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const service = createServiceClient();

    // Get event
    const { data: event } = await service
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const { attendee_id, action } = await req.json();

    if (!attendee_id) {
      return NextResponse.json(
        { error: "attendee_id is required" },
        { status: 400 }
      );
    }

    if (action === "checkin") {
      await service
        .from("event_attendees")
        .update({
          status: "checked_in",
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", attendee_id)
        .eq("event_id", event.id);
    } else if (action === "undo") {
      await service
        .from("event_attendees")
        .update({
          status: "confirmed",
          checked_in_at: null,
        })
        .eq("id", attendee_id)
        .eq("event_id", event.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
