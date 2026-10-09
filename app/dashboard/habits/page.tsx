'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import HabitCard from '@/components/habits/HabitCard';
import CreateHabitModal from '@/components/habits/CreateHabitModal';
import type { Habit, CreateHabitInput } from '@/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export default function HabitsPage() {
  const supabase = createClient();
  const today = todayISO();

  const [habits,     setHabits]     = useState<Habit[]>([]);
  const [profile,    setProfile]    = useState<{ full_name: string; current_streak: number } | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Habit | null>(null);
  const [toast,      setToast]      = useState('');

  // Show toast helper
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const loadHabits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, current_streak')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);

    // Habits
    const { data: habitRows, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error || !habitRows) { setLoading(false); return; }

    // Today's logs
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, value, completed')
      .eq('user_id', user.id)
      .eq('date', today);

    const logMap = new Map(
      (logs ?? []).map((l) => [l.habit_id, { value: l.value, completed: l.completed }])
    );

    // Streaks (compute client-side from last 30 logs per habit for performance)
    const hydrated: Habit[] = await Promise.all(
      habitRows.map(async (h) => {
        const log = logMap.get(h.id);

        // Get streak from server function
        const { data: streakData } = await supabase.rpc('current_streak', {
          p_habit_id: h.id,
          p_user_id:  user.id,
        });

        return {
          ...h,
          today_value:      log?.value ?? 0,
          completed_today:  log?.completed ?? false,
          current_streak:   (streakData as number) ?? 0,
        };
      })
    );

    setHabits(hydrated);
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  // Upsert a log value
  async function upsertLog(habitId: string, value: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const habit = habits.find((h) => h.id === habitId)!;
    const completed = habit.type === 'fixed' ? value >= 1 : value >= habit.goal;

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, today_value: value, completed_today: completed }
          : h
      )
    );

    const { error } = await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: user.id, date: today, value, completed },
      { onConflict: 'habit_id,date' }
    );

    if (error) {
      showToast('Failed to save log');
      loadHabits(); // revert
    }
  }

  async function handleToggle(habitId: string, value: number) {
    await upsertLog(habitId, value);
  }

  async function handleIncrement(habitId: string, step: number) {
    const habit = habits.find((h) => h.id === habitId)!;
    const current = habit.today_value ?? 0;
    const next = Math.max(0, current + step);
    await upsertLog(habitId, next);
  }

  async function handleCreate(input: CreateHabitInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { error } = await supabase.from('habits').insert({
      user_id:  user.id,
      name:     input.name,
      icon:     input.icon,
      type:     input.type,
      unit:     input.unit ?? 'reps',
      goal:     input.goal ?? 1,
      schedule: input.schedule,
    });

    if (error) throw new Error(error.message);
    showToast('Habit created! 🎉');
    await loadHabits();
  }

  async function handleUpdate(input: CreateHabitInput) {
    if (!editTarget) return;
    const { error } = await supabase.from('habits').update({
      name:     input.name,
      icon:     input.icon,
      type:     input.type,
      unit:     input.unit,
      goal:     input.goal,
      schedule: input.schedule,
    }).eq('id', editTarget.id);

    if (error) throw new Error(error.message);
    setEditTarget(null);
    showToast('Habit updated');
    await loadHabits();
  }

  async function handleDelete(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: true })
      .eq('id', habitId);

    if (error) { showToast('Failed to delete'); return; }
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    showToast('Habit removed');
  }

  const completed = habits.filter((h) => h.completed_today).length;
  const total     = habits.length;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none">
                DO STREAKLY
              </span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Habits
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            {(profile?.current_streak ?? 0) > 0 && (
              <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
                <span className="text-sm leading-none">🔥</span>
                <span className="font-body-bold text-body-bold text-primary-fixed">
                  {profile?.current_streak}d
                </span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary-fixed font-body-bold text-xs">
              {getInitials(profile?.full_name ?? 'U')}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="flex-1 w-full bg-surface pt-16 pb-24 px-gutter">
        <div className="flex flex-col w-full max-w-[460px] mx-auto gap-space-lg pt-space-lg pb-10">

          {/* Progress summary */}
          {!loading && total > 0 && (
            <div className="flex flex-col bg-surface-container rounded-xl p-space-md gap-space-sm shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-body-bold text-body-bold text-on-surface">Today</span>
                <span className="font-label-sm text-label-sm text-primary-fixed font-medium">
                  {completed} / {total} done
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`,
                    background: '#b4f700',
                  }}
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && total === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-space-md">
              <span className="text-5xl">🌱</span>
              <div className="text-center">
                <p className="font-headline-md text-headline-md text-on-surface">No habits yet</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Start building your routine
                </p>
              </div>
            </div>
          )}

          {/* Fixed habits section */}
          {!loading && habits.some((h) => h.type === 'fixed') && (
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary-fixed">lock</span>
                  <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">Fixed Rituals</span>
                </div>
                <span className="font-label-caps text-label-caps text-outline">
                  {habits.filter((h) => h.type === 'fixed' && h.completed_today).length} /&nbsp;
                  {habits.filter((h) => h.type === 'fixed').length}
                </span>
              </div>
              {habits
                .filter((h) => h.type === 'fixed')
                .map((h) => (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    onToggle={handleToggle}
                    onIncrement={handleIncrement}
                    onEdit={(habit) => setEditTarget(habit)}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          )}

          {/* Variable habits section */}
          {!loading && habits.some((h) => h.type === 'variable') && (
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">tune</span>
                  <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">Variable Habits</span>
                </div>
                <span className="font-label-caps text-label-caps text-outline">
                  {habits.filter((h) => h.type === 'variable' && h.completed_today).length} /&nbsp;
                  {habits.filter((h) => h.type === 'variable').length}
                </span>
              </div>
              {habits
                .filter((h) => h.type === 'variable')
                .map((h) => (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    onToggle={handleToggle}
                    onIncrement={handleIncrement}
                    onEdit={(habit) => setEditTarget(habit)}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

      {/* ── FAB ────────────────────────────────────────────────────── */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary-fixed text-on-primary flex items-center justify-center shadow-lg hover:brightness-105 active:scale-90 transition-all"
        aria-label="Add habit"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {modalOpen && (
        <CreateHabitModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
      {editTarget && (
        <CreateHabitModal
          initial={{ ...editTarget, id: editTarget.id }}
          onClose={() => setEditTarget(null)}
          onCreate={handleUpdate}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-surface-container-high border border-outline-variant px-4 py-2 rounded-full shadow-lg">
          <span className="font-body-md text-body-md text-on-surface">{toast}</span>
        </div>
      )}
    </>
  );
}
