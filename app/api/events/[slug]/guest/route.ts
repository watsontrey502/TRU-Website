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

    const service = createServiceClient();

    // Verify Premier tier
    const { data: profile } = await service
      .from("profiles")
      .select("id, subscription_tier")
      .eq("id", user.id)
      .single();

    if (!profile || profile.subscription_tier !== "premier") {
      return NextResponse.json(
        { error: "Guest passes require a Premier membership" },
        { status: 403 }
      );
    }

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

    // Verify the Premier member is attending
    const { data: attendance } = await service
      .from("event_attendees")
      .select("id")
      .eq("event_id", event.id)
      .eq("profile_id", profile.id)
      .single();

    if (!attendance) {
      return NextResponse.json(
        { error: "You must RSVP before adding a guest" },
        { status: 400 }
      );
    }

    const { guest_name } = await req.json();
    if (!guest_name || typeof guest_name !== "string") {
      return NextResponse.json(
        { error: "Guest name is required" },
        { status: 400 }
      );
    }

    // Check if guest already added
    const { data: existingGuest } = await service
      .from("ticket_purchases")
      .select("id")
      .eq("event_id", event.id)
      .eq("profile_id", profile.id)
      .eq("purchase_type", "guest_pass")
      .single();

    if (existingGuest) {
      return NextResponse.json(
        { error: "You already added a guest to this event" },
        { status: 409 }
      );
    }

    // Create guest ticket
    const { data: purchase } = await service
      .from("ticket_purchases")
      .insert({
        profile_id: profile.id,
        event_id: event.id,
        amount_cents: 0,
        purchase_type: "guest_pass",
        guest_name: guest_name.trim(),
        status: "completed",
      })
      .select("id")
      .single();

    // Create guest attendee record
    await service.from("event_attendees").insert({
      event_id: event.id,
      profile_id: profile.id,
      status: "confirmed",
      ticket_purchase_id: purchase?.id,
      is_guest: true,
    });

    return NextResponse.json({ success: true, guest_name: guest_name.trim() });
  } catch (err) {
    console.error("Guest pass error:", err);
    return NextResponse.json(
      { error: "Failed to add guest" },
      { status: 500 }
    );
  }
}
