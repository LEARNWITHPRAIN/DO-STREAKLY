-- ====================================================================
-- DO STREAKLY: PostgreSQL Database Schema for Supabase
-- Better habits. Together.
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  best_streak INTEGER DEFAULT 0 NOT NULL,
  habits_completed_count INTEGER DEFAULT 0 NOT NULL,
  challenges_won_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Flame' NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('boolean', 'measurable')),
  target_value NUMERIC DEFAULT 1 NOT NULL,
  unit TEXT DEFAULT 'reps' NOT NULL,
  frequency TEXT DEFAULT 'daily' NOT NULL CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  xp_value INTEGER DEFAULT 20 NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  is_paused BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HABIT COMPLETIONS TABLE (with duplicate prevention)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  progress_value NUMERIC DEFAULT 1 NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_habit_daily_completion UNIQUE (habit_id, completed_date)
);

-- 4. XP TRANSACTIONS (Auditable XP history)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('habit', 'challenge', 'streak_bonus', 'achievement')),
  source_id TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- 6. CHALLENGES TABLE (Main Social USP)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  habit_title TEXT NOT NULL,
  habit_type TEXT NOT NULL DEFAULT 'boolean' CHECK (habit_type IN ('boolean', 'measurable')),
  target_value NUMERIC DEFAULT 1 NOT NULL,
  unit TEXT DEFAULT 'reps',
  duration_days INTEGER DEFAULT 30 NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  xp_reward INTEGER DEFAULT 300 NOT NULL,
  rules TEXT,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. CHALLENGE PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  progress_count INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'joined' NOT NULL CHECK (status IN ('invited', 'joined', 'declined', 'completed')),
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_challenge_participant UNIQUE (challenge_id, user_id)
);

-- 8. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 50 NOT NULL,
  tier TEXT DEFAULT 'bronze' NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

-- 9. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- Seed Initial Achievements
INSERT INTO public.achievements (id, title, description, icon, xp_reward, tier) VALUES
('first_habit', 'First Step', 'Created your very first habit', 'Sparkles', 25, 'bronze'),
('first_completion', 'Streak Ignition', 'Completed your first daily habit', 'Flame', 30, 'bronze'),
('streak_3', 'On A Roll', 'Maintained a 3-day habit streak', 'Zap', 50, 'bronze'),
('streak_7', 'Week Warrior', 'Maintained a 7-day habit streak', 'Award', 100, 'silver'),
('streak_30', 'Habit Master', 'Completed a 30-day streak', 'Crown', 300, 'gold'),
('challenge_join', 'Challenger', 'Joined your first friend challenge', 'Users', 50, 'bronze'),
('challenge_win', 'Champion', 'Won 1st place in a friend challenge', 'Trophy', 250, 'gold'),
('level_5', 'High Climber', 'Reached Level 5 in DO STREAKLY', 'ShieldCheck', 100, 'silver'),
('xp_1000', 'XP Legend', 'Accumulated 1,000 Total XP', 'Target', 150, 'silver')
ON CONFLICT (id) DO NOTHING;

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date ON public.habit_completions(habit_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON public.habit_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON public.friendships(user_id, friend_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants ON public.challenge_participants(challenge_id, user_id);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read for leaderboards, user can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits: Only owner can view, insert, update, delete
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit Completions: Users manage their completions
CREATE POLICY "Users can view own completions" ON public.habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON public.habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON public.habit_completions
  FOR DELETE USING (auth.uid() = user_id);

-- XP Transactions: Users can view own transactions
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp transactions" ON public.xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships: Users can view their own friendships
CREATE POLICY "Users can view their friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Challenges: Viewable by everyone (for discovery and friend challenges)
CREATE POLICY "Challenges viewable by authenticated users" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = creator_id);

-- Challenge Participants: Viewable by everyone, user can join/leave
CREATE POLICY "Participants viewable by authenticated users" ON public.challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participation" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave challenge" ON public.challenge_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements: Public read
CREATE POLICY "Achievements readable by all" ON public.achievements
  FOR SELECT USING (true);

-- User Achievements: Viewable by all (for profiles), manageable by owner
CREATE POLICY "User achievements viewable by all" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can earn achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
