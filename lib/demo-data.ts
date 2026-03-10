import type { EventPhase } from "@/lib/types/live-event";

/* ─── Demo Attendee ─── */
export interface DemoAttendee {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  neighborhood: string;
  age: number;
  instagram: string;
}

/* ─── 20 Fake Attendees (gender-balanced, diverse Nashville neighborhoods) ─── */
export const DEMO_ATTENDEES: DemoAttendee[] = [
  { id: "a1",  first_name: "Sarah",    last_name: "Mitchell",  gender: "female", neighborhood: "East Nashville",  age: 28, instagram: "@sarahm_nash" },
  { id: "a2",  first_name: "Marcus",   last_name: "Rivera",    gender: "male",   neighborhood: "Germantown",      age: 30, instagram: "@marcusrivera" },
  { id: "a3",  first_name: "Lauren",   last_name: "Brooks",    gender: "female", neighborhood: "12 South",        age: 27, instagram: "@laurenb12s" },
  { id: "a4",  first_name: "Jake",     last_name: "Thompson",  gender: "male",   neighborhood: "The Gulch",       age: 31, instagram: "@jakethompson" },
  { id: "a5",  first_name: "Priya",    last_name: "Patel",     gender: "female", neighborhood: "Sylvan Park",     age: 29, instagram: "@priyap_nash" },
  { id: "a6",  first_name: "Ethan",    last_name: "Collins",   gender: "male",   neighborhood: "Berry Hill",      age: 26, instagram: "@ethancollins" },
  { id: "a7",  first_name: "Mia",      last_name: "Nguyen",    gender: "female", neighborhood: "East Nashville",  age: 30, instagram: "@mia.nguyen" },
  { id: "a8",  first_name: "Tyler",    last_name: "Jackson",   gender: "male",   neighborhood: "Germantown",      age: 32, instagram: "@tylerjackson" },
  { id: "a9",  first_name: "Olivia",   last_name: "Chen",      gender: "female", neighborhood: "The Gulch",       age: 28, instagram: "@oliviachen" },
  { id: "a10", first_name: "Brandon",  last_name: "Williams",  gender: "male",   neighborhood: "12 South",        age: 29, instagram: "@bwilliams12" },
  { id: "a11", first_name: "Rachel",   last_name: "Kim",       gender: "female", neighborhood: "Sylvan Park",     age: 27, instagram: "@rachelkim" },
  { id: "a12", first_name: "Derek",    last_name: "Moore",     gender: "male",   neighborhood: "Berry Hill",      age: 33, instagram: "@derekmoore" },
  { id: "a13", first_name: "Hailey",   last_name: "Scott",     gender: "female", neighborhood: "East Nashville",  age: 26, instagram: "@haileyscott" },
  { id: "a14", first_name: "Jordan",   last_name: "Davis",     gender: "male",   neighborhood: "Germantown",      age: 30, instagram: "@jordandavis" },
  { id: "a15", first_name: "Aisha",    last_name: "Johnson",   gender: "female", neighborhood: "The Gulch",       age: 31, instagram: "@aishaj" },
  { id: "a16", first_name: "Ryan",     last_name: "Foster",    gender: "male",   neighborhood: "12 South",        age: 28, instagram: "@ryanfoster" },
  { id: "a17", first_name: "Camille",  last_name: "Brown",     gender: "female", neighborhood: "Sylvan Park",     age: 29, instagram: "@camillebrown" },
  { id: "a18", first_name: "Noah",     last_name: "Garcia",    gender: "male",   neighborhood: "Berry Hill",      age: 27, instagram: "@noahgarcia" },
  { id: "a19", first_name: "Taylor",   last_name: "Reed",      gender: "female", neighborhood: "East Nashville",  age: 32, instagram: "@taylorreed" },
  { id: "a20", first_name: "Chris",    last_name: "Martinez",  gender: "male",   neighborhood: "Germantown",      age: 26, instagram: "@chrismartinez" },
];

/* ─── Demo User — Lauren Brooks (a3) ─── */
export const DEMO_USER_ID = "a3";
export const DEMO_USER = DEMO_ATTENDEES.find((a) => a.id === DEMO_USER_ID)!;

/* ─── Event Phases ─── */
export const DEMO_PHASES: EventPhase[] = [
  { name: "Check-In & Welcome Drink",            type: "checkin",     duration_minutes: 2, display_time: "7:00 – 7:30 PM" },
  { name: "Flight 1: Provence Rosé",             type: "grouped",    duration_minutes: 2, display_time: "7:30 – 7:45 PM", prompt: "What's everyone's go-to drink order on a first date?" },
  { name: "Flight 2: Spanish Rosado",            type: "grouped",    duration_minutes: 2, display_time: "7:45 – 8:00 PM", prompt: "What's the most spontaneous thing you've done this year?" },
  { name: "Flight 3: Italian Rosato",            type: "grouped",    duration_minutes: 2, display_time: "8:00 – 8:15 PM", prompt: "If you could live anywhere for a year, where would it be?" },
  { name: "Flight 4: California Rosé",           type: "grouped",    duration_minutes: 2, display_time: "8:15 – 8:30 PM", prompt: "What's something you're weirdly passionate about?" },
  { name: "Open Mingle",                         type: "mingle",     duration_minutes: 2, display_time: "8:30 – 9:00 PM" },
  { name: "Double Take",                         type: "double_take", duration_minutes: 2, display_time: "9:00 – 9:15 PM" },
];

/* ─── Demo Event ─── */
export const DEMO_EVENT = {
  id: "demo-001",
  slug: "rooftop-rose-demo",
  name: "Rooftop Rosé",
  venue: "L.A. Jackson",
  neighborhood: "The Gulch",
  date: "Saturday, March 15",
  time: "7:00 PM",
  price: 55,
  age_range: "25-35",
  dress_code: "Cocktail Attire",
  description: "Join us on the rooftop at L.A. Jackson for an evening of rosé tastings and meaningful connections. You'll rotate through four guided flights with curated groups, each paired with a conversation prompt to break the ice. After the flights, enjoy open mingle time before submitting your Double Takes.",
  phases: DEMO_PHASES,
};

/* ─── Pre-computed Groups (groups of 4, Lauren gets different members each round) ─── */
// Phase index → group_number → attendee IDs
// Lauren (a3) is always in group 1
export const DEMO_GROUPS: Record<number, Record<number, string[]>> = {
  // Phase 1 — Flight 1: Provence Rosé
  1: {
    1: ["a3", "a2", "a8", "a15"],   // Lauren, Marcus, Tyler, Aisha
    2: ["a1", "a4", "a7", "a12"],   // Sarah, Jake, Mia, Derek
    3: ["a5", "a6", "a10", "a19"],  // Priya, Ethan, Brandon, Taylor
    4: ["a9", "a14", "a11", "a18"], // Olivia, Jordan, Rachel, Noah
    5: ["a13", "a16", "a17", "a20"],// Hailey, Ryan, Camille, Chris
  },
  // Phase 2 — Flight 2: Spanish Rosado
  2: {
    1: ["a3", "a4", "a12", "a17"],  // Lauren, Jake, Derek, Camille
    2: ["a1", "a6", "a14", "a9"],   // Sarah, Ethan, Jordan, Olivia
    3: ["a2", "a11", "a18", "a13"], // Marcus, Rachel, Noah, Hailey
    4: ["a5", "a8", "a20", "a19"],  // Priya, Tyler, Chris, Taylor
    5: ["a7", "a10", "a16", "a15"], // Mia, Brandon, Ryan, Aisha
  },
  // Phase 3 — Flight 3: Italian Rosato
  3: {
    1: ["a3", "a6", "a14", "a1"],   // Lauren, Ethan, Jordan, Sarah
    2: ["a2", "a9", "a16", "a13"],  // Marcus, Olivia, Ryan, Hailey
    3: ["a4", "a11", "a20", "a7"],  // Jake, Rachel, Chris, Mia
    4: ["a5", "a12", "a18", "a15"], // Priya, Derek, Noah, Aisha
    5: ["a8", "a10", "a17", "a19"], // Tyler, Brandon, Camille, Taylor
  },
  // Phase 4 — Flight 4: California Rosé
  4: {
    1: ["a3", "a10", "a18", "a9"],  // Lauren, Brandon, Noah, Olivia
    2: ["a1", "a8", "a16", "a17"],  // Sarah, Tyler, Ryan, Camille
    3: ["a2", "a5", "a13", "a20"],  // Marcus, Priya, Hailey, Chris
    4: ["a4", "a7", "a15", "a19"],  // Jake, Mia, Aisha, Taylor
    5: ["a6", "a11", "a12", "a14"], // Ethan, Rachel, Derek, Jordan
  },
};

/* ─── Helper: get Lauren's group members for a phase ─── */
export function getDemoGroupMembers(phaseIndex: number): { id: string; first_name: string; group_number: number }[] {
  const phaseGroups = DEMO_GROUPS[phaseIndex];
  if (!phaseGroups) return [];

  for (const [groupNum, ids] of Object.entries(phaseGroups)) {
    if (ids.includes(DEMO_USER_ID)) {
      return ids
        .filter((id) => id !== DEMO_USER_ID)
        .map((id) => {
          const attendee = DEMO_ATTENDEES.find((a) => a.id === id)!;
          return { id: attendee.id, first_name: attendee.first_name, group_number: Number(groupNum) };
        });
    }
  }

  return [];
}

/* ─── Fake Matches (mutual) ─── */
export const DEMO_MATCHES = [
  DEMO_ATTENDEES.find((a) => a.id === "a2")!,  // Marcus
  DEMO_ATTENDEES.find((a) => a.id === "a4")!,  // Jake
  DEMO_ATTENDEES.find((a) => a.id === "a6")!,  // Ethan
];
