import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/habits') ||
    pathname.startsWith('/challenges') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/onboarding');

  const isDemo = request.cookies.get('streakly_demo')?.value === 'true';

  // Check for Supabase auth cookie (no external library needed)
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes('sb-') && c.name.includes('-auth-token')
  );

  const isLoggedIn = hasAuthCookie || isDemo;

  // Redirect unauthenticated users away from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/habits/:path*',
    '/challenges/:path*',
    '/leaderboard/:path*',
    '/friends/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
