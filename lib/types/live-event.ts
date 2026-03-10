export type PhaseType = "checkin" | "grouped" | "mingle" | "double_take";

export interface EventPhase {
  name: string;
  type: PhaseType;
  duration_minutes: number;
  prompt?: string;
  display_time?: string;
}

export type LiveStatus = "not_started" | "active" | "ended";

export interface LiveEventState {
  id: string;
  slug: string;
  name: string;
  phases: EventPhase[];
  current_phase_index: number;
  phase_started_at: string | null;
  phase_paused: boolean;
  phase_remaining_seconds: number | null;
  live_status: LiveStatus;
  double_take_open: boolean;
}

export interface GroupAssignment {
  event_id: string;
  phase_index: number;
  group_number: number;
  profile_id: string;
}

export interface AttendeeProfile {
  id: string;
  first_name: string;
  gender: string | null;
  neighborhood: string | null;
  age: number | null;
}

export interface GroupMember {
  profile_id: string;
  first_name: string;
  group_number: number;
}
