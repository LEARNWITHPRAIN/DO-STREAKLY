'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Habit, Challenge, ChallengeHabit } from '@/types';

function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return 'Joined recently';
  const d = new Date(dateStr);
  return `Joined ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [personalHabits, setPersonalHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeHabits, setChallengeHabits] = useState<ChallengeHabit[]>([]);
  
  const [activeTab, setActiveTab] = useState<'personal' | 'challenges'>('personal');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. Fetch Profile, Habits & Challenges
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (prof) {
      setProfile(prof);
      setReminderEnabled(prof.reminder_enabled ?? false);
      setEditName(prof.full_name || '');
      setEditUsername(prof.username || '');
    }

    // Personal Habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at');

    if (habits) {
      // Hydrate with streaks
      const hydrated = await Promise.all(
        habits.map(async (h) => {
          const { data: strk } = await supabase.rpc('current_streak', {
            p_habit_id: h.id,
            p_user_id: user.id,
          });
          return {
            ...h,
            current_streak: (strk as number) ?? 0,
          };
        })
      );
      setPersonalHabits(hydrated);
    }

    // Challenges
    const { data: memberRows } = await supabase
      .from('challenge_members')
      .select('challenge_id')
      .eq('user_id', user.id);

    const memberOf = (memberRows ?? []).map((r) => r.challenge_id);

    const { data: chalList } = await supabase
      .from('challenges')
      .select('*')
      .or(`owner_id.eq.${user.id}${memberOf.length > 0 ? `,id.in.(${memberOf.join(',')})` : ''}`)
      .order('created_at', { ascending: false });

    if (chalList && chalList.length > 0) {
      setChallenges(chalList);
      setSelectedChallenge(chalList[0]);
    }

    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Fetch challenge habits when selectedChallenge changes
  useEffect(() => {
    if (!selectedChallenge) return;
    const fetchCHabits = async () => {
      const { data } = await supabase
        .from('challenge_habits')
        .select('*')
        .eq('challenge_id', selectedChallenge.id);

      setChallengeHabits(data ?? []);
    };
    fetchCHabits();
  }, [supabase, selectedChallenge]);

  // Toggle Reminder
  const toggleReminder = async () => {
    if (!profile) return;
    const nextVal = !reminderEnabled;
    setReminderEnabled(nextVal);
    setReminderLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ reminder_enabled: nextVal })
      .eq('id', profile.id);

    setReminderLoading(false);
    if (!error) {
      showToast(nextVal ? 'Daily reminder activated' : 'Reminder turned off');
    } else {
      setReminderEnabled(!nextVal);
      showToast('Failed to update preference');
    }
  };

  // Save Profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName.trim(),
        username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      })
      .eq('id', profile.id);

    setSavingProfile(false);
    if (!error) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: editName.trim(),
              username: editUsername.trim().toLowerCase(),
            }
          : null
      );
      setIsEditing(false);
      showToast('Profile updated!');
    } else {
      showToast(error.message || 'Error updating profile');
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Metrics
  const fixedHabits = personalHabits.filter((h) => h.type === 'fixed');
  const variableHabits = personalHabits.filter((h) => h.type === 'variable');
  
  // Calculate completion percentage: completed today habits / total habits
  const completedCount = personalHabits.filter((h) => (h.current_streak ?? 0) > 0).length;
  const completionRate = personalHabits.length > 0
    ? Math.round((completedCount / personalHabits.length) * 100)
    : 100;

  // Timezone helper
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = -new Date().getTimezoneOffset() / 60;
  const timezoneOffsetStr = `UTC ${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary-fixed text-on-primary font-body-bold px-4 py-2 rounded-full text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/80 backdrop-blur-xl border-b border-surface-container-high shadow-sm">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm max-w-[460px] mx-auto">
          <div className="flex items-center gap-space-sm">
            <span className="flex items-center justify-center">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-outline-variant/60 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="DO STREAKLY Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </span>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none">
                DO STREAKLY
              </span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Profile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
              <span className="text-sm leading-none">🔥</span>
              <span className="font-body-bold text-body-bold text-primary-fixed">
                {profile?.current_streak ?? 0}d
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary-fixed font-body-bold text-xs select-none">
              {getInitials(profile?.full_name || profile?.username || 'U')}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Scrollable Area ──────────────────────────────────── */}
      <main className="flex-1 w-full bg-surface pt-20 pb-28 px-gutter">
        <div className="flex flex-col w-full max-w-[460px] mx-auto gap-space-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Loading profile...
              </p>
            </div>
          ) : (
            <>
              {/* 1. User Identity Card */}
              <div className="flex flex-col bg-surface-container rounded-xl p-space-md shadow-md gap-space-md border border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0 shadow-inner">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.full_name || 'Avatar'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-surface-container-highest border border-outline-variant/60 flex items-center justify-center text-primary-fixed font-headline-md text-base select-none">
                          {getInitials(profile?.full_name || profile?.username || 'U')}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-md text-headline-md text-on-surface truncate">
                          {profile?.full_name || 'Streaker'}
                        </span>
                        <span
                          className="material-symbols-outlined text-[18px] text-primary-fixed"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface-variant truncate">
                        @{profile?.username || 'user'}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline mt-0.5">
                        {formatJoinedDate(profile?.created_at)}
                      </span>
                    </div>
                  </div>

                  <button
                    aria-label="Edit Profile"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>

                {/* Active High-Tension Streak Pill */}
                <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2.5 rounded-lg border border-surface-container-highest">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">🔥</span>
                    <span className="font-body-bold text-body-bold text-on-surface">
                      {profile?.current_streak ?? 0} Day Streak
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider bg-surface-container-high px-2 py-0.5 rounded-full font-bold">
                    Best: {profile?.best_streak ?? profile?.current_streak ?? 0}d
                  </span>
                </div>
              </div>

              {/* 2. 3-Metric Stats Row */}
              <div className="grid grid-cols-3 gap-space-xs">
                <div className="flex flex-col items-center justify-center bg-surface-container rounded-xl py-3.5 px-2 text-center shadow-sm border border-outline-variant/30">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-fixed leading-none">
                    {profile?.current_streak ?? 0}
                    <span className="text-xs ml-0.5 font-label-caps text-on-surface-variant uppercase">d</span>
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1.5">
                    Streak
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center bg-surface-container rounded-xl py-3.5 px-2 text-center shadow-sm border border-outline-variant/30">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-none">
                    {completionRate}
                    <span className="text-xs ml-0.5 font-label-caps text-primary-fixed">%</span>
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1.5">
                    Consistency
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center bg-surface-container rounded-xl py-3.5 px-2 text-center shadow-sm border border-outline-variant/30">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-none">
                    {personalHabits.length}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1.5">
                    Active Habits
                  </span>
                </div>
              </div>

              {/* 3. Habit Breakdown Summary Section */}
              <div className="flex flex-col gap-space-sm" id="commitments-section">
                {/* Segmented Control Toggle */}
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/60">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex-1 py-2 text-center rounded-lg font-body-bold text-body-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'personal'
                        ? 'bg-primary-fixed text-on-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>Personal Habits</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('challenges')}
                    className={`flex-1 py-2 text-center rounded-lg font-body-bold text-body-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'challenges'
                        ? 'bg-primary-fixed text-on-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    <span>Challenges</span>
                  </button>
                </div>

                {/* VIEW A: Personal Habits View */}
                {activeTab === 'personal' && (
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                        Personal Commitments
                      </span>
                      <span className="font-label-sm text-label-sm text-primary-fixed font-medium">
                        {personalHabits.length} active
                      </span>
                    </div>

                    <div className="flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/40">
                      {/* Fixed Rituals Header */}
                      <div className="flex items-center justify-between px-space-md pt-3.5 pb-1 bg-surface-container-high/30">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary-fixed">lock</span>
                          <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">
                            Fixed Rituals
                          </span>
                        </div>
                        <span className="font-label-caps text-label-caps text-outline">
                          {fixedHabits.length} Active
                        </span>
                      </div>

                      {fixedHabits.length === 0 ? (
                        <div className="px-space-md py-3 text-xs text-on-surface-variant italic">
                          No fixed habits enrolled yet.
                        </div>
                      ) : (
                        fixedHabits.map((h, i) => (
                          <div
                            key={h.id}
                            className={`flex items-center justify-between px-space-md py-3 hover:bg-surface-container-high/40 transition-colors ${
                              i < fixedHabits.length - 1 ? 'border-b border-surface-container-highest/60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-space-sm min-w-0">
                              <span className="w-2 h-2 rounded-full bg-primary-fixed flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-body-bold text-body-bold text-on-surface truncate">
                                  {h.name}
                                </span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  {h.schedule === 'daily' ? 'Daily Pass' : h.schedule} • Non-negotiable
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 bg-surface-container-high px-2.5 py-1 rounded-full">
                              <span className="text-xs leading-none">🔥</span>
                              <span className="font-body-bold text-body-bold text-primary-fixed text-xs">
                                {h.current_streak ?? 0}d streak
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="h-px bg-surface-container-highest mx-space-md my-1" />

                      {/* Variable Habits Header */}
                      <div className="flex items-center justify-between px-space-md pt-2 pb-1 bg-surface-container-high/30">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">tune</span>
                          <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">
                            Variable Habits
                          </span>
                        </div>
                        <span className="font-label-caps text-label-caps text-outline">
                          {variableHabits.length} Active
                        </span>
                      </div>

                      {variableHabits.length === 0 ? (
                        <div className="px-space-md py-3 text-xs text-on-surface-variant italic">
                          No variable habits enrolled yet.
                        </div>
                      ) : (
                        variableHabits.map((h, i) => (
                          <div
                            key={h.id}
                            className={`flex items-center justify-between px-space-md py-3 hover:bg-surface-container-high/40 transition-colors ${
                              i < variableHabits.length - 1 ? 'border-b border-surface-container-highest/60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-space-sm min-w-0">
                              <span className="w-2 h-2 rounded-full bg-tertiary-fixed flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-body-bold text-body-bold text-on-surface truncate">
                                  {h.name}
                                </span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  Target: {h.goal} {h.unit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 bg-surface-container-high px-2.5 py-1 rounded-full">
                              <span className="text-xs leading-none">🔥</span>
                              <span className="font-body-bold text-body-bold text-tertiary-fixed text-xs">
                                {h.current_streak ?? 0}d streak
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* VIEW B: Challenges View */}
                {activeTab === 'challenges' && (
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                        Active Challenges
                      </span>
                      <span className="font-label-sm text-label-sm text-primary-fixed font-medium">
                        {challenges.length} Enrolled
                      </span>
                    </div>

                    {challenges.length === 0 ? (
                      <div className="p-6 text-center bg-surface-container rounded-xl border border-outline-variant/30 text-on-surface-variant text-sm">
                        No challenges enrolled. Join a challenge from the Challenges tab!
                      </div>
                    ) : (
                      <div className="flex flex-col bg-surface-container rounded-xl p-space-md gap-space-md shadow-sm border border-outline-variant/40">
                        {/* Challenge Selector */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                            Select Challenge
                          </label>
                          <div className="relative">
                            <select
                              value={selectedChallenge?.id}
                              onChange={(e) => {
                                const found = challenges.find((c) => c.id === e.target.value);
                                if (found) setSelectedChallenge(found);
                              }}
                              className="w-full appearance-none bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-bold text-body-bold text-on-surface focus:outline-none focus:border-primary-fixed cursor-pointer pr-10"
                            >
                              {challenges.map((c) => (
                                <option key={c.id} value={c.id} className="bg-surface-container text-on-surface">
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[20px]">
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Challenge Status Pill */}
                        {selectedChallenge && (
                          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-2 border border-surface-container-highest">
                            <div className="flex items-center justify-between">
                              <span className="font-body-bold text-body-bold text-on-surface flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary-fixed text-[18px]">verified</span>
                                <span>{selectedChallenge.name}</span>
                              </span>
                              <span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded-full bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 font-bold">
                                {selectedChallenge.duration_days} Days Total
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                              <div className="bg-primary-fixed h-full rounded-full" style={{ width: '65%' }} />
                            </div>
                            <div className="flex justify-between items-center text-xs font-label-sm text-on-surface-variant mt-0.5">
                              <span>Code: <strong className="text-primary-fixed">{selectedChallenge.invite_code}</strong></span>
                              <span>{challengeHabits.length} Habits Enrolled</span>
                            </div>
                          </div>
                        )}

                        {/* Detailed Challenge Habits */}
                        <div className="flex flex-col gap-2.5">
                          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                            Challenge Habit Streaks &amp; Targets
                          </span>
                          {challengeHabits.length === 0 ? (
                            <div className="text-xs text-on-surface-variant italic py-2">
                              No habits assigned to this challenge.
                            </div>
                          ) : (
                            challengeHabits.map((ch) => (
                              <div
                                key={ch.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/40 border border-surface-container-highest hover:bg-surface-container-high/60 transition-colors"
                              >
                                <div className="flex flex-col min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-body-bold text-body-bold text-on-surface truncate">
                                      {ch.name}
                                    </span>
                                    <span
                                      className={`font-label-caps text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                                        ch.type === 'fixed'
                                          ? 'bg-primary-fixed/20 text-primary-fixed'
                                          : 'bg-tertiary-fixed/20 text-tertiary-fixed'
                                      }`}
                                    >
                                      {ch.type}
                                    </span>
                                  </div>
                                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">
                                    Target: {ch.type === 'fixed' ? 'Daily pass' : `${ch.goal} ${ch.unit}`} • +{ch.points} pts
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-xs">
                                  <span>🔥</span>
                                  <span className="font-body-bold text-primary-fixed text-xs">
                                    Active
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. App Preferences */}
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider px-1">
                  App Preferences
                </span>
                <div className="flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/40">
                  {/* Daily Reminder */}
                  <div className="flex items-center justify-between p-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-fixed">
                        <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-on-surface">Daily Reminder</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">8:00 PM evening prompt</span>
                      </div>
                    </div>
                    <button
                      aria-checked={reminderEnabled}
                      onClick={toggleReminder}
                      disabled={reminderLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        reminderEnabled ? 'bg-primary-fixed' : 'bg-surface-container-highest'
                      }`}
                      role="switch"
                      type="button"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                          reminderEnabled
                            ? 'translate-x-5 bg-on-primary'
                            : 'translate-x-0 bg-on-surface-variant'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-surface-container-highest mx-space-md" />

                  {/* Timezone */}
                  <div className="flex items-center justify-between p-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-bold text-body-bold text-on-surface">Timezone</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Auto: {timezoneName}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-caps text-label-caps text-primary-fixed bg-surface-container-high px-2 py-1 rounded">
                      {timezoneOffsetStr}
                    </span>
                  </div>

                  <div className="h-px bg-surface-container-highest mx-space-md" />

                  {/* Cloud Backup */}
                  <div className="flex items-center justify-between p-space-md">
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-bold text-body-bold text-on-surface truncate">Cloud Backup</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                          {profile?.email || 'Synced with Supabase'}
                        </span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 bg-surface-container-high text-primary-fixed font-body-bold text-xs px-2.5 py-1 rounded-lg">
                      Active ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Logout CTA & Footer */}
              <div className="flex flex-col pt-space-xs gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-surface-container text-error hover:bg-surface-container-high active:scale-[0.99] transition-all border border-error/20"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="font-body-bold text-body-bold">Log Out</span>
                </button>

                <div className="flex justify-center items-center gap-1.5 py-2">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Streakly v1.4.0</span>
                  <span className="w-1 h-1 rounded-full bg-outline" />
                  <span className="font-label-caps text-label-caps uppercase text-outline">Engine Stable</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface-container p-6 shadow-2xl border border-outline-variant/60">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4">
              Edit Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-fixed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-fixed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-primary-fixed text-on-primary hover:brightness-105 transition-all shadow-sm"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
