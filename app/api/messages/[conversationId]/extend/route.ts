import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer, canExtendConversationFree } from "@/lib/stripe-helpers";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://trudatingnashville.com";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();

    // Verify participant
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, participant_a, participant_b, extended")
      .eq("id", conversationId)
      .single();

    if (
      !conversation ||
      (conversation.participant_a !== user.id &&
        conversation.participant_b !== user.id)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (conversation.extended) {
      return NextResponse.json(
        { error: "Conversation already extended" },
        { status: 409 }
      );
    }

    // Get profile with tier
    const { data: profile } = await service
      .from("profiles")
      .select("id, first_name, last_name, email, subscription_tier")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const tier = profile.subscription_tier || "free";

    // Paid tiers extend for free
    if (canExtendConversationFree(tier)) {
      await service
        .from("conversations")
        .update({
          status: "extended",
          extended: true,
          extended_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", conversationId);

      await service.from("conversation_extensions").insert({
        conversation_id: conversationId,
        profile_id: profile.id,
      });

      return NextResponse.json({ success: true, type: "free" });
    }

    // Free tier: $5 charge via Stripe
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
              name: "Conversation Extension — 7 more days",
              description:
                "Extend your TRÜ conversation for another 7 days",
            },
            unit_amount: 500, // $5
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/dashboard/messages?extended=${conversationId}`,
      cancel_url: `${SITE_URL}/dashboard/messages`,
      metadata: {
        profile_id: profile.id,
        conversation_id: conversationId,
        conversation_extension: "true",
      },
    });

    return NextResponse.json({ url: session.url, type: "checkout" });
  } catch (err) {
    console.error("Extend error:", err);
    return NextResponse.json(
      { error: "Failed to extend conversation" },
      { status: 500 }
    );
  }
}
