import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-helpers";

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

    // ─── PREMIER: 1 free ticket/month + 25% off additional ───
    if (tier === "premier") {
      // Check if they've used their monthly free ticket
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count: freeUsedCount } = await service
        .from("ticket_purchases")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("purchase_type", "premier_included")
        .gte("created_at", monthStart);

      const freeUsed = (freeUsedCount ?? 0) > 0;

      if (!freeUsed) {
        // Free ticket for this month
        const { data: purchase } = await service
          .from("ticket_purchases")
          .insert({
            profile_id: profile.id,
            event_id: event.id,
            amount_cents: 0,
            purchase_type: "premier_included",
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
          type: "premier_included",
        });
      }

      // Free ticket already used — apply 25% discount (same as Social)
      const discountedPrice = Math.round(event.price * 0.75);
      const discountedCents = discountedPrice * 100;

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
                name: `${event.name} — Event Ticket (25% Premier Discount)`,
                description: `${event.date} at ${event.venue}`,
              },
              unit_amount: discountedCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${SITE_URL}/dashboard?ticket=success&event=${slug}`,
        cancel_url: `${SITE_URL}/dashboard?ticket=cancelled`,
        metadata: {
          profile_id: profile.id,
          event_id: event.id,
          purchase_type: "premier_discounted",
        },
      });

      return NextResponse.json({ url: session.url, type: "checkout" });
    }

    // ─── SOCIAL: 25% discount ───
    if (tier === "social") {
      const discountedPrice = Math.round(event.price * 0.75);
      const discountedCents = discountedPrice * 100;

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
                name: `${event.name} — Event Ticket (25% Social Discount)`,
                description: `${event.date} at ${event.venue}`,
              },
              unit_amount: discountedCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${SITE_URL}/dashboard?ticket=success&event=${slug}`,
        cancel_url: `${SITE_URL}/dashboard?ticket=cancelled`,
        metadata: {
          profile_id: profile.id,
          event_id: event.id,
          purchase_type: "discounted",
        },
      });

      return NextResponse.json({ url: session.url, type: "checkout" });
    }

    // ─── FREE: Pay full price via Stripe ───
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
