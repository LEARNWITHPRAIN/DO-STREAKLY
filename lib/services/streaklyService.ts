import { createClient } from "@/lib/supabase/client";
import { Habit, Profile, Challenge, ChallengeParticipant, Friendship, Achievement, XPTransaction } from "@/types";
import { formatDate, calculateLevel } from "@/lib/utils";

// Initial Demo Seed Data for instant out-of-the-box readiness
const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-1",
    user_id: "demo-user",
    title: "Morning 5km Run",
    description: "Keep the cardio engine firing before breakfast",
    icon: "Footprints",
    habit_type: "measurable",
    target_value: 5,
    unit: "km",
    frequency: "daily",
    xp_value: 40,
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
    title: "Read Non-Fiction Book",
    description: "Continuous learning and mental sharpness",
    icon: "BookOpen",
    habit_type: "measurable",
    target_value: 20,
    unit: "pages",
    frequency: "daily",
    xp_value: 20,
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
    title: "50 Push-Ups Challenge",
    description: "Daily upper body discipline",
    icon: "Dumbbell",
    habit_type: "measurable",
    target_value: 50,
    unit: "reps",
    frequency: "daily",
    xp_value: 25,
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
    title: "Cold Shower / Wake up by 6 AM",
    description: "Win the morning, win the day",
    icon: "AlarmClock",
    habit_type: "boolean",
    target_value: 1,
    unit: "times",
    frequency: "daily",
    xp_value: 15,
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
    title: "Deep Work (Zero Distraction)",
    description: "90 minutes uninterrupted focus on core project",
    icon: "Brain",
    habit_type: "measurable",
    target_value: 90,
    unit: "mins",
    frequency: "daily",
    xp_value: 30,
    is_archived: false,
    is_paused: false,
    created_at: new Date().toISOString(),
    is_completed_today: false,
    today_progress: 45,
    current_streak: 5,
  },
];

const DEFAULT_PROFILE: Profile = {
  id: "demo-user",
  username: "alex_streaker",
  full_name: "Alex Vance",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  total_xp: 1240,
  level: 4,
  current_streak: 12,
  best_streak: 18,
  habits_completed_count: 84,
  challenges_won_count: 2,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "chal-1",
    creator_id: "demo-friend-1",
    title: "30 Day Push-Up Challenge",
    description: "50 push-ups every single day. No excuses. Highest streak wins the crown.",
    habit_title: "50 Push-Ups",
    habit_type: "measurable",
    target_value: 50,
    unit: "reps",
    duration_days: 30,
    start_date: formatDate(new Date(Date.now() - 12 * 86400000)),
    end_date: formatDate(new Date(Date.now() + 18 * 86400000)),
    xp_reward: 350,
    rules: "Log at least 50 reps daily before midnight.",
    status: "active",
    created_at: new Date().toISOString(),
    participants_count: 5,
    user_joined: true,
    user_rank: 2,
    user_xp: 320,
  },
  {
    id: "chal-2",
    creator_id: "demo-user",
    title: "Morning 5K Grind",
    description: "Run 5km every weekday morning. Stay accountable together.",
    habit_title: "5km Run",
    habit_type: "measurable",
    target_value: 5,
    unit: "km",
    duration_days: 14,
    start_date: formatDate(new Date(Date.now() - 4 * 86400000)),
    end_date: formatDate(new Date(Date.now() + 10 * 86400000)),
    xp_reward: 200,
    rules: "Outdoor or treadmill 5km logs.",
    status: "active",
    created_at: new Date().toISOString(),
    participants_count: 4,
    user_joined: true,
    user_rank: 1,
    user_xp: 280,
  },
  {
    id: "chal-3",
    creator_id: "demo-friend-2",
    title: "Zero Junk Food Sprint",
    description: "Eat clean, cut processed sugar and fast food for 21 days straight.",
    habit_title: "Clean Eating",
    habit_type: "boolean",
    target_value: 1,
    unit: "day",
    duration_days: 21,
    start_date: formatDate(new Date(Date.now() + 2 * 86400000)),
    end_date: formatDate(new Date(Date.now() + 23 * 86400000)),
    xp_reward: 250,
    rules: "Honesty policy. One strike per week maximum.",
    status: "upcoming",
    created_at: new Date().toISOString(),
    participants_count: 3,
    user_joined: false,
    user_rank: 0,
    user_xp: 0,
  },
];

const DEFAULT_FRIENDS: Profile[] = [
  {
    id: "friend-1",
    username: "rahul_fit",
    full_name: "Rahul Sharma",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    total_xp: 1420,
    level: 5,
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
    total_xp: 1240,
    level: 4,
    current_streak: 12,
    best_streak: 18,
    habits_completed_count: 88,
    challenges_won_count: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "friend-3",
    username: "aman_verma",
    full_name: "Aman Verma",
    avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    total_xp: 1080,
    level: 4,
    current_streak: 9,
    best_streak: 14,
    habits_completed_count: 72,
    challenges_won_count: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "friend-4",
    username: "sarah_zen",
    full_name: "Sarah Miller",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    total_xp: 940,
    level: 3,
    current_streak: 7,
    best_streak: 11,
    habits_completed_count: 60,
    challenges_won_count: 1,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_habit",
    title: "First Step",
    description: "Created your very first habit",
    icon: "Sparkles",
    xp_reward: 25,
    tier: "bronze",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: "first_completion",
    title: "Streak Ignition",
    description: "Completed your first daily habit",
    icon: "Flame",
    xp_reward: 30,
    tier: "bronze",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: "streak_3",
    title: "On A Roll",
    description: "Maintained a 3-day habit streak",
    icon: "Zap",
    xp_reward: 50,
    tier: "bronze",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintained a 7-day habit streak",
    icon: "Award",
    xp_reward: 100,
    tier: "silver",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "streak_30",
    title: "Habit Master",
    description: "Complete a 30-day streak",
    icon: "Crown",
    xp_reward: 300,
    tier: "gold",
    unlocked: false,
  },
  {
    id: "challenge_join",
    title: "Challenger",
    description: "Joined your first friend challenge",
    icon: "Users",
    xp_reward: 50,
    tier: "bronze",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "challenge_win",
    title: "Champion",
    description: "Won 1st place in a friend challenge",
    icon: "Trophy",
    xp_reward: 250,
    tier: "gold",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "level_5",
    title: "High Climber",
    description: "Reach Level 5 in DO STREAKLY",
    icon: "ShieldCheck",
    xp_reward: 100,
    tier: "silver",
    unlocked: false,
  },
  {
    id: "xp_1000",
    title: "XP Legend",
    description: "Accumulated 1,000 Total XP",
    icon: "Target",
    xp_reward: 150,
    tier: "silver",
    unlocked: true,
    unlocked_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export class StreaklyService {
  private static STORAGE_KEY_PREFIX = "dostreakly_";

  private static getStored<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  // --- Profile ---
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
          return data;
        }

        // If user is authenticated but profile row not yet created
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
      console.warn("Falling back to local profile update", e);
    }

    const current = await this.getProfile();
    const updated = { ...current, ...updates };
    this.setStored("profile", updated);
    return updated;
  }

  // --- Habits ---
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
          // Fetch completions for today
          const { data: completions } = await supabase
            .from("habit_completions")
            .select("*")
            .eq("user_id", user.id)
            .eq("completed_date", today);

          const completionsMap = new Map(
            completions?.map((c) => [c.habit_id, c]) || []
          );

          return habits.map((h) => {
            const comp = completionsMap.get(h.id);
            const isCompleted = h.habit_type === "boolean"
              ? !!comp
              : (comp?.progress_value || 0) >= h.target_value;

            return {
              ...h,
              is_completed_today: isCompleted,
              today_progress: comp ? comp.progress_value : 0,
              today_completion_id: comp?.id,
              current_streak: h.current_streak || 1,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Falling back to local habits:", e);
    }

    return this.getStored("habits", DEFAULT_HABITS);
  }

  static async createHabit(habitData: {
    title: string;
    description?: string;
    icon: string;
    habit_type: "boolean" | "measurable";
    target_value: number;
    unit: string;
    frequency: "daily" | "weekdays" | "weekends" | "custom";
    xp_value: number;
  }): Promise<Habit> {
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("habits")
          .insert({
            ...habitData,
            user_id: user.id,
          })
          .select()
          .single();

        if (data && !error) {
          return {
            ...data,
            is_completed_today: false,
            today_progress: 0,
            current_streak: 0,
          };
        }
      }
    } catch (e) {
      console.warn("Falling back to local habit creation", e);
    }

    const currentHabits = await this.getHabits();
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      user_id: "demo-user",
      ...habitData,
      is_archived: false,
      is_paused: false,
      created_at: new Date().toISOString(),
      is_completed_today: false,
      today_progress: 0,
      current_streak: 0,
    };

    const updated = [...currentHabits, newHabit];
    this.setStored("habits", updated);
    return newHabit;
  }

  static async completeHabit(
    habitId: string,
    progressIncrement?: number
  ): Promise<{
    habit: Habit;
    xpEarned: number;
    streakIncreased: boolean;
    newTotalXp: number;
    newLevel: number;
  }> {
    const habits = await this.getHabits();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) throw new Error("Habit not found");

    const today = formatDate(new Date());
    let xpEarned = 0;
    let isNowCompleted = false;
    let currentProgress = habit.today_progress || 0;

    if (habit.habit_type === "boolean") {
      if (habit.is_completed_today) {
        // Already completed today, prevent duplicate XP claim!
        return {
          habit,
          xpEarned: 0,
          streakIncreased: false,
          newTotalXp: (await this.getProfile()).total_xp,
          newLevel: (await this.getProfile()).level,
        };
      }
      isNowCompleted = true;
      currentProgress = 1;
      xpEarned = habit.xp_value;
    } else {
      // Measurable habit
      const addValue = progressIncrement !== undefined ? progressIncrement : habit.target_value;
      currentProgress = Math.min(habit.target_value, currentProgress + addValue);
      if (currentProgress >= habit.target_value && !habit.is_completed_today) {
        isNowCompleted = true;
        xpEarned = habit.xp_value;
      }
    }

    // Try Supabase insert completion & XP transaction
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isNowCompleted && xpEarned > 0) {
        await supabase.from("habit_completions").upsert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: today,
          progress_value: currentProgress,
          xp_earned: xpEarned,
        }, { onConflict: "habit_id, completed_date" });

        await supabase.from("xp_transactions").insert({
          user_id: user.id,
          amount: xpEarned,
          source_type: "habit",
          source_id: habitId,
          description: `Completed "${habit.title}"`,
        });
      }
    } catch (e) {
      console.warn("Supabase record failed, using local storage state:", e);
    }

    // Update Profile XP & Streak
    const profile = await this.getProfile();
    const newTotalXp = profile.total_xp + xpEarned;
    const { level: newLevel } = calculateLevel(newTotalXp);
    const streakIncreased = isNowCompleted && !habit.is_completed_today;
    const newHabitStreak = streakIncreased ? (habit.current_streak || 0) + 1 : (habit.current_streak || 1);

    const updatedProfile: Profile = {
      ...profile,
      total_xp: newTotalXp,
      level: newLevel,
      current_streak: streakIncreased ? profile.current_streak + 1 : profile.current_streak,
      best_streak: Math.max(profile.best_streak, streakIncreased ? profile.current_streak + 1 : profile.current_streak),
      habits_completed_count: isNowCompleted ? profile.habits_completed_count + 1 : profile.habits_completed_count,
    };
    await this.updateProfile(updatedProfile);

    // Update local habit state
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          is_completed_today: isNowCompleted || h.is_completed_today,
          today_progress: currentProgress,
          current_streak: newHabitStreak,
        };
      }
      return h;
    });
    this.setStored("habits", updatedHabits);

    return {
      habit: updatedHabits.find((h) => h.id === habitId)!,
      xpEarned,
      streakIncreased,
      newTotalXp,
      newLevel,
    };
  }

  // --- Challenges (Main USP) ---
  static async getChallenges(): Promise<Challenge[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Falling back to local challenges", e);
    }

    return this.getStored("challenges", DEFAULT_CHALLENGES);
  }

  static async getChallengeById(id: string): Promise<Challenge | null> {
    const challenges = await this.getChallenges();
    return challenges.find((c) => c.id === id) || null;
  }

  static async createChallenge(data: {
    title: string;
    description: string;
    habit_title: string;
    habit_type: "boolean" | "measurable";
    target_value: number;
    unit: string;
    duration_days: number;
    xp_reward: number;
    rules?: string;
  }): Promise<Challenge> {
    const profile = await this.getProfile();
    const startDate = formatDate(new Date());
    const endDate = formatDate(new Date(Date.now() + data.duration_days * 86400000));

    const newChallenge: Challenge = {
      id: `chal-${Date.now()}`,
      creator_id: profile.id,
      ...data,
      start_date: startDate,
      end_date: endDate,
      status: "active",
      created_at: new Date().toISOString(),
      participants_count: 1,
      user_joined: true,
      user_rank: 1,
      user_xp: 0,
    };

    const supabase = createClient();
    try {
      const { data: created, error } = await supabase
        .from("challenges")
        .insert({
          creator_id: profile.id,
          title: data.title,
          description: data.description,
          habit_title: data.habit_title,
          habit_type: data.habit_type,
          target_value: data.target_value,
          unit: data.unit,
          duration_days: data.duration_days,
          start_date: startDate,
          end_date: endDate,
          xp_reward: data.xp_reward,
          rules: data.rules,
        })
        .select()
        .single();

      if (created && !error) {
        return created;
      }
    } catch (e) {
      console.warn("Local challenge create fallback:", e);
    }

    const current = await this.getChallenges();
    const updated = [newChallenge, ...current];
    this.setStored("challenges", updated);
    return newChallenge;
  }

  static async joinChallenge(challengeId: string): Promise<boolean> {
    const challenges = await this.getChallenges();
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          user_joined: true,
          participants_count: (c.participants_count || 0) + 1,
          user_rank: (c.participants_count || 0) + 1,
        };
      }
      return c;
    });
    this.setStored("challenges", updated);
    return true;
  }

  static async getChallengeLeaderboard(challengeId: string): Promise<Array<{
    rank: number;
    profile: Profile;
    xp: number;
    progress: number;
    isCurrentUser: boolean;
  }>> {
    const userProfile = await this.getProfile();
    const friends = await this.getFriends();

    // Challenge participants mock list
    return [
      {
        rank: 1,
        profile: friends[0], // Rahul
        xp: 680,
        progress: 88,
        isCurrentUser: false,
      },
      {
        rank: 2,
        profile: userProfile, // Current user
        xp: 590,
        progress: 82,
        isCurrentUser: true,
      },
      {
        rank: 3,
        profile: friends[1], // Prakhar
        xp: 510,
        progress: 74,
        isCurrentUser: false,
      },
      {
        rank: 4,
        profile: friends[2], // Aman
        xp: 420,
        progress: 65,
        isCurrentUser: false,
      },
    ];
  }

  // --- Friends ---
  static async getFriends(): Promise<Profile[]> {
    return this.getStored("friends", DEFAULT_FRIENDS);
  }

  static async addFriend(usernameOrEmail: string): Promise<Profile> {
    const newFriend: Profile = {
      id: `friend-${Date.now()}`,
      username: usernameOrEmail.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      full_name: usernameOrEmail.split("@")[0],
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      total_xp: 350,
      level: 2,
      current_streak: 3,
      best_streak: 5,
      habits_completed_count: 15,
      challenges_won_count: 0,
      created_at: new Date().toISOString(),
    };

    const current = await this.getFriends();
    const updated = [newFriend, ...current];
    this.setStored("friends", updated);
    return newFriend;
  }

  // --- Leaderboards (Global & Friends) ---
  static async getGlobalLeaderboard(): Promise<Array<{
    rank: number;
    profile: Profile;
    isCurrentUser: boolean;
  }>> {
    const user = await this.getProfile();
    const friends = await this.getFriends();

    const allUsers = [
      user,
      ...friends,
      {
        id: "global-1",
        username: "viktor_grind",
        full_name: "Viktor Petrov",
        avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        total_xp: 2840,
        level: 8,
        current_streak: 42,
        best_streak: 60,
        habits_completed_count: 240,
        challenges_won_count: 7,
        created_at: new Date().toISOString(),
      },
      {
        id: "global-2",
        username: "elena_core",
        full_name: "Elena Rostova",
        avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        total_xp: 2410,
        level: 7,
        current_streak: 34,
        best_streak: 45,
        habits_completed_count: 195,
        challenges_won_count: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: "global-3",
        username: "marcus_stride",
        full_name: "Marcus Thorne",
        avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        total_xp: 1950,
        level: 6,
        current_streak: 28,
        best_streak: 30,
        habits_completed_count: 160,
        challenges_won_count: 4,
        created_at: new Date().toISOString(),
      },
    ];

    allUsers.sort((a, b) => b.total_xp - a.total_xp);

    return allUsers.map((u, index) => ({
      rank: index + 1,
      profile: u,
      isCurrentUser: u.id === user.id,
    }));
  }

  // --- Achievements ---
  static async getAchievements(): Promise<Achievement[]> {
    return this.getStored("achievements", DEFAULT_ACHIEVEMENTS);
  }
}
