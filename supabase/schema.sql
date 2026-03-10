-- TRU Dating Nashville — Database Schema
-- Run this in your Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════

create type profile_status as enum ('pending', 'approved', 'suspended');
create type attendee_status as enum ('confirmed', 'checked_in', 'cancelled');

-- ═══════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  age integer,
  gender text,
  instagram text,
  neighborhood text,
  work text,
  avatar_url text,
  status profile_status default 'pending',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can fully manage their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Authenticated users can read basic info (first_name, instagram) of other profiles
-- This is needed for Double Take attendee lists and match display
create policy "Authenticated users can read basic profile info"
  on profiles for select to authenticated using (true);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════════════════

create table events (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  date date not null,
  time text not null,
  venue text not null,
  neighborhood text,
  price integer not null,
  age_range text,
  dress_code text,
  capacity integer,
  description text,
  image_url text,
  double_take_open boolean default false,
  created_at timestamptz default now()
);

alter table events enable row level security;

-- Events are readable by all authenticated users
create policy "Authenticated users can view events"
  on events for select to authenticated using (true);

-- ═══════════════════════════════════════════════════════════
-- EVENT ATTENDEES
-- ═══════════════════════════════════════════════════════════

create table event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  profile_id uuid references profiles on delete cascade not null,
  status attendee_status default 'confirmed',
  created_at timestamptz default now(),
  unique (event_id, profile_id)
);

alter table event_attendees enable row level security;

create policy "Users can view attendees for their events"
  on event_attendees for select using (
    profile_id = auth.uid()
    or event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

create policy "Users can insert own attendance"
  on event_attendees for insert with check (profile_id = auth.uid());

create policy "Users can cancel own attendance"
  on event_attendees for update using (profile_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- DOUBLE TAKE VOTES
-- ═══════════════════════════════════════════════════════════

create table double_take_votes (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  voter_id uuid references profiles on delete cascade not null,
  voted_for_id uuid references profiles on delete cascade not null,
  created_at timestamptz default now(),
  unique (event_id, voter_id, voted_for_id)
);

alter table double_take_votes enable row level security;

-- Users can only insert their own votes
create policy "Users can insert own votes"
  on double_take_votes for insert with check (voter_id = auth.uid());

-- Users can only see their own votes
create policy "Users can view own votes"
  on double_take_votes for select using (voter_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- MATCH DETECTION FUNCTION
-- ═══════════════════════════════════════════════════════════
-- Uses SECURITY DEFINER to bypass RLS and detect mutual votes.
-- Without this, RLS on double_take_votes blocks the self-join
-- needed to find reciprocal matches.

create or replace function get_my_matches(requesting_user_id uuid)
returns table (
  event_id uuid,
  matched_user_id uuid,
  matched_first_name text,
  matched_instagram text,
  event_name text,
  matched_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    a.event_id,
    a.voted_for_id as matched_user_id,
    p.first_name as matched_first_name,
    p.instagram as matched_instagram,
    e.name as event_name,
    greatest(a.created_at, b.created_at) as matched_at
  from double_take_votes a
  inner join double_take_votes b
    on a.event_id = b.event_id
    and a.voter_id = b.voted_for_id
    and a.voted_for_id = b.voter_id
  inner join profiles p on p.id = a.voted_for_id
  inner join events e on e.id = a.event_id
  where a.voter_id = requesting_user_id
  order by matched_at desc;
end;
$$;

-- ═══════════════════════════════════════════════════════════
-- LIVE EVENT — New columns on events
-- ═══════════════════════════════════════════════════════════

alter table events add column phases jsonb default '[]'::jsonb;
alter table events add column current_phase_index integer default 0;
alter table events add column phase_started_at timestamptz;
alter table events add column phase_paused boolean default false;
alter table events add column phase_remaining_seconds integer;
alter table events add column live_status text default 'not_started';

-- Admin flag on profiles
alter table profiles add column is_admin boolean default false;

-- Allow admins to update events (for phase control)
create policy "Admins can update events"
  on events for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Allow admins to update attendee status (for check-in)
create policy "Admins can update attendee status"
  on event_attendees for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ═══════════════════════════════════════════════════════════
-- EVENT ROUND GROUPS
-- ═══════════════════════════════════════════════════════════

create table event_round_groups (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  phase_index integer not null,
  group_number integer not null,
  profile_id uuid references profiles on delete cascade not null,
  created_at timestamptz default now(),
  unique (event_id, phase_index, profile_id)
);

alter table event_round_groups enable row level security;

-- Attendees can read groups for events they attend
create policy "Attendees can view groups for their events"
  on event_round_groups for select to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

-- Admins can insert groups
create policy "Admins can insert groups"
  on event_round_groups for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Admins can delete groups (for regeneration)
create policy "Admins can delete groups"
  on event_round_groups for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ═══════════════════════════════════════════════════════════
-- ENABLE REALTIME on events table
-- ═══════════════════════════════════════════════════════════

alter publication supabase_realtime add table events;

-- ═══════════════════════════════════════════════════════════
-- WAITLIST SUBMISSIONS
-- ═══════════════════════════════════════════════════════════

create table waitlist_submissions (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  age text,
  gender text,
  instagram text,
  neighborhood text,
  work text,
  heard_from text,
  interesting text,
  ideal_date text,
  referral_code text,
  created_at timestamptz default now()
);

alter table waitlist_submissions enable row level security;

-- Only admins can read waitlist submissions
create policy "Admins can view waitlist submissions"
  on waitlist_submissions for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Service role inserts (from API route) bypass RLS, so no insert policy needed for users

-- ═══════════════════════════════════════════════════════════
-- SEED DATA — Sample events for launch
-- ═══════════════════════════════════════════════════════════

insert into events (slug, name, date, time, venue, neighborhood, price, age_range, dress_code, capacity, description, image_url, phases) values
  ('rooftop-rose', 'Rooftop Rosé', '2026-04-12', '7:00 PM', 'L.A. Jackson', 'The Gulch', 55, 'Ages 25-35', 'Cocktail Attire', 30, 'Join us on one of Nashville''s most iconic rooftops for an evening of rosé, real conversation, and skyline views.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    '[{"name":"Check-In & Welcome Drink","type":"checkin","duration_minutes":20,"prompt":"Grab your first glass and find your name tag!"},{"name":"Flight 1: Provence Rosé","type":"grouped","duration_minutes":15,"prompt":"What''s everyone''s go-to drink order on a first date?"},{"name":"Flight 2: Spanish Rosado","type":"grouped","duration_minutes":15,"prompt":"What''s the most spontaneous thing you''ve done this year?"},{"name":"Flight 3: Italian Rosato","type":"grouped","duration_minutes":15,"prompt":"If you could live anywhere for a year, where would it be?"},{"name":"Flight 4: California Rosé","type":"grouped","duration_minutes":15,"prompt":"What''s something you''re weirdly passionate about?"},{"name":"Open Mingle","type":"mingle","duration_minutes":20,"prompt":"Mingle freely — grab another glass and find someone you want to keep talking to."},{"name":"Double Take","type":"double_take","duration_minutes":10,"prompt":"Time to pick your favorites! Open Double Take on your phone."}]'::jsonb),
  ('coffee-hike-radnor', 'Coffee + Hike: Radnor Lake', '2026-04-13', '8:30 AM', 'Radnor Lake Trailhead', 'South Nashville', 35, 'Ages 25-38', 'Athleisure', 24, 'Start your Sunday with cold brew, fresh air, and great company. Rotating trail partners on the Radnor Lake loop.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    '[{"name":"Coffee & Introductions","type":"checkin","duration_minutes":15,"prompt":"Grab your cold brew and say hi to the group!"},{"name":"Trail Segment 1","type":"grouped","duration_minutes":20,"prompt":"What do you do to recharge on weekends?"},{"name":"Trail Segment 2","type":"grouped","duration_minutes":20,"prompt":"What''s the best trip you''ve taken recently?"},{"name":"Trail Segment 3","type":"grouped","duration_minutes":20,"prompt":"What would your ideal Sunday look like?"},{"name":"Cool Down & Mingle","type":"mingle","duration_minutes":15,"prompt":"Stretch it out and chat with whoever catches your eye."},{"name":"Double Take","type":"double_take","duration_minutes":10,"prompt":"Time to pick your favorites!"}]'::jsonb),
  ('candlelight-conversation', 'Candlelight & Conversation', '2026-04-16', '7:30 PM', 'Bastion', 'Sylvan Park', 50, 'Ages 28-40', 'Smart Casual', 20, 'An intimate evening guided by thoughtful conversation prompts. This isn''t speed dating — it''s slow, intentional connection.', 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80',
    '[{"name":"Arrival & First Pour","type":"checkin","duration_minutes":15,"prompt":"Find a seat and settle in. Your first drink is on us."},{"name":"Round 1: First Impressions","type":"grouped","duration_minutes":20,"prompt":"What''s something people are surprised to learn about you?"},{"name":"Round 2: Going Deeper","type":"grouped","duration_minutes":20,"prompt":"What does a meaningful relationship look like to you?"},{"name":"Round 3: Getting Real","type":"grouped","duration_minutes":20,"prompt":"What''s one thing you''re working on becoming better at?"},{"name":"Free Conversation","type":"mingle","duration_minutes":20,"prompt":"No prompts — just follow the conversation wherever it leads."},{"name":"Double Take","type":"double_take","duration_minutes":10,"prompt":"Pick the people you felt a connection with."}]'::jsonb),
  ('trivia-night', 'Trivia Night: Battle of the Singles', '2026-04-17', '7:00 PM', '5th & Taylor', 'Germantown', 45, 'Ages 25-35', 'Casual Chic', 40, 'Team up with strangers. Compete for glory. Connect after. Winners get bragging rights and a free round.', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    '[{"name":"Check-In & Team Assignment","type":"checkin","duration_minutes":15,"prompt":"Grab a drink and find your team table!"},{"name":"Round 1: Pop Culture","type":"grouped","duration_minutes":15,"prompt":"Work together — every answer counts!"},{"name":"Round 2: Nashville Trivia","type":"grouped","duration_minutes":15,"prompt":"How well do you really know Music City?"},{"name":"Round 3: Wild Card","type":"grouped","duration_minutes":15,"prompt":"Anything goes in the final round."},{"name":"Results & Mingle","type":"mingle","duration_minutes":25,"prompt":"Winners announced! Celebrate (or commiserate) with your team."},{"name":"Double Take","type":"double_take","duration_minutes":10,"prompt":"Who caught your eye tonight?"}]'::jsonb);
