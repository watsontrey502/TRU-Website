import { NextResponse } from "next/server";
import { stripe, TIER_FROM_PRICE } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import {
  subscriptionWelcome,
  paymentFailed,
  ticketPurchaseConfirmation,
} from "@/lib/email/templates";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const service = createServiceClient();

  try {
    switch (event.type) {
      // ─── Checkout completed (subscription or one-time ticket) ───
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const profileId = session.metadata?.profile_id;

        if (!profileId) break;

        // Subscription checkout (onboarding or upgrade)
        if (session.mode === "subscription" && session.subscription) {
          const subResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const subscription = subResponse as unknown as Stripe.Subscription;
          const priceId = subscription.items.data[0]?.price.id;
          const tier = priceId ? TIER_FROM_PRICE[priceId] : null;

          if (tier) {
            await service
              .from("profiles")
              .update({
                stripe_customer_id: session.customer as string,
                subscription_id: subscription.id,
                subscription_tier: tier,
                subscription_status: "active",
                subscription_current_period_end: new Date(
                  subscription.items.data[0].current_period_end * 1000
                ).toISOString(),
                onboarding_completed: true,
              })
              .eq("id", profileId);

            // Send welcome email
            const { data: profile } = await service
              .from("profiles")
              .select("first_name, email")
              .eq("id", profileId)
              .single();

            if (profile) {
              const tierName = tier === "social" ? "Social" : "Premier";
              const { subject, html } = subscriptionWelcome(
                profile.first_name,
                tierName
              );
              await resend.emails
                .send({
                  from: FROM_EMAIL,
                  to: profile.email,
                  subject,
                  html,
                })
                .catch(console.error);
            }
          }
        }

        // One-time ticket purchase
        if (session.mode === "payment") {
          const eventId = session.metadata?.event_id;
          const purchaseType = session.metadata?.purchase_type || "paid";

          if (eventId) {
            // Create ticket purchase record
            const { data: purchase } = await service
              .from("ticket_purchases")
              .insert({
                profile_id: profileId,
                event_id: eventId,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                amount_cents: session.amount_total || 0,
                purchase_type: purchaseType,
                status: "completed",
              })
              .select("id")
              .single();

            // Create event attendee record
            if (purchase) {
              await service.from("event_attendees").upsert(
                {
                  event_id: eventId,
                  profile_id: profileId,
                  status: "confirmed",
                  ticket_purchase_id: purchase.id,
                },
                { onConflict: "event_id,profile_id" }
              );
            }

            // Send ticket confirmation email
            const { data: profile } = await service
              .from("profiles")
              .select("first_name, email")
              .eq("id", profileId)
              .single();

            const { data: eventData } = await service
              .from("events")
              .select("name, date, venue")
              .eq("id", eventId)
              .single();

            if (profile && eventData) {
              const { subject, html } = ticketPurchaseConfirmation(
                profile.first_name,
                eventData.name,
                eventData.date,
                eventData.venue
              );
              await resend.emails
                .send({
                  from: FROM_EMAIL,
                  to: profile.email,
                  subject,
                  html,
                })
                .catch(console.error);
            }
          }

          // Conversation extension payment
          if (session.metadata?.conversation_extension === "true") {
            const conversationId = session.metadata?.conversation_id;
            if (conversationId) {
              await service.from("conversation_extensions").insert({
                conversation_id: conversationId,
                profile_id: profileId,
                stripe_payment_intent_id: session.payment_intent as string,
              });

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
            }
          }

          // Verification fee payment
          if (session.metadata?.verification_fee === "true") {
            // Payment recorded — verification process continues on admin side
          }
        }
        break;
      }

      // ─── Subscription updated (plan change, renewal) ───
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const profileId = subscription.metadata?.profile_id;
        if (!profileId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? TIER_FROM_PRICE[priceId] : null;

        const updateData: Record<string, unknown> = {
          subscription_status: subscription.status === "active" ? "active" :
                               subscription.status === "past_due" ? "past_due" :
                               subscription.status === "canceled" ? "canceled" : "active",
          subscription_current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
        };

        if (tier) {
          updateData.subscription_tier = tier;
        }

        await service
          .from("profiles")
          .update(updateData)
          .eq("id", profileId);
        break;
      }

      // ─── Subscription deleted (canceled) ───
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const profileId = subscription.metadata?.profile_id;
        if (!profileId) break;

        await service
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "canceled",
            subscription_id: null,
            subscription_current_period_end: null,
          })
          .eq("id", profileId);
        break;
      }

      // ─── Payment failed ───
      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const customerId = invoice.customer as string;

        // Look up profile by Stripe customer ID
        const { data: profile } = await service
          .from("profiles")
          .select("id, first_name, email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await service
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);

          const { subject, html } = paymentFailed(profile.first_name);
          await resend.emails
            .send({ from: FROM_EMAIL, to: profile.email, subject, html })
            .catch(console.error);
        }
        break;
      }

      // ─── Invoice paid (renewal success) ───
      case "invoice.paid": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const customerId = invoice.customer as string;

        const { data: profile } = await service
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile && invoice.subscription) {
          const subRes = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const subscription = subRes as unknown as Stripe.Subscription;
          await service
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_current_period_end: new Date(
                subscription.items.data[0].current_period_end * 1000
              ).toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 anyway to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true });
}
