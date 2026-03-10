# API Routes

## Public (no auth required)

### POST /api/waitlist
Stores a waitlist application in Supabase and sends it to Flodesk.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@email.com",
  "phone": "(615) 555-1234",
  "age": "28",
  "gender": "Female",
  "instagram": "@janedoe",
  "neighborhood": "East Nashville",
  "work": "Songwriter",
  "heardFrom": "Instagram",
  "interesting": "I've traveled to 30 countries...",
  "idealDate": "Rooftop dinner at sunset",
  "referralCode": ""
}
```

**Response:** `{ "success": true }`

---

## Authenticated (requires login)

### GET /api/matches
Returns the logged-in user's mutual matches (Double Take votes where both people voted for each other).

**Response:**
```json
{
  "matches": [
    {
      "event_id": "...",
      "matched_user_id": "...",
      "matched_first_name": "Sarah",
      "matched_instagram": "@sarah",
      "event_name": "Rooftop Rosé",
      "matched_at": "2026-04-12T..."
    }
  ]
}
```

### POST /api/events/[slug]/rsvp
RSVP to an event. Handles duplicates gracefully.

### POST /api/events/[slug]/double-take
Submit match votes after an event. Body: `{ "votedForIds": ["uuid1", "uuid2"] }`

---

## Admin Only (requires is_admin = true)

### POST /api/events/[slug]/check-in
Mark an attendee as checked in. Body: `{ "profileId": "uuid" }`

### POST /api/events/[slug]/phases
Control live event flow. Body: `{ "action": "start" | "advance" | "pause" | "resume" | "extend", "extraMinutes": 5 }`

### POST /api/events/[slug]/generate-groups
Auto-generate balanced groups for all grouped phases. Optimizes for gender diversity, neighborhood mixing, and no repeat pairings.
