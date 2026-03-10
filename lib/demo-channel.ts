/* ─── Cross-tab sync for Demo Mode via BroadcastChannel ─── */

export interface DemoState {
  live_status: "not_started" | "active" | "ended";
  current_phase_index: number;
  phase_started_at: string | null;
  phase_paused: boolean;
  phase_remaining_seconds: number | null;
  double_take_open: boolean;
  checked_in_ids: string[];
}

export const INITIAL_DEMO_STATE: DemoState = {
  live_status: "not_started",
  current_phase_index: 0,
  phase_started_at: null,
  phase_paused: false,
  phase_remaining_seconds: null,
  double_take_open: false,
  checked_in_ids: [],
};

const CHANNEL_NAME = "tru-demo-sync";
const STORAGE_KEY = "tru-demo-state";

/** Save state to sessionStorage so attendee survives refresh */
export function saveDemoState(state: DemoState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable
  }
}

/** Load state from sessionStorage */
export function loadDemoState(): DemoState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoState) : null;
  } catch {
    return null;
  }
}

/** Broadcast state to all other tabs */
export function broadcastDemoState(state: DemoState): void {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(state);
    channel.close();
    saveDemoState(state);
  } catch {
    // BroadcastChannel may be unavailable
  }
}

/** Subscribe to state updates from other tabs. Returns cleanup function. */
export function subscribeDemoState(callback: (state: DemoState) => void): () => void {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<DemoState>) => {
      saveDemoState(event.data);
      callback(event.data);
    };
    return () => channel.close();
  } catch {
    return () => {};
  }
}
