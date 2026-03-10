# Key Decisions

## Why Magic Links Instead of Passwords
- Simpler UX — no password to remember
- More secure — no passwords to leak
- Fits the "premium/curated" brand feel
- Supabase Auth handles it natively

## Why Flodesk + Supabase (Not Just One)
- Flodesk handles email marketing (automated sequences, campaigns, beautiful templates)
- Supabase is your own database — you fully own the data
- If Flodesk goes down or you switch providers, your data is safe
- Waitlist API writes to both: Supabase first (critical), Flodesk second (nice-to-have)

## Why No Payments Yet
- Phase 1 is building the waitlist and proving demand
- Adding Stripe before you have members adds complexity for no gain
- Plan: launch ads → build waitlist → secure venues → THEN add payments

## Why Service Role Client for Waitlist
- The waitlist form is public (no login required)
- Supabase Row Level Security (RLS) blocks anonymous inserts
- The service role key bypasses RLS — only used server-side in API routes, never exposed to the browser

## Why Groups of 4
- The grouping algorithm defaults to groups of 4
- Small enough for intimate conversation
- Large enough for variety (2 men + 2 women ideally)
- Algorithm optimizes for gender balance, neighborhood mixing, and zero repeat pairings across rounds

## Design System
- **Forest green** (#2C4A3E) — primary brand color, trust, nature
- **Copper** (#B87333) — accent, warmth, premium feel
- **Cream** (#FFF8F0) — background, soft, inviting
- **Fonts**: Cormorant Garamond (serif headings), DM Sans (body text)
