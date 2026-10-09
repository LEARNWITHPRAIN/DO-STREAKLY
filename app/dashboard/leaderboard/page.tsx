'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Challenge, LeaderboardRow, Profile } from '@/types';

function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export default function LeaderboardPage() {
  const supabase = createClient();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'all' | 'week'>('all');
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nudgedUsers, setNudgedUsers] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. Initial Load: user profile + joined challenges
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setUserProfile(prof);

    // Challenges user belongs to
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
  }, [supabase]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Load Leaderboard for selected challenge & timeframe
  const loadLeaderboard = useCallback(async () => {
    if (!selectedChallenge) return;
    setLeaderboardLoading(true);

    const weekStart = timeframe === 'week' ? getMondayOfCurrentWeek() : null;

    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_challenge_id: selectedChallenge.id,
      p_week_start: weekStart,
    });

    if (!error && data) {
      setLeaderboard(data as LeaderboardRow[]);
    } else {
      // Fallback: fetch from challenge_members joined with profiles if RPC returned empty
      const { data: fallbackMembers } = await supabase
        .from('challenge_members')
        .select(`
          user_id,
          total_points,
          profile:profiles (username, full_name, avatar_url)
        `)
        .eq('challenge_id', selectedChallenge.id)
        .order('total_points', { ascending: false });

      if (fallbackMembers) {
        const mapped: LeaderboardRow[] = fallbackMembers.map((m: any, idx: number) => ({
          user_id: m.user_id,
          username: m.profile?.username ?? 'user',
          full_name: m.profile?.full_name ?? 'User',
          avatar_url: m.profile?.avatar_url ?? null,
          total_points: m.total_points ?? 0,
          rank: idx + 1,
        }));
        setLeaderboard(mapped);
      }
    }
    setLeaderboardLoading(false);
  }, [supabase, selectedChallenge, timeframe]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Copy invite link
  const copyInvite = () => {
    if (!selectedChallenge) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/join/${selectedChallenge.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Send Nudge
  const handleNudge = async (targetUserId: string, targetName: string) => {
    if (!currentUserId || !selectedChallenge) return;

    try {
      await supabase.from('nudges').insert({
        sender_id: currentUserId,
        receiver_id: targetUserId,
        challenge_id: selectedChallenge.id,
      });

      setNudgedUsers((prev) => ({ ...prev, [targetUserId]: true }));
      showToast(`Nudge sent to ${targetName}! ⚡`);
      setTimeout(() => {
        setNudgedUsers((prev) => ({ ...prev, [targetUserId]: false }));
      }, 4000);
    } catch {
      showToast('Could not send nudge');
    }
  };

  // Podium positions: [2nd, 1st, 3rd]
  const top3 = [
    leaderboard[1] || null, // 2nd place
    leaderboard[0] || null, // 1st place
    leaderboard[2] || null, // 3rd place
  ];

  const restLeaderboard = leaderboard.slice(3);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary-fixed text-on-primary font-body-bold px-4 py-2 rounded-full text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-surface-container-high shadow-sm">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm max-w-[460px] mx-auto">
          <div className="flex items-center gap-space-sm">
            <span className="flex items-center justify-center">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-outline-variant/60 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="DO STREAKLY"
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
                Leaderboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
              <span className="text-sm leading-none">🔥</span>
              <span className="font-body-bold text-body-bold text-primary-fixed">
                {userProfile?.current_streak ?? 0}d
              </span>
            </div>
            <Link
              href="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-primary-fixed font-body-bold text-xs hover:border-primary-fixed transition-colors"
            >
              {getInitials(userProfile?.full_name || userProfile?.username || 'U')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 w-full bg-surface pt-20 pb-28 px-gutter">
        <div className="flex flex-col w-full max-w-[460px] mx-auto gap-space-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Loading standings...
              </p>
            </div>
          ) : challenges.length === 0 ? (
            /* Empty State: No challenge */
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-surface-container rounded-2xl border border-outline-variant/40 gap-4 mt-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary-fixed text-3xl">
                🏆
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-headline-md text-xl font-bold text-on-surface">
                  No Active Challenges
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant max-w-xs">
                  Join or create a challenge to compete with friends on the leaderboard!
                </p>
              </div>
              <Link
                href="/dashboard/challenges"
                className="mt-2 bg-primary-fixed text-on-primary font-body-bold px-6 py-2.5 rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all text-sm"
              >
                Go to Challenges
              </Link>
            </div>
          ) : (
            <>
              {/* Challenge Selector & Invite Bar */}
              <div className="flex flex-col bg-surface-container rounded-xl p-space-md gap-3 border border-outline-variant/40 shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                      Select Challenge
                    </label>
                    <span className="font-label-caps text-[10px] text-primary-fixed uppercase tracking-wider bg-surface-container-high px-2 py-0.5 rounded-full">
                      {challenges.length} Available
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedChallenge?.id}
                      onChange={(e) => {
                        const c = challenges.find((ch) => ch.id === e.target.value);
                        if (c) setSelectedChallenge(c);
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

                {/* Invite link snippet */}
                <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg border border-surface-container-highest">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      link
                    </span>
                    <span className="font-label-sm text-xs text-on-surface-variant truncate">
                      Code: <strong className="text-on-surface tracking-wider">{selectedChallenge?.invite_code}</strong>
                    </span>
                  </div>
                  <button
                    onClick={copyInvite}
                    className="flex-shrink-0 flex items-center gap-1 bg-surface-container-high hover:bg-surface-container-highest active:scale-95 text-primary-fixed font-body-bold text-xs px-2.5 py-1 rounded-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? 'Copied' : 'Invite'}</span>
                  </button>
                </div>
              </div>

              {/* Timeframe Toggle: All-Time vs This Week */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setTimeframe('all')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-body-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    timeframe === 'all'
                      ? 'bg-primary-fixed text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">all_inclusive</span>
                  <span>All-Time</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('week')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-body-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    timeframe === 'week'
                      ? 'bg-primary-fixed text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">calendar_view_week</span>
                  <span>This Week</span>
                </button>
              </div>

              {leaderboardLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-6 h-6 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
                  <span className="font-label-sm text-xs text-on-surface-variant">Updating rankings...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-container rounded-xl p-6 border border-outline-variant/30">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    No points logged yet. Check off habits to appear here!
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Top 3 Podium ─────────────────────────────────── */}
                  {leaderboard.length >= 2 && (
                    <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2 px-1">
                      {/* 2nd Place */}
                      {top3[0] && (
                        <div className="flex flex-col items-center bg-surface-container rounded-xl p-2.5 pb-3 border border-outline-variant/30 text-center relative">
                          <span className="font-label-caps text-[10px] uppercase font-bold text-gray-300 bg-surface-container-high px-2 py-0.5 rounded-full mb-1">
                            #2 Silver
                          </span>
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border-2 border-gray-400 flex items-center justify-center text-gray-200 font-headline-md text-sm shadow-sm">
                            {top3[0].avatar_url ? (
                              <Image
                                src={top3[0].avatar_url}
                                alt={top3[0].full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              getInitials(top3[0].full_name || top3[0].username)
                            )}
                          </div>
                          <span className="font-body-bold text-xs text-on-surface mt-1.5 truncate max-w-full">
                            {top3[0].full_name || top3[0].username}
                          </span>
                          <span className="font-label-caps text-xs text-gray-300 font-bold mt-0.5">
                            {top3[0].total_points} <span className="text-[10px] text-outline font-normal">pts</span>
                          </span>
                        </div>
                      )}

                      {/* 1st Place (Center elevated) */}
                      {top3[1] && (
                        <div className="flex flex-col items-center bg-surface-container rounded-xl p-3 pb-4 border-2 border-primary-fixed/60 shadow-lg text-center relative -translate-y-2">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl select-none">
                            👑
                          </div>
                          <span className="font-label-caps text-[10px] uppercase font-bold text-primary-fixed bg-surface-container-high px-2 py-0.5 rounded-full mb-1 mt-1">
                            #1 Gold
                          </span>
                          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary-fixed flex items-center justify-center text-primary-fixed font-headline-md text-base shadow-glow-sm">
                            {top3[1].avatar_url ? (
                              <Image
                                src={top3[1].avatar_url}
                                alt={top3[1].full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              getInitials(top3[1].full_name || top3[1].username)
                            )}
                          </div>
                          <span className="font-body-bold text-sm text-on-surface mt-1.5 truncate max-w-full">
                            {top3[1].full_name || top3[1].username}
                          </span>
                          <span className="font-label-caps text-xs text-primary-fixed font-bold mt-0.5">
                            {top3[1].total_points} <span className="text-[10px] text-on-surface-variant font-normal">pts</span>
                          </span>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {top3[2] && (
                        <div className="flex flex-col items-center bg-surface-container rounded-xl p-2.5 pb-3 border border-outline-variant/30 text-center relative">
                          <span className="font-label-caps text-[10px] uppercase font-bold text-amber-500 bg-surface-container-high px-2 py-0.5 rounded-full mb-1">
                            #3 Bronze
                          </span>
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border-2 border-amber-600 flex items-center justify-center text-amber-500 font-headline-md text-sm shadow-sm">
                            {top3[2].avatar_url ? (
                              <Image
                                src={top3[2].avatar_url}
                                alt={top3[2].full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              getInitials(top3[2].full_name || top3[2].username)
                            )}
                          </div>
                          <span className="font-body-bold text-xs text-on-surface mt-1.5 truncate max-w-full">
                            {top3[2].full_name || top3[2].username}
                          </span>
                          <span className="font-label-caps text-xs text-amber-500 font-bold mt-0.5">
                            {top3[2].total_points} <span className="text-[10px] text-outline font-normal">pts</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Leaderboard Rankings List ────────────────────── */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                        Full Standings
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        {leaderboard.length} members
                      </span>
                    </div>

                    <div className="flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/40 divide-y divide-surface-container-highest">
                      {leaderboard.map((row, idx) => {
                        const isMe = row.user_id === currentUserId;
                        const rankNum = idx + 1;
                        const isNudged = !!nudgedUsers[row.user_id];

                        return (
                          <div
                            key={row.user_id}
                            className={`flex items-center justify-between px-space-md py-3.5 transition-colors ${
                              isMe ? 'bg-primary-fixed/5' : 'hover:bg-surface-container-high/40'
                            }`}
                          >
                            <div className="flex items-center gap-space-sm min-w-0">
                              {/* Rank number badge */}
                              <div className="w-6 text-center flex-shrink-0">
                                {rankNum === 1 ? (
                                  <span className="text-base leading-none">🥇</span>
                                ) : rankNum === 2 ? (
                                  <span className="text-base leading-none">🥈</span>
                                ) : rankNum === 3 ? (
                                  <span className="text-base leading-none">🥉</span>
                                ) : (
                                  <span className="font-body-bold text-xs text-outline">
                                    #{rankNum}
                                  </span>
                                )}
                              </div>

                              {/* Avatar */}
                              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-primary-fixed font-body-bold text-xs flex-shrink-0">
                                {row.avatar_url ? (
                                  <Image
                                    src={row.avatar_url}
                                    alt={row.full_name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  getInitials(row.full_name || row.username)
                                )}
                              </div>

                              {/* User details */}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-body-bold text-body-bold text-on-surface truncate">
                                    {row.full_name || row.username}
                                  </span>
                                  {isMe && (
                                    <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="font-label-sm text-xs text-on-surface-variant truncate">
                                  @{row.username}
                                </span>
                              </div>
                            </div>

                            {/* Right side: points + nudge action */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex flex-col items-end">
                                <span className="font-headline-md text-sm font-bold text-on-surface">
                                  {row.total_points}
                                </span>
                                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                                  pts
                                </span>
                              </div>

                              {!isMe && (
                                <button
                                  type="button"
                                  onClick={() => handleNudge(row.user_id, row.full_name || row.username)}
                                  disabled={isNudged}
                                  title="Send a streak reminder nudge"
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-body-bold transition-all active:scale-95 ${
                                    isNudged
                                      ? 'bg-surface-container-highest text-primary-fixed cursor-default'
                                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-primary-fixed border border-outline-variant/40'
                                  }`}
                                >
                                  <span className="text-[13px] leading-none">
                                    {isNudged ? '✓' : '⚡'}
                                  </span>
                                  <span className="text-[11px]">
                                    {isNudged ? 'Sent' : 'Nudge'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
