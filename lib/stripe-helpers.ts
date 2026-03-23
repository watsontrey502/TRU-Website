import { stripe, PRICES } from "./stripe";
import { createServiceClient } from "./supabase/service";

/** Get or create a Stripe customer for a profile */
export async function getOrCreateStripeCustomer(
  profileId: string,
  email: string,
  name?: string
): Promise<string> {
  const service = createServiceClient();

  // Check if profile already has a Stripe customer
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", profileId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { profile_id: profileId },
  });

  // Save to profile
  await service
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", profileId);

  return customer.id;
}

/** Map a Stripe price ID to a subscription tier */
export function getTierFromPriceId(
  priceId: string
): "social" | "premier" | null {
  if (priceId === PRICES.social) return "social";
  if (priceId === PRICES.premier) return "premier";
  return null;
}

/** Check if a tier has Double Take access */
export function canAccessDoubleTake(
  tier: string | null | undefined
): boolean {
  return tier === "social" || tier === "premier";
}

/** Check if a tier gets free events */
export function hasUnlimitedEvents(
  tier: string | null | undefined
): boolean {
  return tier === "premier";
}

/** Check if a tier includes verification */
export function hasIncludedVerification(
  tier: string | null | undefined
): boolean {
  return tier === "social" || tier === "premier";
}

/** Check if a tier can extend conversations for free */
export function canExtendConversationFree(
  tier: string | null | undefined
): boolean {
  return tier === "social" || tier === "premier";
}

/** Get the billing period start date from a subscription's current_period_end */
export function getBillingPeriodStart(
  currentPeriodEnd: string | null
): string | null {
  if (!currentPeriodEnd) return null;
  const end = new Date(currentPeriodEnd);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  return start.toISOString().split("T")[0]; // YYYY-MM-DD
}

/** Check Social tier ticket entitlement for current period */
export async function getSocialTicketsUsed(
  profileId: string,
  periodStart: string
): Promise<number> {
  const service = createServiceClient();
  const { data } = await service.rpc("get_social_tickets_used_this_period", {
    p_profile_id: profileId,
    p_period_start: periodStart,
  });
  return data ?? 0;
}
