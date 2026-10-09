// ─── Primitives ──────────────────────────────────────────────────────────────
export type HabitType       = 'fixed' | 'variable';
export type HabitSchedule   = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type ChallengeStatus = 'active' | 'completed' | 'cancelled';

// ─── Database rows ────────────────────────────────────────────────────────────

export interface Profile {
  id:                     string;
  username:               string;
  full_name:              string;
  avatar_url:             string | null;
  email:                  string | null;
  reminder_enabled:       boolean;
  reminder_time:          string;   // e.g. "20:00"
  current_streak:         number;
  best_streak:            number;
  habits_completed_count: number;
  challenges_won_count:   number;
  created_at:             string;
  updated_at:             string;
}

export interface Habit {
  id:          string;
  user_id:     string;
  name:        string;
  icon:        string;
  type:        HabitType;
  unit:        string;
  goal:        number;
  schedule:    HabitSchedule;
  custom_days: number[];   // [0-6] Sun=0
  is_archived: boolean;
  created_at:  string;
  updated_at:  string;
  // Computed/joined
  today_value?:   number;
  completed_today?: boolean;
  current_streak?:  number;
}

export interface HabitLog {
  id:         string;
  habit_id:   string;
  user_id:    string;
  date:       string;    // YYYY-MM-DD
  value:      number;
  completed:  boolean;
  note:       string | null;
  created_at: string;
}

export interface Challenge {
  id:            string;
  owner_id:      string;
  name:          string;
  description:   string | null;
  duration_days: number;
  start_date:    string;  // YYYY-MM-DD
  invite_code:   string;
  status:        ChallengeStatus;
  created_at:    string;
  // Computed/joined
  habits?:       ChallengeHabit[];
  members?:      ChallengeMember[];
  days_elapsed?: number;
  days_remaining?: number;
  user_points?:  number;
  user_rank?:    number;
  is_owner?:     boolean;
}

export interface ChallengeHabit {
  id:           string;
  challenge_id: string;
  name:         string;
  icon:         string;
  type:         HabitType;
  unit:         string;
  goal:         number;
  points:       number;
  created_at:   string;
  // Computed
  today_value?:    number;
  completed_today?: boolean;
  streak?:          number;
  completion_rate?: number;  // 0-100
}

export interface ChallengeMember {
  id:           string;
  challenge_id: string;
  user_id:      string;
  total_points: number;
  joined_at:    string;
  profile?:     Profile;
}

export interface ChallengeLog {
  id:                 string;
  challenge_id:       string;
  challenge_habit_id: string;
  user_id:            string;
  date:               string;
  value:              number;
  completed:          boolean;
  points_awarded:     number;
  created_at:         string;
}

export interface Nudge {
  id:           string;
  sender_id:    string;
  receiver_id:  string;
  challenge_id: string | null;
  sent_at:      string;
}

// ─── Leaderboard (returned by get_leaderboard() function) ────────────────────
export interface LeaderboardRow {
  user_id:      string;
  username:     string;
  full_name:    string;
  avatar_url:   string | null;
  total_points: number;
  rank:         number;
}

// ─── Form shapes ─────────────────────────────────────────────────────────────
export interface CreateHabitInput {
  name:     string;
  icon:     string;
  type:     HabitType;
  unit?:    string;
  goal?:    number;
  schedule: HabitSchedule;
  custom_days?: number[];
}

export interface CreateChallengeInput {
  name:         string;
  description?: string;
  duration_days: number;
  start_date:   string;
  habits:       Omit<ChallengeHabit, 'id' | 'challenge_id' | 'created_at'>[];
}
