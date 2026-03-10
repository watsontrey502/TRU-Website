import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventPhase } from "@/lib/types/live-event";

export async function POST(
  request: Request,
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
    .select("id, phases, current_phase_index, phase_started_at, phase_paused, phase_remaining_seconds, live_status")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { action, extraMinutes } = await request.json();
  const phases = (event.phases ?? []) as EventPhase[];

  switch (action) {
    case "start": {
      // Start the event — go to phase 0
      const { error } = await supabase
        .from("events")
        .update({
          live_status: "active",
          current_phase_index: 0,
          phase_started_at: new Date().toISOString(),
          phase_paused: false,
          phase_remaining_seconds: null,
          double_take_open: false,
        })
        .eq("id", event.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, phase_index: 0 });
    }

    case "advance": {
      const nextIndex = event.current_phase_index + 1;
      if (nextIndex >= phases.length) {
        // End the event
        const { error } = await supabase
          .from("events")
          .update({
            live_status: "ended",
            phase_started_at: null,
            phase_paused: false,
            phase_remaining_seconds: null,
          })
          .eq("id", event.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, ended: true });
      }

      // Open Double Take if advancing to a double_take phase
      const nextPhase = phases[nextIndex];
      const updates: Record<string, unknown> = {
        current_phase_index: nextIndex,
        phase_started_at: new Date().toISOString(),
        phase_paused: false,
        phase_remaining_seconds: null,
      };
      if (nextPhase.type === "double_take") {
        updates.double_take_open = true;
      }

      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", event.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, phase_index: nextIndex });
    }

    case "pause": {
      if (event.phase_paused) {
        return NextResponse.json({ error: "Already paused" }, { status: 400 });
      }

      // Calculate remaining seconds
      const elapsed = event.phase_started_at
        ? Math.floor((Date.now() - new Date(event.phase_started_at).getTime()) / 1000)
        : 0;
      const currentPhase = phases[event.current_phase_index];
      const totalSeconds = currentPhase ? currentPhase.duration_minutes * 60 : 0;
      const remaining = Math.max(0, totalSeconds - elapsed);

      const { error } = await supabase
        .from("events")
        .update({
          phase_paused: true,
          phase_remaining_seconds: remaining,
          phase_started_at: null,
        })
        .eq("id", event.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, remaining });
    }

    case "resume": {
      if (!event.phase_paused) {
        return NextResponse.json({ error: "Not paused" }, { status: 400 });
      }

      // Set phase_started_at so that elapsed = total - remaining
      const currentPhase = phases[event.current_phase_index];
      const totalSeconds = currentPhase ? currentPhase.duration_minutes * 60 : 0;
      const remaining = event.phase_remaining_seconds ?? 0;
      const fakeStarted = new Date(Date.now() - (totalSeconds - remaining) * 1000).toISOString();

      const { error } = await supabase
        .from("events")
        .update({
          phase_paused: false,
          phase_remaining_seconds: null,
          phase_started_at: fakeStarted,
        })
        .eq("id", event.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "extend": {
      const minutes = extraMinutes ?? 5;
      // Push phase_started_at forward by the extra minutes
      const startedAt = event.phase_started_at
        ? new Date(event.phase_started_at)
        : new Date();
      startedAt.setMinutes(startedAt.getMinutes() + minutes);

      if (event.phase_paused) {
        // If paused, add to remaining seconds
        const { error } = await supabase
          .from("events")
          .update({
            phase_remaining_seconds: (event.phase_remaining_seconds ?? 0) + minutes * 60,
          })
          .eq("id", event.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { error } = await supabase
          .from("events")
          .update({ phase_started_at: startedAt.toISOString() })
          .eq("id", event.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
