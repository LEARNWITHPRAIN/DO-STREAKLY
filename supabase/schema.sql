-- ====================================================================
-- DO STREAKLY: Complete Supabase Schema v2
-- Run this in Supabase SQL editor (safe to re-run)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username               TEXT UNIQUE,
  full_name              TEXT,
  avatar_url             TEXT,
  email                  TEXT,
  reminder_enabled       BOOLEAN DEFAULT FALSE NOT NULL,
  reminder_time          TEXT DEFAULT '20:00',
  current_streak         INTEGER DEFAULT 0 NOT NULL,
  best_streak            INTEGER DEFAULT 0 NOT NULL,
  habits_completed_count INTEGER DEFAULT 0 NOT NULL,
  challenges_won_count   INTEGER DEFAULT 0 NOT NULL,
  created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. HABITS (fixed = yes/no | variable = numeric toward goal)
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT DEFAULT 'fire' NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
  unit        TEXT DEFAULT 'reps',
  goal        NUMERIC DEFAULT 1 NOT NULL,
  schedule    TEXT DEFAULT 'daily' NOT NULL CHECK (schedule IN ('daily','weekdays','weekends','custom')),
  custom_days JSONB DEFAULT '[0,1,2,3,4,5,6]',
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. HABIT_LOGS (one row per habit per day)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id   UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  value      NUMERIC DEFAULT 0 NOT NULL,
  completed  BOOLEAN DEFAULT FALSE NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_habit_log UNIQUE (habit_id, date)
);

-- 4. CHALLENGES
CREATE TABLE IF NOT EXISTS public.challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  duration_days INTEGER DEFAULT 30 NOT NULL,
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  invite_code   TEXT UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  status        TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active','completed','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. CHALLENGE_HABITS
CREATE TABLE IF NOT EXISTS public.challenge_habits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT DEFAULT 'fire',
  type         TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
  unit         TEXT DEFAULT 'reps',
  goal         NUMERIC DEFAULT 1 NOT NULL,
  points       INTEGER DEFAULT 10 NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. CHALLENGE_MEMBERS
CREATE TABLE IF NOT EXISTS public.challenge_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  joined_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT   uq_challenge_member UNIQUE (challenge_id, user_id)
);

-- 7. CHALLENGE_LOGS
CREATE TABLE IF NOT EXISTS public.challenge_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id       UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  challenge_habit_id UUID NOT NULL REFERENCES public.challenge_habits(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  value              NUMERIC DEFAULT 0 NOT NULL,
  completed          BOOLEAN DEFAULT FALSE NOT NULL,
  points_awarded     INTEGER DEFAULT 0 NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT         uq_challenge_log UNIQUE (challenge_habit_id, user_id, date)
);

-- 8. NUDGES (streak-at-risk pings between members)
CREATE TABLE IF NOT EXISTS public.nudges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  sent_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_habits_user           ON public.habits(user_id) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date  ON public.habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_challenges_invite     ON public.challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_challenge_members_uid ON public.challenge_members(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_uid    ON public.challenge_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_chal   ON public.challenge_logs(challenge_id, date);

-- 10. RLS
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_habits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges            ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- HABITS
DROP POLICY IF EXISTS "habits_select" ON public.habits;
DROP POLICY IF EXISTS "habits_insert" ON public.habits;
DROP POLICY IF EXISTS "habits_update" ON public.habits;
DROP POLICY IF EXISTS "habits_delete" ON public.habits;
CREATE POLICY "habits_select" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- HABIT LOGS
DROP POLICY IF EXISTS "habit_logs_all" ON public.habit_logs;
CREATE POLICY "habit_logs_all" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

-- CHALLENGES
DROP POLICY IF EXISTS "challenges_select" ON public.challenges;
DROP POLICY IF EXISTS "challenges_insert" ON public.challenges;
DROP POLICY IF EXISTS "challenges_update" ON public.challenges;
DROP POLICY IF EXISTS "challenges_delete" ON public.challenges;
CREATE POLICY "challenges_select" ON public.challenges FOR SELECT USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM public.challenge_members cm WHERE cm.challenge_id = challenges.id AND cm.user_id = auth.uid())
);
CREATE POLICY "challenges_insert" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "challenges_update" ON public.challenges FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "challenges_delete" ON public.challenges FOR DELETE USING (auth.uid() = owner_id);

-- CHALLENGE HABITS
DROP POLICY IF EXISTS "challenge_habits_select" ON public.challenge_habits;
DROP POLICY IF EXISTS "challenge_habits_manage" ON public.challenge_habits;
CREATE POLICY "challenge_habits_select" ON public.challenge_habits FOR SELECT USING (true);
CREATE POLICY "challenge_habits_manage" ON public.challenge_habits FOR ALL USING (
  EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_habits.challenge_id AND c.owner_id = auth.uid())
);

-- CHALLENGE MEMBERS
DROP POLICY IF EXISTS "challenge_members_select" ON public.challenge_members;
DROP POLICY IF EXISTS "challenge_members_insert" ON public.challenge_members;
DROP POLICY IF EXISTS "challenge_members_delete" ON public.challenge_members;
CREATE POLICY "challenge_members_select" ON public.challenge_members FOR SELECT USING (true);
CREATE POLICY "challenge_members_insert" ON public.challenge_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "challenge_members_delete" ON public.challenge_members FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_members.challenge_id AND c.owner_id = auth.uid())
);

-- CHALLENGE LOGS
DROP POLICY IF EXISTS "challenge_logs_select" ON public.challenge_logs;
DROP POLICY IF EXISTS "challenge_logs_insert" ON public.challenge_logs;
DROP POLICY IF EXISTS "challenge_logs_update" ON public.challenge_logs;
CREATE POLICY "challenge_logs_select" ON public.challenge_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.challenge_members cm WHERE cm.challenge_id = challenge_logs.challenge_id AND cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_logs.challenge_id AND c.owner_id = auth.uid())
);
CREATE POLICY "challenge_logs_insert" ON public.challenge_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "challenge_logs_update" ON public.challenge_logs FOR UPDATE USING (auth.uid() = user_id);

-- NUDGES
DROP POLICY IF EXISTS "nudges_select" ON public.nudges;
DROP POLICY IF EXISTS "nudges_insert" ON public.nudges;
CREATE POLICY "nudges_select" ON public.nudges FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "nudges_insert" ON public.nudges FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 11. FUNCTIONS

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- current_streak(habit_id, user_id) -> integer
CREATE OR REPLACE FUNCTION public.current_streak(p_habit_id UUID, p_user_id UUID)
RETURNS INTEGER LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  streak INT := 0;
  check_date DATE := CURRENT_DATE;
  was_completed BOOLEAN;
BEGIN
  LOOP
    SELECT completed INTO was_completed
      FROM public.habit_logs
     WHERE habit_id = p_habit_id AND user_id = p_user_id AND date = check_date;
    IF NOT FOUND OR NOT was_completed THEN EXIT; END IF;
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  RETURN streak;
END;
$$;

-- get_leaderboard(challenge_id, week_start?) -> table
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_challenge_id UUID, p_week_start DATE DEFAULT NULL)
RETURNS TABLE (
  user_id      UUID,
  username     TEXT,
  full_name    TEXT,
  avatar_url   TEXT,
  total_points BIGINT,
  rank         BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(SUM(cl.points_awarded), 0) AS total_points,
    RANK() OVER (ORDER BY COALESCE(SUM(cl.points_awarded), 0) DESC) AS rank
  FROM public.challenge_members cm
  JOIN public.profiles p ON p.id = cm.user_id
  LEFT JOIN public.challenge_logs cl
    ON cl.challenge_id = p_challenge_id
   AND cl.user_id = cm.user_id
   AND (p_week_start IS NULL OR cl.date >= p_week_start)
  WHERE cm.challenge_id = p_challenge_id
  GROUP BY cm.user_id, p.username, p.full_name, p.avatar_url
  ORDER BY total_points DESC;
END;
$$;

-- join_challenge(code) -> challenge_id UUID
CREATE OR REPLACE FUNCTION public.join_challenge(p_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_challenge_id UUID;
BEGIN
  SELECT id INTO v_challenge_id FROM public.challenges WHERE invite_code = upper(p_code);
  IF NOT FOUND THEN RAISE EXCEPTION 'Challenge not found: %', p_code; END IF;
  INSERT INTO public.challenge_members (challenge_id, user_id)
  VALUES (v_challenge_id, auth.uid())
  ON CONFLICT (challenge_id, user_id) DO NOTHING;
  RETURN v_challenge_id;
END;
$$;

-- log_challenge_habit(challenge_id, habit_id, date, value) -> void
CREATE OR REPLACE FUNCTION public.log_challenge_habit(
  p_challenge_id UUID,
  p_habit_id     UUID,
  p_date         DATE,
  p_value        NUMERIC
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_habit      RECORD;
  v_completed  BOOLEAN;
  v_points     INTEGER := 0;
  v_old_points INTEGER := 0;
BEGIN
  SELECT * INTO v_habit FROM public.challenge_habits WHERE id = p_habit_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Challenge habit not found'; END IF;
  IF v_habit.type = 'fixed' THEN
    v_completed := p_value >= 1;
  ELSE
    v_completed := p_value >= v_habit.goal;
  END IF;
  IF v_completed THEN v_points := v_habit.points; END IF;
  SELECT points_awarded INTO v_old_points FROM public.challenge_logs
   WHERE challenge_habit_id = p_habit_id AND user_id = auth.uid() AND date = p_date;
  INSERT INTO public.challenge_logs (challenge_id, challenge_habit_id, user_id, date, value, completed, points_awarded)
  VALUES (p_challenge_id, p_habit_id, auth.uid(), p_date, p_value, v_completed, v_points)
  ON CONFLICT (challenge_habit_id, user_id, date)
  DO UPDATE SET value = p_value, completed = v_completed, points_awarded = v_points;
  UPDATE public.challenge_members
     SET total_points = total_points + (v_points - COALESCE(v_old_points, 0))
   WHERE challenge_id = p_challenge_id AND user_id = auth.uid();
END;
$$;
