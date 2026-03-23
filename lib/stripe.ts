import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() for lazy initialization */
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

export const PRICES = {
  get social() { return process.env.STRIPE_SOCIAL_PRICE_ID!; },
  get premier() { return process.env.STRIPE_PREMIER_PRICE_ID!; },
};

export function getTierFromPrice(priceId: string): "social" | "premier" | null {
  if (priceId === process.env.STRIPE_SOCIAL_PRICE_ID) return "social";
  if (priceId === process.env.STRIPE_PREMIER_PRICE_ID) return "premier";
  return null;
}

// Keep backward compat
export const TIER_FROM_PRICE = new Proxy({} as Record<string, "social" | "premier">, {
  get(_, key: string) {
    return getTierFromPrice(key);
  },
});
