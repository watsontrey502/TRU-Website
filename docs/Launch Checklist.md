# Launch Checklist

## Ready Now
- [x] Landing page with mobile-friendly design
- [x] Apply/waitlist form (3-step, polished mobile experience)
- [x] Waitlist data stored in Supabase + sent to Flodesk
- [x] Magic link login (no passwords)
- [x] Member dashboard (events, matches, profile)
- [x] Admin waitlist viewer (/dashboard/admin/waitlist)
- [x] Event RSVP system
- [x] Live event hosting (phases, timers, group rotation)
- [x] Group generation algorithm (balanced, no repeats)
- [x] Double Take voting (post-event match selection)
- [x] Mutual match detection + reveal
- [x] PWA installable (Add to Home Screen)
- [x] Smooth page transitions
- [x] Loading skeleton states
- [x] SEO basics (meta tags, OG images, sitemap, robots.txt)
- [x] Vercel Analytics + Speed Insights

## Before Running Ads
- [ ] Run `supabase/schema.sql` in your Supabase SQL Editor
- [ ] Set all environment variables (see [[Environment Setup]])
- [ ] Make yourself admin in the profiles table
- [ ] Test the apply form end-to-end (submit → check Supabase → check Flodesk)
- [ ] Set up Flodesk welcome email automation for new waitlist subscribers
- [ ] Verify the site URL in Supabase Auth settings matches your production domain
- [ ] Deploy to Vercel with all env vars set

## Future (Not Blocking Launch)
- [ ] Stripe integration for $25/month membership
- [ ] Admin approval workflow (approve/reject applicants from dashboard)
- [ ] Email notifications (RSVP confirmation, match alerts)
- [ ] Event creation UI for admin (currently done via Supabase dashboard)
- [ ] Waitlist export to CSV
- [ ] Member analytics (signups over time, conversion rates)
