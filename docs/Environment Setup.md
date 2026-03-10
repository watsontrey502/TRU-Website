# Environment Setup

## Prerequisites
- Node.js 18+
- A Supabase project (free tier is fine to start)
- A Flodesk account (for email marketing)

## 1. Clone and install
```bash
git clone <your-repo>
cd tru-website
npm install
```

## 2. Set up environment variables
Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FLODESK_API_KEY=your-flodesk-api-key
FLODESK_WAITLIST_SEGMENT_ID=optional-segment-id
```

**Where to find these:**
- **Supabase keys**: Supabase Dashboard → Settings → API
- **Flodesk API key**: https://app.flodesk.com/account/api
- **Flodesk segment ID**: Create a segment in Flodesk called "Waitlist", then get its ID from the URL

## 3. Set up the database
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste the contents of `supabase/schema.sql`
3. Click Run
4. This creates all tables, security policies, functions, and sample events

## 4. Make yourself admin
1. Go to Supabase Dashboard → Authentication → sign up with your email
2. Go to Table Editor → profiles → find your row
3. Set `is_admin` to `true`

## 5. Configure Supabase Auth
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to `http://localhost:3000` (or your production URL)
3. Add redirect URL: `http://localhost:3000/auth/confirm`
4. For production, also add: `https://yourdomain.com/auth/confirm`

## 6. Run locally
```bash
npm run dev
```
Opens at http://localhost:3000

## 7. Deploy to Vercel
1. Push to GitHub
2. Import project in Vercel
3. Add the same environment variables in Vercel → Settings → Environment Variables
4. Deploy

## Flodesk Setup
Flodesk is used for sending emails to waitlist applicants. The integration:
- Creates a subscriber in Flodesk when someone applies
- Stores their name, email, and all form answers as custom fields
- Optionally adds them to a "Waitlist" segment for targeted email campaigns

If `FLODESK_API_KEY` is not set, applications still save to Supabase — Flodesk just won't receive them.
