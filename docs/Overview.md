# Overview

**TRU Dating Nashville** is a curated dating events platform for Nashville singles aged 25-42.

## How It Works
1. People find TRU via ads/social → land on the website
2. They apply via the waitlist form (name, age, neighborhood, what makes them interesting, etc.)
3. You review applications and approve members
4. Approved members log in with a magic link (email, no passwords)
5. Members RSVP to events (rooftop tastings, hikes, dinner parties, trivia)
6. At the event, you (the host) run it live from your phone — managing phases, group rotations, timing
7. After the event, attendees do "Double Take" — pick who they liked
8. Mutual matches get revealed with each other's name + Instagram

## Revenue Model (Future)
- $25/month membership (not implemented yet — Stripe integration planned)
- Event ticket sales ($35-55 per event)

## Current Status
- **Website**: Live, responsive, looks great on mobile and desktop
- **Waitlist**: Working — stores in Supabase + sends to Flodesk for email marketing
- **Auth**: Magic link login via Supabase
- **Events system**: Fully built — RSVP, live event control, group generation, Double Take, match detection
- **Payments**: Not yet — waitlist-only for now
