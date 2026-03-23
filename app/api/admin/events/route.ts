import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin ? user : null;
}

/** GET: List all events with attendee counts */
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: events, error } = await service
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get attendee counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        const { count: rsvpCount } = await service
          .from("event_attendees")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .neq("status", "cancelled");

        const { count: checkedInCount } = await service
          .from("event_attendees")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "checked_in");

        return {
          ...event,
          rsvp_count: rsvpCount || 0,
          checked_in_count: checkedInCount || 0,
        };
      })
    );

    return NextResponse.json(eventsWithCounts);
  } catch (err) {
    console.error("Events list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/** POST: Create a new event */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      date,
      time,
      venue,
      neighborhood,
      price,
      age_range,
      dress_code,
      capacity,
      description,
      image_url,
    } = body;

    if (!name || !date || !time || !venue || price === undefined) {
      return NextResponse.json(
        { error: "name, date, time, venue, and price are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const service = createServiceClient();
    const { data: event, error } = await service
      .from("events")
      .insert({
        slug,
        name,
        date,
        time,
        venue,
        neighborhood: neighborhood || null,
        price: parseInt(price),
        age_range: age_range || null,
        dress_code: dress_code || null,
        capacity: capacity ? parseInt(capacity) : null,
        description: description || null,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

/** PATCH: Update an event */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "date",
      "time",
      "venue",
      "neighborhood",
      "price",
      "age_range",
      "dress_code",
      "capacity",
      "description",
      "image_url",
      "double_take_open",
    ];

    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = value;
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const { data: event, error } = await service
      .from("events")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error("Update event error:", err);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/** DELETE: Cancel an event */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const { error } = await service.from("events").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete event error:", err);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
