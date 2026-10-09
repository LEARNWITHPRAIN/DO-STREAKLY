'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function JoinChallengePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const code = (params?.code as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeName, setChallengeName] = useState<string | null>(null);

  useEffect(() => {
    async function handleJoin() {
      if (!code) {
        setError('Missing invite code');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Look up challenge details
      const { data: chal } = await supabase
        .from('challenges')
        .select('id, name, duration_days')
        .eq('invite_code', code)
        .single();

      if (!chal) {
        setError('Invalid or expired invite code.');
        setLoading(false);
        return;
      }

      setChallengeName(chal.name);

      if (!user) {
        // Not logged in -> redirect to signup with return URL
        setLoading(false);
        return;
      }

      // Logged in -> call join RPC
      const { error: rpcError } = await supabase.rpc('join_challenge', {
        p_code: code,
      });

      if (rpcError) {
        setError(rpcError.message || 'Could not join challenge');
        setLoading(false);
      } else {
        router.push('/dashboard/challenges');
      }
    }

    handleJoin();
  }, [code, supabase, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <div className="w-full max-w-sm rounded-2xl bg-surface-container p-6 shadow-xl border border-outline-variant/40 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed/20 text-primary-fixed flex items-center justify-center text-3xl">
          ⚡
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-6 h-6 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
            <p className="font-body-md text-sm text-on-surface-variant">
              Joining challenge...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Could not join
            </h2>
            <p className="font-body-md text-xs text-error">{error}</p>
            <Link
              href="/dashboard/challenges"
              className="mt-2 bg-surface-container-high text-on-surface font-body-bold px-4 py-2 rounded-xl text-xs hover:bg-surface-container-highest transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Join {challengeName}
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant">
              Sign up or log in to accept this challenge invitation and start tracking streaks!
            </p>
            <div className="flex flex-col gap-2 mt-2 w-full">
              <Link
                href={`/signup?redirect=/join/${code}`}
                className="w-full bg-primary-fixed text-on-primary font-body-bold py-2.5 rounded-xl text-xs hover:brightness-105 transition-all text-center"
              >
                Create Account &amp; Join
              </Link>
              <Link
                href={`/login?redirect=/join/${code}`}
                className="w-full bg-surface-container-high text-on-surface font-body-bold py-2.5 rounded-xl text-xs hover:bg-surface-container-highest transition-all text-center"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
