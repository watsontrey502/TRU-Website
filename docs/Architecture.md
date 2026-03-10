# Architecture

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (magic link OTP) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Email Marketing | Flodesk |
| Analytics | Vercel Analytics + Speed Insights |

## Folder Structure
```
app/
├── page.tsx              # Homepage
├── layout.tsx            # Root layout (navbar, footer, toast provider)
├── template.tsx          # Page transition animation
├── manifest.ts           # PWA web app manifest
├── globals.css           # Tailwind + custom theme
├── about/                # About page
├── events/               # Public events listing
├── membership/           # Membership info
├── faq/                  # FAQ page
├── apply/                # Waitlist application form
├── login/                # Magic link login
├── auth/confirm/         # OTP verification callback
├── dashboard/            # Member dashboard (auth-protected)
│   ├── layout.tsx        # Sidebar + bottom nav + admin check
│   ├── page.tsx          # Dashboard home (events, matches)
│   ├── matches/          # View your matches
│   ├── profile/          # Edit your profile
│   └── admin/waitlist/   # Admin: view all applications
├── host/[slug]/          # Admin: live event control panel
├── demo/                 # Demo mode (fake data, no auth needed)
└── api/
    ├── waitlist/          # POST: submit application
    ├── matches/           # GET: fetch mutual matches
    └── events/[slug]/
        ├── rsvp/          # POST: RSVP to event
        ├── check-in/      # POST: check in attendee (admin)
        ├── phases/        # POST: control live event phases (admin)
        ├── generate-groups/ # POST: generate group assignments (admin)
        └── double-take/   # POST: submit match votes

components/
├── Navbar.tsx            # Top navigation
├── Footer.tsx            # Site footer
├── BottomTabBar.tsx      # Mobile bottom tab bar (public pages)
├── Toast.tsx             # Toast notification system + provider
├── EventCard.tsx         # Event card component
├── Button.tsx            # Reusable button
├── Skeleton.tsx          # Loading shimmer placeholders
├── PullToRefresh.tsx     # Pull-to-refresh gesture
├── AnimateOnScroll.tsx   # Scroll-triggered animations
└── SectionHeading.tsx    # Reusable section header

lib/
├── supabase/
│   ├── client.ts         # Browser Supabase client
│   ├── server.ts         # Server-side Supabase client
│   ├── service.ts        # Service role client (bypasses RLS)
│   └── middleware.ts     # Auth session refresh middleware
├── constants.ts          # Seed data for events, neighborhoods, FAQ
├── grouping.ts           # Group generation algorithm
├── haptics.ts            # Mobile haptic feedback
├── types/live-event.ts   # TypeScript types for live events
├── demo-data.ts          # Demo mode fake data
└── demo-channel.ts       # Demo cross-tab sync

supabase/
└── schema.sql            # Complete database schema (run in SQL editor)

middleware.ts             # Protects /dashboard and /host routes
```

## Key Patterns
- **Magic Link Auth**: No passwords. Users enter email → get a link → click it → logged in.
- **Row Level Security (RLS)**: All Supabase tables have RLS. Users can only see their own data. Admin operations use the service role client.
- **Service Client**: `lib/supabase/service.ts` uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for admin operations (group generation, waitlist storage).
- **Realtime**: Events table has Supabase Realtime enabled for live event updates.
