-- ====================================================================
-- DO STREAKLY: PostgreSQL Database Schema for Supabase
-- Section 8 Data Model & Complete Social Challenges
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
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
  tutorial_done BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- If table already exists, alter to add tutorial_done
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tutorial_done') THEN
    ALTER TABLE public.profiles ADD COLUMN tutorial_done BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;
END $$;

-- 2. HABITS TABLE (Solo Habits)
-- habits (id, user_id, name, icon, type: yes_no | measurable, unit, goal, time_of_day, use_timer, created_at)
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Flame' NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('yes_no', 'measurable')),
  unit TEXT DEFAULT 'reps' NOT NULL,
  goal NUMERIC DEFAULT 1 NOT NULL,
  time_of_day TEXT DEFAULT 'anytime' NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  use_timer BOOLEAN DEFAULT FALSE NOT NULL,
  timer_duration_seconds INTEGER DEFAULT 900,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  is_paused BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HABIT LOGS TABLE
-- habit_logs (id, habit_id, user_id, date, value, completed, note, created_at)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC DEFAULT 1 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_habit_daily_log UNIQUE (habit_id, date)
);

-- 4. ONBOARDING TABLE
-- onboarding (id, user_id, wake_time, targets[], completed)
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wake_time TEXT NOT NULL DEFAULT '07:00 AM',
  targets TEXT[] DEFAULT '{}'::TEXT[],
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_onboarding UNIQUE (user_id)
);

-- 5. CHALLENGES TABLE (Friend Challenges / Journey)
-- challenges (id, owner_id, name, duration_days, start_date, invite_code)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER DEFAULT 14 NOT NULL,
  start_date DATE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  description TEXT,
  rules TEXT,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. CHALLENGE HABITS TABLE
-- challenge_habits (id, challenge_id, name, type, unit, target, points, log_before_midnight)
CREATE TABLE IF NOT EXISTS public.challenge_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('yes_no', 'measurable')),
  unit TEXT DEFAULT 'reps',
  target NUMERIC DEFAULT 1 NOT NULL,
  points INTEGER DEFAULT 10 NOT NULL,
  log_before_midnight BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. CHALLENGE MEMBERS TABLE
-- challenge_members (id, challenge_id, user_id, joined_at, total_points)
CREATE TABLE IF NOT EXISTS public.challenge_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_challenge_member UNIQUE (challenge_id, user_id)
);

-- 8. CHALLENGE LOGS TABLE
-- challenge_logs (id, challenge_id, user_id, challenge_habit_id, date, value, points_awarded)
CREATE TABLE IF NOT EXISTS public.challenge_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_habit_id UUID NOT NULL REFERENCES public.challenge_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC DEFAULT 1 NOT NULL,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_challenge_habit_daily UNIQUE (challenge_id, user_id, challenge_habit_id, date)
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_challenges_owner ON public.challenges(owner_id);
CREATE INDEX IF NOT EXISTS idx_challenges_invite_code ON public.challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_challenge_members ON public.challenge_members(challenge_id, user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_habits ON public.challenge_habits(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs ON public.challenge_logs(challenge_id, user_id, date);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read for challenge leaderboards, user updates own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Solo Habits: Only user can view and manage their own habits
DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
CREATE POLICY "Users can insert own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Solo Habit Logs: Users only see and manage their own logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.habit_logs;
CREATE POLICY "Users can view own logs" ON public.habit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own logs" ON public.habit_logs;
CREATE POLICY "Users can manage own logs" ON public.habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding: User only manages their own onboarding
DROP POLICY IF EXISTS "Users can manage own onboarding" ON public.onboarding;
CREATE POLICY "Users can manage own onboarding" ON public.onboarding
  FOR ALL USING (auth.uid() = user_id);

-- Challenges:
-- Users can view challenges if they are the owner OR a member OR via invite_code lookup
DROP POLICY IF EXISTS "Users view their challenges" ON public.challenges;
CREATE POLICY "Users view their challenges" ON public.challenges
  FOR SELECT USING (
    auth.uid() = owner_id 
    OR EXISTS (SELECT 1 FROM public.challenge_members cm WHERE cm.challenge_id = challenges.id AND cm.user_id = auth.uid())
    OR status = 'active'
  );

DROP POLICY IF EXISTS "Authenticated users create challenges" ON public.challenges;
CREATE POLICY "Authenticated users create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners update challenges" ON public.challenges;
CREATE POLICY "Owners update challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners delete challenges" ON public.challenges;
CREATE POLICY "Owners delete challenges" ON public.challenges
  FOR DELETE USING (auth.uid() = owner_id);

-- Challenge Habits:
DROP POLICY IF EXISTS "View challenge habits" ON public.challenge_habits;
CREATE POLICY "View challenge habits" ON public.challenge_habits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage challenge habits" ON public.challenge_habits;
CREATE POLICY "Owners manage challenge habits" ON public.challenge_habits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_habits.challenge_id AND c.owner_id = auth.uid())
  );

-- Challenge Members:
DROP POLICY IF EXISTS "View challenge members" ON public.challenge_members;
CREATE POLICY "View challenge members" ON public.challenge_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join challenge" ON public.challenge_members;
CREATE POLICY "Users can join challenge" ON public.challenge_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members or owners can remove/update member" ON public.challenge_members;
CREATE POLICY "Members or owners can remove/update member" ON public.challenge_members
  FOR ALL USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_members.challenge_id AND c.owner_id = auth.uid())
  );

-- Challenge Logs:
DROP POLICY IF EXISTS "View challenge logs" ON public.challenge_logs;
CREATE POLICY "View challenge logs" ON public.challenge_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.challenge_members cm WHERE cm.challenge_id = challenge_logs.challenge_id AND cm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_logs.challenge_id AND c.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users log challenge habits" ON public.challenge_logs;
CREATE POLICY "Users log challenge habits" ON public.challenge_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, tutorial_done)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
