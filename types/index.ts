export type HabitType = 'yes_no' | 'measurable' | 'boolean';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type FriendshipStatus = 'pending' | 'accepted' | 'declined';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type ChallengeParticipantStatus = 'invited' | 'joined' | 'declined' | 'completed';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
  habits_completed_count: number;
  challenges_won_count: number;
  tutorial_done?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  title?: string; // alias for name
  description?: string;
  icon: string;
  type: 'yes_no' | 'measurable';
  habit_type?: HabitType; // alias
  goal: number;
  target_value?: number; // alias for goal
  unit: string;
  time_of_day: TimeOfDay;
  use_timer?: boolean;
  timer_duration_seconds?: number;
  frequency?: FrequencyType;
  xp_value?: number; // retained for legacy, but 0 in solo mode
  is_archived?: boolean;
  is_paused?: boolean;
  created_at: string;
  updated_at?: string;
  // Computed / Joined properties for Today's view
  is_completed_today?: boolean;
  today_progress?: number;
  today_completion_id?: string;
  current_streak?: number;
  today_note?: string;
  is_challenge_habit?: boolean;
  challenge_name?: string;
  challenge_id?: string;
  challenge_habit_id?: string;
  challenge_points?: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
  note?: string;
  created_at?: string;
}

// Backward compatibility
export type HabitCompletion = HabitLog;

export interface OnboardingData {
  user_id: string;
  wake_time: string;
  targets: string[];
  completed: boolean;
}

export interface ChallengeHabit {
  id: string;
  challenge_id: string;
  name: string;
  type: 'yes_no' | 'measurable';
  unit?: string;
  target?: number;
  points: number;
  log_before_midnight?: boolean;
  // Computed for current user's today
  is_completed_today?: boolean;
  today_value?: number;
}

export interface ChallengeMember {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  total_points: number;
  days_logged: number;
  profile?: Profile;
}

export interface ChallengeLog {
  id: string;
  challenge_id: string;
  user_id: string;
  challenge_habit_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  points_awarded: number;
  created_at?: string;
}

export interface Challenge {
  id: string;
  owner_id: string;
  creator_id?: string; // alias
  name: string;
  title?: string; // alias
  description?: string;
  duration_days: number;
  start_date: string;
  end_date?: string;
  invite_code: string;
  rules?: string;
  status: ChallengeStatus;
  created_at: string;
  habits?: ChallengeHabit[];
  members?: ChallengeMember[];
  participants_count?: number;
  user_joined?: boolean;
  user_rank?: number;
  user_points?: number;
  user_xp?: number;
  is_owner?: boolean;
  days_logged?: number; // e.g. 11/12
  total_days?: number;
  days_remaining?: number;
  winner?: Profile;
}

// Retained for existing challenge components
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  total_xp: number;
  progress_count: number;
  status: ChallengeParticipantStatus;
  joined_at: string;
  profile?: Profile;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source_type: 'habit' | 'challenge' | 'streak_bonus' | 'achievement';
  source_id?: string;
  description: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  friend?: Profile;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked?: boolean;
  unlocked_at?: string;
}
