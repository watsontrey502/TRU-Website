import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import {
  getOrCreateStripeCustomer,
  hasUnlimitedEvents,
  getSocialTicketsUsed,
  getBillingPeriodStart,
} from "@/lib/stripe-helpers";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://trudatingnashville.com";

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

    // Get profile with subscription info
    const { data: profile } = await service
      .from("profiles")
      .select(
        "id, first_name, last_name, email, subscription_tier, subscription_current_period_end"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get event
    const { data: event } = await service
      .from("events")
      .select("id, slug, name, price, date, venue, capacity")
      .eq("slug", slug)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if already attending
    const { data: existingAttendee } = await service
      .from("event_attendees")
      .select("id")
      .eq("event_id", event.id)
      .eq("profile_id", profile.id)
      .single();

    if (existingAttendee) {
      return NextResponse.json(
        { error: "Already attending this event" },
        { status: 409 }
      );
    }

    // Check capacity
    if (event.capacity) {
      const { count } = await service
        .from("event_attendees")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .neq("status", "cancelled");

      if (count && count >= event.capacity) {
        return NextResponse.json(
          { error: "Event is full" },
          { status: 409 }
        );
      }
    }

    const tier = profile.subscription_tier || "free";

    // ─── PREMIER: Always free ───
    if (hasUnlimitedEvents(tier)) {
      const { data: purchase } = await service
        .from("ticket_purchases")
        .insert({
          profile_id: profile.id,
          event_id: event.id,
          amount_cents: 0,
          purchase_type: "premier_unlimited",
          status: "completed",
        })
        .select("id")
        .single();

      await service.from("event_attendees").insert({
        event_id: event.id,
        profile_id: profile.id,
        status: "confirmed",
        ticket_purchase_id: purchase?.id,
      });

      return NextResponse.json({
        success: true,
        type: "premier_unlimited",
      });
    }

    // ─── SOCIAL: Check monthly entitlement ───
    if (tier === "social") {
      const periodStart = getBillingPeriodStart(
        profile.subscription_current_period_end
      );

      if (periodStart) {
        const ticketsUsed = await getSocialTicketsUsed(
          profile.id,
          periodStart
        );

        if (ticketsUsed === 0) {
          // Use included ticket
          const { data: purchase } = await service
            .from("ticket_purchases")
            .insert({
              profile_id: profile.id,
              event_id: event.id,
              amount_cents: 0,
              purchase_type: "included",
              billing_period_start: periodStart,
              status: "completed",
            })
            .select("id")
            .single();

          await service.from("event_attendees").insert({
            event_id: event.id,
            profile_id: profile.id,
            status: "confirmed",
            ticket_purchase_id: purchase?.id,
          });

          return NextResponse.json({
            success: true,
            type: "included",
          });
        }
      }
      // Fall through to paid checkout if ticket already used
    }

    // ─── FREE / SOCIAL (ticket used): Pay via Stripe ───
    const customerId = await getOrCreateStripeCustomer(
      profile.id,
      profile.email,
      `${profile.first_name} ${profile.last_name}`
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${event.name} — Event Ticket`,
              description: `${event.date} at ${event.venue}`,
            },
            unit_amount: event.price * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/dashboard?ticket=success&event=${slug}`,
      cancel_url: `${SITE_URL}/dashboard?ticket=cancelled`,
      metadata: {
        profile_id: profile.id,
        event_id: event.id,
        purchase_type: "paid",
      },
    });

    return NextResponse.json({ url: session.url, type: "checkout" });
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
