'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import CreateChallengeModal from '@/components/challenges/CreateChallengeModal';
import type { Challenge, ChallengeHabit, ChallengeLog, CreateChallengeInput } from '@/types';

function todayISO() { return new Date().toISOString().split('T')[0]; }
function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function ChallengesPage() {
  const supabase = createClient();
  const today = todayISO();

  const [challenges,   setChallenges]   = useState<Challenge[]>([]);
  const [selected,     setSelected]     = useState<Challenge | null>(null);
  const [habits,       setHabits]       = useState<ChallengeHabit[]>([]);
  const [logs,         setLogs]         = useState<ChallengeLog[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [creating,     setCreating]     = useState(false);
  const [joinCode,     setJoinCode]     = useState('');
  const [joinLoading,  setJoinLoading]  = useState(false);
  const [toast,        setToast]        = useState('');
  const [copied,       setCopied]       = useState(false);
  const [userId,       setUserId]       = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // All challenges the user is part of (owner or member)
    const { data: memberRows } = await supabase
      .from('challenge_members')
      .select('challenge_id')
      .eq('user_id', user.id);

    const memberOf = (memberRows ?? []).map((r) => r.challenge_id);

    const { data: challengeRows } = await supabase
      .from('challenges')
      .select('*')
      .or(`owner_id.eq.${user.id}${memberOf.length > 0 ? `,id.in.(${memberOf.join(',')})` : ''}`)
      .order('created_at', { ascending: false });

    const chalList: Challenge[] = (challengeRows ?? []).map((c) => {
      const elapsed = daysBetween(c.start_date, today);
      return {
        ...c,
        days_elapsed:   Math.max(0, Math.min(elapsed, c.duration_days)),
        days_remaining: Math.max(0, c.duration_days - elapsed),
        is_owner:       c.owner_id === user.id,
      };
    });

    setChallenges(chalList);
    if (!selected && chalList.length > 0) setSelected(chalList[0]);
    setLoading(false);
  }, [supabase, today, selected]);

  // Load habits + today logs for selected challenge
  const loadSelected = useCallback(async () => {
    if (!selected || !userId) return;

    const { data: habitRows } = await supabase
      .from('challenge_habits')
      .select('*')
      .eq('challenge_id', selected.id)
      .order('created_at');

    const { data: logRows } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('challenge_id', selected.id)
      .eq('user_id', userId)
      .eq('date', today);

    const logMap = new Map((logRows ?? []).map((l) => [l.challenge_habit_id, l]));

    const hydrated: ChallengeHabit[] = (habitRows ?? []).map((h) => {
      const log = logMap.get(h.id);
      return {
        ...h,
        today_value:     log?.value ?? 0,
        completed_today: log?.completed ?? false,
      };
    });

    setHabits(hydrated);
    setLogs(logRows ?? []);
  }, [supabase, selected, userId, today]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadSelected(); }, [loadSelected]);

  async function handleLogHabit(habitId: string, value: number) {
    if (!selected) return;
    const { error } = await supabase.rpc('log_challenge_habit', {
      p_challenge_id: selected.id,
      p_habit_id:     habitId,
      p_date:         today,
      p_value:        value,
    });
    if (error) { showToast('Failed to log'); return; }
    await loadSelected();
  }

  async function handleCreate(input: CreateChallengeInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    // 1. Create challenge
    const { data: chal, error: chalErr } = await supabase.from('challenges').insert({
      owner_id:      user.id,
      name:          input.name,
      description:   input.description,
      duration_days: input.duration_days,
      start_date:    input.start_date,
    }).select().single();
    if (chalErr || !chal) throw new Error(chalErr?.message ?? 'Failed to create challenge');

    // 2. Insert habits
    const habitInserts = input.habits.map((h) => ({
      challenge_id: chal.id,
      name:         h.name,
      icon:         h.icon,
      type:         h.type,
      unit:         h.unit ?? 'reps',
      goal:         h.goal ?? 1,
      points:       h.points,
    }));
    const { error: habErr } = await supabase.from('challenge_habits').insert(habitInserts);
    if (habErr) throw new Error(habErr.message);

    // 3. Auto-join owner
    await supabase.from('challenge_members').insert({
      challenge_id: chal.id,
      user_id:      user.id,
    });

    showToast('Challenge created! 🎉');
    await loadData();
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      const { data: chalId, error } = await supabase.rpc('join_challenge', { p_code: joinCode.trim() });
      if (error) { showToast('Invalid code'); return; }
      showToast('Joined challenge! 🚀');
      setJoinCode('');
      await loadData();
      // Select the newly joined challenge
      const joined = challenges.find((c) => c.id === chalId);
      if (joined) setSelected(joined);
    } finally {
      setJoinLoading(false);
    }
  }

  function copyInvite() {
    if (!selected) return;
    const link = `${window.location.origin}/join/${selected.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalCompleted = habits.filter((h) => h.completed_today).length;
  const pct = habits.length > 0 ? Math.round((totalCompleted / habits.length) * 100) : 0;

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none">DO STREAKLY</span>
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Challenges</span>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 bg-primary-fixed text-on-primary px-3 py-1.5 rounded-full font-body-bold text-body-bold hover:brightness-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full bg-surface pt-16 pb-24 px-gutter">
        <div className="flex flex-col w-full max-w-[460px] mx-auto gap-space-lg pt-space-lg pb-10">

          {/* Join via code */}
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="flex-1 bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed uppercase tracking-widest"
              maxLength={8}
            />
            <button
              onClick={handleJoin}
              disabled={joinLoading || !joinCode.trim()}
              className="px-4 py-2.5 rounded-lg bg-primary-fixed text-on-primary font-body-bold text-body-bold hover:brightness-105 disabled:opacity-60 transition-all"
            >
              {joinLoading ? '…' : 'Join'}
            </button>
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />)}
            </div>
          )}

          {!loading && challenges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-space-md">
              <span className="text-5xl">⚡</span>
              <div className="text-center">
                <p className="font-headline-md text-headline-md text-on-surface">No challenges yet</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Create one or join with a code</p>
              </div>
            </div>
          )}

          {!loading && challenges.length > 0 && (
            <>
              {/* Challenge selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Active Challenge</label>
                <div className="relative">
                  <select
                    value={selected?.id ?? ''}
                    onChange={(e) => {
                      const c = challenges.find((ch) => ch.id === e.target.value);
                      if (c) setSelected(c);
                    }}
                    className="w-full appearance-none bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-bold text-body-bold text-on-surface focus:outline-none focus:border-primary-fixed cursor-pointer pr-10"
                  >
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>

              {selected && (
                <>
                  {/* Challenge info card */}
                  <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm border border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary-fixed text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span className="font-body-bold text-body-bold text-on-surface">{selected.name}</span>
                      </div>
                      <span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded-full bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 font-bold">
                        {pct}% Today
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 bg-primary-fixed" style={{ width: `${(selected.days_elapsed! / selected.duration_days) * 100}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-xs font-label-sm text-on-surface-variant">
                      <span>Day <strong className="text-primary-fixed">{selected.days_elapsed}</strong> of {selected.duration_days}</span>
                      <span>{habits.length} habits enrolled</span>
                    </div>

                    {/* Invite */}
                    <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest flex-1">
                        Code: <strong className="text-primary-fixed">{selected.invite_code}</strong>
                      </span>
                      <button
                        onClick={copyInvite}
                        className="flex items-center gap-1 text-primary-fixed font-body-bold text-body-bold"
                      >
                        <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  {/* Today's habits */}
                  <div className="flex flex-col gap-space-sm">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider px-1">
                      Log Today's Habits
                    </span>

                    {habits.length === 0 && (
                      <p className="font-body-md text-body-md text-on-surface-variant text-center py-4">No habits in this challenge</p>
                    )}

                    {habits.map((h) => {
                      const done  = h.completed_today ?? false;
                      const val   = h.today_value ?? 0;
                      const pctH  = h.type === 'fixed' ? (done ? 100 : 0) : Math.min(100, Math.round((val / h.goal) * 100));

                      return (
                        <div
                          key={h.id}
                          className={`flex flex-col bg-surface-container rounded-xl p-space-md gap-2 shadow-sm border transition-all ${
                            done ? 'border-primary-fixed/40' : 'border-outline-variant/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm min-w-0">
                              <span className="text-xl">{h.icon}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-body-bold text-body-bold text-on-surface truncate">{h.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-label-caps text-[10px] uppercase px-1.5 py-0.5 rounded ${
                                    h.type === 'fixed'
                                      ? 'bg-primary-fixed/20 text-primary-fixed'
                                      : 'bg-tertiary-fixed/20 text-tertiary-fixed'
                                  }`}>
                                    {h.type}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    {h.type === 'variable' ? `${val}/${h.goal} ${h.unit}` : 'Daily pass'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 bg-surface-container-high px-2 py-0.5 rounded text-xs">
                              <span>⚡</span>
                              <span className="font-body-bold text-primary-fixed text-xs">+{h.points}pts</span>
                            </div>
                          </div>

                          {/* Controls */}
                          {h.type === 'fixed' ? (
                            <button
                              onClick={() => handleLogHabit(h.id, done ? 0 : 1)}
                              className={`w-full py-2 rounded-lg font-body-bold text-body-bold transition-all active:scale-[0.99] ${
                                done
                                  ? 'bg-primary-fixed text-on-primary'
                                  : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                              }`}
                            >
                              {done ? '✅ Done' : 'Mark Done'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLogHabit(h.id, Math.max(0, val - 1))}
                                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-all">
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-primary-fixed transition-all" style={{ width: `${pctH}%` }} />
                                </div>
                                <span className="font-label-caps text-label-caps text-on-surface-variant text-center uppercase">{pctH}%</span>
                              </div>
                              <button onClick={() => handleLogHabit(h.id, val + 1)}
                                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-all">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                              <button
                                onClick={() => handleLogHabit(h.id, done ? 0 : h.goal)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                  done ? 'bg-primary-fixed text-on-primary' : 'bg-surface-container-high border border-outline-variant text-on-surface-variant'
                                }`}>
                                <span className="material-symbols-outlined text-[18px]" style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}>check</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {creating && (
        <CreateChallengeModal
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-surface-container-high border border-outline-variant px-4 py-2 rounded-full shadow-lg">
          <span className="font-body-md text-body-md text-on-surface">{toast}</span>
        </div>
      )}
    </>
  );
}
