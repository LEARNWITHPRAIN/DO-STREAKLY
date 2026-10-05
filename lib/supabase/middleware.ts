import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/habits') ||
    pathname.startsWith('/challenges') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/onboarding');

  const isDemo = request.cookies.get('streakly_demo')?.value === 'true';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // If Supabase environment variables are missing on Vercel, allow demo or redirect
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute && !isDemo) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Quick check: does the user have any Supabase auth cookie or demo cookie?
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(c => c.name.includes('-auth-token'));

  // If the user has neither an auth cookie nor demo mode, they are not logged in
  if (!hasAuthCookie && !isDemo) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  let user = null;
  if (hasAuthCookie) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            } catch {
              // Ignore cookie mutations if running in restricted edge context
            }
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch (err) {
      console.warn("Middleware auth session check failed:", err);
    }
  }

  const isAuthenticated = !!user || isDemo;

  // If user is not logged in and tries to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to access auth pages (login/signup)
  if (isAuthenticated && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
