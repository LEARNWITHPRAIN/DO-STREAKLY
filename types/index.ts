export type HabitType = 'boolean' | 'measurable';
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
  created_at: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  icon: string;
  habit_type: HabitType;
  target_value: number;
  unit: string;
  frequency: FrequencyType;
  xp_value: number;
  is_archived: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at?: string;
  // Computed / Joined properties for Today's view
  is_completed_today?: boolean;
  today_progress?: number;
  today_completion_id?: string;
  current_streak?: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD
  progress_value: number;
  xp_earned: number;
  completed_at: string;
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

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  habit_title: string;
  habit_type: HabitType;
  target_value: number;
  unit: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  xp_reward: number;
  rules?: string;
  status: ChallengeStatus;
  created_at: string;
  creator?: Profile;
  participants_count?: number;
  user_joined?: boolean;
  user_rank?: number;
  user_xp?: number;
}

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
