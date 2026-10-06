import { createClient } from "@/lib/supabase/client";
import {
  Habit,
  Profile,
  Challenge,
  ChallengeHabit,
  ChallengeMember,
  ChallengeLog,
  HabitLog,
  TimeOfDay,
} from "@/types";
import { formatDate } from "@/lib/utils";

// Seed habits matching Section 8 schema (no XP in solo mode)
const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-1",
    user_id: "demo-user",
    name: "Morning 5km Run",
    title: "Morning 5km Run",
    description: "Keep the cardio engine firing before breakfast",
    icon: "Footprints",
    type: "measurable",
    habit_type: "measurable",
    goal: 5,
    target_value: 5,
    unit: "km",
    time_of_day: "morning",
    use_timer: false,
    frequency: "daily",
    xp_value: 0,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: false,
    today_progress: 3,
    current_streak: 6,
  },
  {
    id: "habit-2",
    user_id: "demo-user",
    name: "Read Non-Fiction",
    title: "Read Non-Fiction",
    description: "Continuous learning and mental sharpness",
    icon: "BookOpen",
    type: "measurable",
    habit_type: "measurable",
    goal: 20,
    target_value: 20,
    unit: "pages",
    time_of_day: "afternoon",
    use_timer: false,
    frequency: "daily",
    xp_value: 0,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: true,
    today_progress: 20,
    current_streak: 12,
  },
  {
    id: "habit-3",
    user_id: "demo-user",
    name: "50 Push-Ups",
    title: "50 Push-Ups",
    description: "Daily upper body discipline",
    icon: "Dumbbell",
    type: "measurable",
    habit_type: "measurable",
    goal: 50,
    target_value: 50,
    unit: "reps",
    time_of_day: "morning",
    use_timer: false,
    frequency: "daily",
    xp_value: 0,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: false,
    today_progress: 25,
    current_streak: 4,
  },
  {
    id: "habit-4",
    user_id: "demo-user",
    name: "Cold Shower / 6 AM Wakeup",
    title: "Cold Shower / 6 AM Wakeup",
    description: "Win the morning, win the day",
    icon: "AlarmClock",
    type: "yes_no",
    habit_type: "boolean",
    goal: 1,
    target_value: 1,
    unit: "time",
    time_of_day: "morning",
    use_timer: false,
    frequency: "daily",
    xp_value: 0,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: true,
    today_progress: 1,
    current_streak: 9,
  },
  {
    id: "habit-5",
    user_id: "demo-user",
    name: "Deep Work Sprint",
    title: "Deep Work Sprint",
    description: "25-minute uninterrupted flow state session",
    icon: "Brain",
    type: "measurable",
    habit_type: "measurable",
    goal: 25,
    target_value: 25,
    unit: "mins",
    time_of_day: "afternoon",
    use_timer: true,
    timer_duration_seconds: 1500, // 25 mins
    frequency: "daily",
    xp_value: 0,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: false,
    today_progress: 0,
    current_streak: 5,
  },
];

const DEFAULT_PROFILE: Profile = {
  id: "demo-user",
  username: "alex_streaker",
  full_name: "Alex Vance",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  total_xp: 0,
  level: 1,
  current_streak: 12,
  best_streak: 18,
  habits_completed_count: 84,
  challenges_won_count: 2,
  tutorial_done: false,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "chal-pushup-1",
    owner_id: "friend-1",
    name: "30-Day Push-Up Challenge",
    description: "50 push-ups daily before midnight. Stay accountable with friends.",
    duration_days: 30,
    start_date: formatDate(new Date(Date.now() - 11 * 86400000)),
    invite_code: "PUSH30",
    status: "active",
    created_at: new Date().toISOString(),
    habits: [
      {
        id: "ch-h-1",
        challenge_id: "chal-pushup-1",
        name: "50 Daily Push-ups",
        type: "measurable",
        unit: "reps",
        target: 50,
        points: 20,
        log_before_midnight: true,
      },
    ],
    members: [
      {
        id: "cm-1",
        challenge_id: "chal-pushup-1",
        user_id: "friend-1",
        joined_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        total_points: 220,
        days_logged: 11,
        profile: {
          id: "friend-1",
          username: "rahul_fit",
          full_name: "Rahul Sharma",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          total_xp: 220,
          level: 2,
          current_streak: 15,
          best_streak: 22,
          habits_completed_count: 110,
          challenges_won_count: 3,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: "cm-2",
        challenge_id: "chal-pushup-1",
        user_id: "demo-user",
        joined_at: new Date(Date.now() - 11 * 86400000).toISOString(),
        total_points: 200,
        days_logged: 10,
        profile: DEFAULT_PROFILE,
      },
      {
        id: "cm-3",
        challenge_id: "chal-pushup-1",
        user_id: "friend-2",
        joined_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        total_points: 160,
        days_logged: 8,
        profile: {
          id: "friend-2",
          username: "prakhar_dev",
          full_name: "Prakhar Gupta",
          avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          total_xp: 160,
          level: 2,
          current_streak: 12,
          best_streak: 18,
          habits_completed_count: 88,
          challenges_won_count: 2,
          created_at: new Date().toISOString(),
        },
      },
    ],
    participants_count: 3,
    user_joined: true,
    user_rank: 2,
    user_points: 200,
    days_logged: 10,
    total_days: 30,
    days_remaining: 19,
  },
  {
    id: "chal-morning-2",
    owner_id: "demo-user",
    name: "Morning 5K Grind",
    description: "Run 5km every weekday morning. Highest points win.",
    duration_days: 14,
    start_date: formatDate(new Date(Date.now() - 4 * 86400000)),
    invite_code: "RUN5K",
    status: "active",
    created_at: new Date().toISOString(),
    habits: [
      {
        id: "ch-h-2",
        challenge_id: "chal-morning-2",
        name: "Morning 5km Run",
        type: "measurable",
        unit: "km",
        target: 5,
        points: 25,
        log_before_midnight: true,
      },
    ],
    members: [
      {
        id: "cm-m1",
        challenge_id: "chal-morning-2",
        user_id: "demo-user",
        joined_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        total_points: 100,
        days_logged: 4,
        profile: DEFAULT_PROFILE,
      },
      {
        id: "cm-m2",
        challenge_id: "chal-morning-2",
        user_id: "friend-4",
        joined_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        total_points: 75,
        days_logged: 3,
        profile: {
          id: "friend-4",
          username: "sarah_zen",
          full_name: "Sarah Miller",
          avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          total_xp: 75,
          level: 1,
          current_streak: 7,
          best_streak: 11,
          habits_completed_count: 60,
          challenges_won_count: 1,
          created_at: new Date().toISOString(),
        },
      },
    ],
    participants_count: 2,
    user_joined: true,
    user_rank: 1,
    user_points: 100,
    is_owner: true,
    days_logged: 4,
    total_days: 14,
    days_remaining: 10,
  },
];

export class StreaklyService {
  private static STORAGE_PREFIX = "dostreakly_";

  private static getStored<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  // ==========================================
  // PROFILE & TUTORIAL
  // ==========================================
  static async getProfile(): Promise<Profile> {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          return {
            ...data,
            tutorial_done: data.tutorial_done ?? false,
          };
        }

        return {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "streaker",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Streaker",
          avatar_url: user.user_metadata?.avatar_url || "",
          total_xp: 0,
          level: 1,
          current_streak: 0,
          best_streak: 0,
          habits_completed_count: 0,
          challenges_won_count: 0,
          tutorial_done: false,
          created_at: user.created_at,
        };
      }
    } catch (e) {
      console.warn("Using local profile state:", e);
    }

    return this.getStored("profile", DEFAULT_PROFILE);
  }

  static async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();
        if (data && !error) return data;
      }
    } catch (e) {
      console.warn("Falling back to local profile update:", e);
    }

    const current = await this.getProfile();
    const updated = { ...current, ...updates };
    this.setStored("profile", updated);
    return updated;
  }

  static async setTutorialDone(done: boolean = true): Promise<void> {
    await this.updateProfile({ tutorial_done: done });
  }

  // ==========================================
  // ONBOARDING
  // ==========================================
  static async saveOnboarding(data: {
    wake_time: string;
    targets: string[];
  }): Promise<void> {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("onboarding").upsert({
          user_id: user.id,
          wake_time: data.wake_time,
          targets: data.targets,
          completed: true,
        });
      }
    } catch (e) {
      console.warn("Local onboarding save fallback:", e);
    }
    this.setStored("onboarding", { ...data, completed: true });
  }

  // ==========================================
  // SOLO HABITS
  // ==========================================
  static async getHabits(): Promise<Habit[]> {
    const supabase = createClient();
    const today = formatDate(new Date());

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: habits, error } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_archived", false)
          .order("created_at", { ascending: true });

        if (habits && !error && habits.length > 0) {
          const { data: logs } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", today);

          const logsMap = new Map(logs?.map((l) => [l.habit_id, l]) || []);

          return habits.map((h) => {
            const log = logsMap.get(h.id);
            const isCompleted = log ? log.completed : false;
            const progress = log ? log.value : 0;

            return {
              ...h,
              title: h.name,
              goal: h.goal || h.target_value || 1,
              target_value: h.goal || h.target_value || 1,
              is_completed_today: isCompleted,
              today_progress: progress,
              today_note: log?.note || "",
              current_streak: h.current_streak || 0,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Falling back to local habits:", e);
    }

    const localHabits = this.getStored("habits", DEFAULT_HABITS);
    // Fetch local logs for today
    const logs = this.getStored<Record<string, { value: number; completed: boolean; note?: string }>>(
      `logs_${today}`,
      {}
    );

    return localHabits.map((h) => {
      const log = logs[h.id];
      const isCompleted = log ? log.completed : !!h.is_completed_today;
      const progress = log ? log.value : (h.today_progress || 0);

      return {
        ...h,
        title: h.name || h.title || "Habit",
        name: h.name || h.title || "Habit",
        goal: h.goal || h.target_value || 1,
        target_value: h.goal || h.target_value || 1,
        is_completed_today: isCompleted,
        today_progress: progress,
        today_note: log?.note || h.today_note || "",
      };
    });
  }

  static async createHabit(habitData: {
    name: string;
    title?: string;
    description?: string;
    icon: string;
    type: "yes_no" | "measurable";
    goal: number;
    unit: string;
    time_of_day?: TimeOfDay;
    use_timer?: boolean;
    timer_duration_seconds?: number;
    frequency?: "daily" | "weekdays" | "weekends" | "custom";
  }): Promise<Habit> {
    const supabase = createClient();
    const habitName = habitData.name || habitData.title || "New Habit";
    const timeOfDay = habitData.time_of_day || "anytime";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("habits")
          .insert({
            user_id: user.id,
            name: habitName,
            icon: habitData.icon,
            type: habitData.type,
            unit: habitData.unit,
            goal: habitData.goal,
            time_of_day: timeOfDay,
            use_timer: habitData.use_timer || false,
            timer_duration_seconds: habitData.timer_duration_seconds || 900,
          })
          .select()
          .single();

        if (data && !error) {
          return {
            ...data,
            title: data.name,
            is_completed_today: false,
            today_progress: 0,
            current_streak: 0,
          };
        }
      }
    } catch (e) {
      console.warn("Falling back to local habit creation:", e);
    }

    const currentHabits = await this.getHabits();
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      user_id: "demo-user",
      name: habitName,
      title: habitName,
      description: habitData.description || "",
      icon: habitData.icon,
      type: habitData.type,
      habit_type: habitData.type === "yes_no" ? "boolean" : "measurable",
      goal: habitData.goal,
      target_value: habitData.goal,
      unit: habitData.unit,
      time_of_day: timeOfDay,
      use_timer: habitData.use_timer || false,
      timer_duration_seconds: habitData.timer_duration_seconds || 900,
      frequency: habitData.frequency || "daily",
      xp_value: 0,
      is_archived: false,
      is_paused: false,
      created_at: new Date().toISOString(),
      is_completed_today: false,
      today_progress: 0,
      current_streak: 0,
    };

    const updated = [newHabit, ...currentHabits];
    this.setStored("habits", updated);
    return newHabit;
  }

  static async completeHabit(
    habitId: string,
    increment?: number,
    note?: string
  ): Promise<{
    habit: Habit;
    streakIncreased: boolean;
  }> {
    const habits = await this.getHabits();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) throw new Error("Habit not found");

    const today = formatDate(new Date());
    let isNowCompleted = false;
    let currentProgress = habit.today_progress || 0;
    const goal = habit.goal || habit.target_value || 1;

    if (habit.type === "yes_no" || habit.habit_type === "boolean") {
      isNowCompleted = true;
      currentProgress = 1;
    } else {
      const addValue = increment !== undefined ? increment : goal;
      currentProgress = Math.min(goal, currentProgress + addValue);
      if (currentProgress >= goal) {
        isNowCompleted = true;
      }
    }

    const streakIncreased = isNowCompleted && !habit.is_completed_today;
    const newStreak = streakIncreased
      ? (habit.current_streak || 0) + 1
      : (habit.current_streak || 1);

    // Supabase
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("habit_logs").upsert(
          {
            habit_id: habitId,
            user_id: user.id,
            date: today,
            value: currentProgress,
            completed: isNowCompleted,
            note: note || habit.today_note,
          },
          { onConflict: "habit_id, date" }
        );
      }
    } catch (e) {
      console.warn("Supabase record failed, using local storage state:", e);
    }

    // Update local logs
    const logs = this.getStored<Record<string, { value: number; completed: boolean; note?: string }>>(
      `logs_${today}`,
      {}
    );
    logs[habitId] = {
      value: currentProgress,
      completed: isNowCompleted,
      note: note || habit.today_note,
    };
    this.setStored(`logs_${today}`, logs);

    // Update local habit state
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          is_completed_today: isNowCompleted,
          today_progress: currentProgress,
          current_streak: newStreak,
          today_note: note || h.today_note,
        };
      }
      return h;
    });
    this.setStored("habits", updatedHabits);

    // Update Profile Streaks
    if (streakIncreased) {
      const profile = await this.getProfile();
      await this.updateProfile({
        current_streak: profile.current_streak + 1,
        best_streak: Math.max(profile.best_streak, profile.current_streak + 1),
        habits_completed_count: profile.habits_completed_count + 1,
      });
    }

    return {
      habit: updatedHabits.find((h) => h.id === habitId)!,
      streakIncreased,
    };
  }

  // UNDO HABIT (Step 4 of tutorial: "Undo. You can undo the action after mishandling.")
  static async undoHabit(habitId: string): Promise<Habit> {
    const habits = await this.getHabits();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) throw new Error("Habit not found");

    const today = formatDate(new Date());
    const wasCompleted = habit.is_completed_today;

    // Delete or update log in Supabase
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", today);
      }
    } catch (e) {
      console.warn("Supabase delete failed:", e);
    }

    // Local storage logs
    const logs = this.getStored<Record<string, { value: number; completed: boolean; note?: string }>>(
      `logs_${today}`,
      {}
    );
    delete logs[habitId];
    this.setStored(`logs_${today}`, logs);

    const newStreak = wasCompleted && (habit.current_streak || 0) > 0
      ? (habit.current_streak || 1) - 1
      : (habit.current_streak || 0);

    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          is_completed_today: false,
          today_progress: 0,
          current_streak: newStreak,
        };
      }
      return h;
    });
    this.setStored("habits", updatedHabits);

    return updatedHabits.find((h) => h.id === habitId)!;
  }

  static async saveHabitNote(habitId: string, note: string): Promise<void> {
    const today = formatDate(new Date());
    const logs = this.getStored<Record<string, { value: number; completed: boolean; note?: string }>>(
      `logs_${today}`,
      {}
    );
    if (!logs[habitId]) {
      logs[habitId] = { value: 0, completed: false, note };
    } else {
      logs[habitId].note = note;
    }
    this.setStored(`logs_${today}`, logs);

    const habits = await this.getHabits();
    const updated = habits.map((h) => (h.id === habitId ? { ...h, today_note: note } : h));
    this.setStored("habits", updated);
  }

  static async deleteHabit(habitId: string): Promise<void> {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("habits").delete().eq("id", habitId);
      }
    } catch (e) {
      console.warn("Supabase delete habit failed:", e);
    }

    const habits = await this.getHabits();
    this.setStored("habits", habits.filter((h) => h.id !== habitId));
  }

  // ==========================================
  // FRIEND CHALLENGES (JOURNEY TAB)
  // XP & Points exist ONLY here!
  // ==========================================
  static async getChallenges(): Promise<Challenge[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select(`
          *,
          habits:challenge_habits(*),
          members:challenge_members(*, profile:profiles(*))
        `)
        .order("created_at", { ascending: false });

      if (data && !error && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Falling back to local challenges:", e);
    }

    return this.getStored("challenges", DEFAULT_CHALLENGES);
  }

  static async getChallengeById(id: string): Promise<Challenge | null> {
    const challenges = await this.getChallenges();
    return challenges.find((c) => c.id === id) || null;
  }

  static async getChallengeByInviteCode(code: string): Promise<Challenge | null> {
    const challenges = await this.getChallenges();
    const normalized = code.trim().toUpperCase();
    return (
      challenges.find(
        (c) => c.invite_code?.toUpperCase() === normalized || c.id === code
      ) || null
    );
  }

  static async createChallenge(data: {
    name: string;
    duration_days: number;
    start_date: string;
    description?: string;
    habits: Array<{
      name: string;
      type: "yes_no" | "measurable";
      unit?: string;
      target?: number;
      points: number;
      log_before_midnight?: boolean;
    }>;
  }): Promise<Challenge> {
    const profile = await this.getProfile();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const challengeId = `chal-${Date.now()}`;

    const challengeHabits: ChallengeHabit[] = data.habits.map((h, i) => ({
      id: `ch-h-${Date.now()}-${i}`,
      challenge_id: challengeId,
      name: h.name,
      type: h.type,
      unit: h.unit || "reps",
      target: h.target || 1,
      points: Number(h.points) || 10,
      log_before_midnight: h.log_before_midnight || false,
    }));

    const initialMember: ChallengeMember = {
      id: `cm-${Date.now()}`,
      challenge_id: challengeId,
      user_id: profile.id,
      joined_at: new Date().toISOString(),
      total_points: 0,
      days_logged: 0,
      profile,
    };

    const newChallenge: Challenge = {
      id: challengeId,
      owner_id: profile.id,
      name: data.name,
      title: data.name,
      description: data.description || "",
      duration_days: data.duration_days,
      start_date: data.start_date,
      invite_code: inviteCode,
      status: "active",
      created_at: new Date().toISOString(),
      habits: challengeHabits,
      members: [initialMember],
      participants_count: 1,
      user_joined: true,
      user_rank: 1,
      user_points: 0,
      is_owner: true,
      days_logged: 0,
      total_days: data.duration_days,
      days_remaining: data.duration_days,
    };

    // Supabase
    const supabase = createClient();
    try {
      const { data: created, error } = await supabase
        .from("challenges")
        .insert({
          owner_id: profile.id,
          name: data.name,
          duration_days: data.duration_days,
          start_date: data.start_date,
          invite_code: inviteCode,
          description: data.description,
        })
        .select()
        .single();

      if (created && !error) {
        // Insert habits & creator membership
        await supabase.from("challenge_habits").insert(
          challengeHabits.map((h) => ({
            challenge_id: created.id,
            name: h.name,
            type: h.type,
            unit: h.unit,
            target: h.target,
            points: h.points,
            log_before_midnight: h.log_before_midnight,
          }))
        );

        await supabase.from("challenge_members").insert({
          challenge_id: created.id,
          user_id: profile.id,
        });
      }
    } catch (e) {
      console.warn("Local challenge create fallback:", e);
    }

    const current = await this.getChallenges();
    const updated = [newChallenge, ...current];
    this.setStored("challenges", updated);
    return newChallenge;
  }

  static async joinChallenge(inviteCodeOrId: string): Promise<{ success: boolean; challenge: Challenge; alreadyJoined: boolean }> {
    const profile = await this.getProfile();
    const challenge = await this.getChallengeByInviteCode(inviteCodeOrId);
    if (!challenge) {
      throw new Error("Challenge not found with this code.");
    }

    // Check if already a member (PREVENT JOINING TWICE)
    const isAlreadyMember = challenge.members?.some(
      (m) => m.user_id === profile.id || m.profile?.id === profile.id
    ) || challenge.user_joined;

    if (isAlreadyMember) {
      return { success: true, challenge, alreadyJoined: true };
    }

    const newMember: ChallengeMember = {
      id: `cm-${Date.now()}`,
      challenge_id: challenge.id,
      user_id: profile.id,
      joined_at: new Date().toISOString(),
      total_points: 0,
      days_logged: 0,
      profile,
    };

    const updatedMembers = [...(challenge.members || []), newMember];
    const updatedChallenge: Challenge = {
      ...challenge,
      members: updatedMembers,
      participants_count: updatedMembers.length,
      user_joined: true,
      user_rank: updatedMembers.length,
      user_points: 0,
    };

    // Supabase
    const supabase = createClient();
    try {
      await supabase.from("challenge_members").insert({
        challenge_id: challenge.id,
        user_id: profile.id,
      });
    } catch (e) {
      console.warn("Supabase join challenge failed:", e);
    }

    const all = await this.getChallenges();
    const updatedAll = all.map((c) => (c.id === challenge.id ? updatedChallenge : c));
    this.setStored("challenges", updatedAll);

    return { success: true, challenge: updatedChallenge, alreadyJoined: false };
  }

  // LOG CHALLENGE HABIT (awards points ONLY when target is met)
  static async logChallengeHabit(
    challengeId: string,
    challengeHabitId: string,
    value: number
  ): Promise<{ pointsAwarded: number; challenge: Challenge }> {
    const profile = await this.getProfile();
    const challenges = await this.getChallenges();
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const habit = challenge.habits?.find((h) => h.id === challengeHabitId);
    if (!habit) throw new Error("Challenge habit not found");

    const today = formatDate(new Date());
    const isTargetMet = habit.type === "yes_no"
      ? value >= 1
      : value >= (habit.target || 1);

    const pointsToAward = isTargetMet ? habit.points : 0;

    // Supabase
    const supabase = createClient();
    try {
      await supabase.from("challenge_logs").upsert(
        {
          challenge_id: challengeId,
          user_id: profile.id,
          challenge_habit_id: challengeHabitId,
          date: today,
          value,
          points_awarded: pointsToAward,
        },
        { onConflict: "challenge_id, user_id, challenge_habit_id, date" }
      );
    } catch (e) {
      console.warn("Supabase challenge log failed:", e);
    }

    // Update challenge member points
    const updatedMembers = (challenge.members || []).map((m) => {
      if (m.user_id === profile.id || m.profile?.id === profile.id) {
        return {
          ...m,
          total_points: (m.total_points || 0) + pointsToAward,
          days_logged: (m.days_logged || 0) + (isTargetMet ? 1 : 0),
        };
      }
      return m;
    });

    const updatedChallenge: Challenge = {
      ...challenge,
      members: updatedMembers,
      user_points: ((challenge.user_points || 0) + pointsToAward),
    };

    const updatedAll = challenges.map((c) =>
      c.id === challengeId ? updatedChallenge : c
    );
    this.setStored("challenges", updatedAll);

    return { pointsAwarded: pointsToAward, challenge: updatedChallenge };
  }

  // Get active Challenge Habits for user's Today screen
  static async getTodayChallengeHabits(): Promise<Array<{
    challenge: Challenge;
    habit: ChallengeHabit;
  }>> {
    const profile = await this.getProfile();
    const challenges = await this.getChallenges();
    const activeUserChallenges = challenges.filter(
      (c) => c.user_joined && c.status === "active"
    );

    const list: Array<{ challenge: Challenge; habit: ChallengeHabit }> = [];
    for (const c of activeUserChallenges) {
      if (c.habits) {
        for (const h of c.habits) {
          list.push({ challenge: c, habit: h });
        }
      }
    }
    return list;
  }

  // Creator can remove member
  static async removeChallengeMember(challengeId: string, userId: string): Promise<Challenge> {
    const challenges = await this.getChallenges();
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const updatedMembers = (challenge.members || []).filter(
      (m) => m.user_id !== userId && m.profile?.id !== userId
    );

    const updatedChallenge = {
      ...challenge,
      members: updatedMembers,
      participants_count: updatedMembers.length,
    };

    const updatedAll = challenges.map((c) => (c.id === challengeId ? updatedChallenge : c));
    this.setStored("challenges", updatedAll);
    return updatedChallenge;
  }

  // Creator can regenerate invite link
  static async regenerateInviteCode(challengeId: string): Promise<string> {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const challenges = await this.getChallenges();
    const updatedAll = challenges.map((c) =>
      c.id === challengeId ? { ...c, invite_code: newCode } : c
    );
    this.setStored("challenges", updatedAll);
    return newCode;
  }

  // Creator can edit challenge before it starts
  static async updateChallenge(
    challengeId: string,
    updates: Partial<Challenge>
  ): Promise<Challenge> {
    const challenges = await this.getChallenges();
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const updatedChallenge = { ...challenge, ...updates };
    const updatedAll = challenges.map((c) =>
      c.id === challengeId ? updatedChallenge : c
    );
    this.setStored("challenges", updatedAll);
    return updatedChallenge;
  }

  // Friends mock for rankings
  static async getFriends(): Promise<Profile[]> {
    return [
      {
        id: "friend-1",
        username: "rahul_fit",
        full_name: "Rahul Sharma",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        total_xp: 0,
        level: 1,
        current_streak: 15,
        best_streak: 22,
        habits_completed_count: 110,
        challenges_won_count: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: "friend-2",
        username: "prakhar_dev",
        full_name: "Prakhar Gupta",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        total_xp: 0,
        level: 1,
        current_streak: 12,
        best_streak: 18,
        habits_completed_count: 88,
        challenges_won_count: 2,
        created_at: new Date().toISOString(),
      },
    ];
  }

  static async addFriend(username: string): Promise<Profile> {
    const newFriend: Profile = {
      id: `friend-${Date.now()}`,
      username: username.toLowerCase().replace(/\s+/g, "_"),
      full_name: username,
      avatar_url: "",
      total_xp: 0,
      level: 1,
      current_streak: 1,
      best_streak: 1,
      habits_completed_count: 5,
      challenges_won_count: 0,
      created_at: new Date().toISOString(),
    };
    return newFriend;
  }

  static async getGlobalLeaderboard(): Promise<Array<{ rank: number; profile: Profile; isCurrentUser: boolean }>> {
    const profile = await this.getProfile();
    const friends = await this.getFriends();
    return [
      { rank: 1, profile: friends[0], isCurrentUser: false },
      { rank: 2, profile, isCurrentUser: true },
      { rank: 3, profile: friends[1], isCurrentUser: false },
    ];
  }

  static async getAchievements() {
    return [
      {
        id: "first_habit",
        title: "First Step",
        description: "Created your very first habit",
        icon: "Sparkles",
        xp_reward: 25,
        tier: "bronze" as const,
        unlocked: true,
      },
      {
        id: "first_completion",
        title: "Streak Ignition",
        description: "Completed your first daily habit",
        icon: "Flame",
        xp_reward: 30,
        tier: "bronze" as const,
        unlocked: true,
      },
      {
        id: "streak_7",
        title: "Week Warrior",
        description: "Maintained a 7-day habit streak",
        icon: "Award",
        xp_reward: 100,
        tier: "silver" as const,
        unlocked: true,
      },
    ];
  }
}

