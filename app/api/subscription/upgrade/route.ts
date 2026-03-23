import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICES } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-helpers";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://trudatingnashville.com";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (tier !== "social" && tier !== "premier") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, subscription_id, subscription_tier, stripe_customer_id"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const priceId = tier === "social" ? PRICES.social : PRICES.premier;

    // If user has an existing subscription, update it
    if (profile.subscription_id) {
      const subRes = await stripe.subscriptions.retrieve(
        profile.subscription_id
      ) as unknown as import("stripe").Stripe.Subscription;

      await stripe.subscriptions.update(profile.subscription_id, {
        items: [
          {
            id: subRes.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations",
      });

      return NextResponse.json({ success: true, type: "updated" });
    }

    // No existing subscription — create new checkout
    const customerId = await getOrCreateStripeCustomer(
      profile.id,
      profile.email,
      `${profile.first_name} ${profile.last_name}`
    );

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard/profile?upgraded=true`,
      cancel_url: `${SITE_URL}/dashboard/profile`,
      metadata: {
        profile_id: profile.id,
        tier,
      },
      subscription_data: {
        metadata: { profile_id: profile.id },
      },
    });

    return NextResponse.json({ url: session.url, type: "checkout" });
  } catch (err) {
    console.error("Upgrade error:", err);
    return NextResponse.json(
      { error: "Failed to process upgrade" },
      { status: 500 }
    );
  }
}
