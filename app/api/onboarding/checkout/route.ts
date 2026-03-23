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

    const { tier, token } = await req.json();

    if (tier !== "social" && tier !== "premier") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      user.id,
      profile.email,
      `${profile.first_name} ${profile.last_name}`
    );

    const priceId = tier === "social" ? PRICES.social : PRICES.premier;

    // Build success URL with token if present
    const successUrl = token
      ? `${SITE_URL}/onboarding?step=complete&token=${token}`
      : `${SITE_URL}/onboarding?step=complete`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${SITE_URL}/onboarding?token=${token || ""}`,
      metadata: {
        profile_id: user.id,
        tier,
        onboarding: "true",
      },
      subscription_data: {
        metadata: {
          profile_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
