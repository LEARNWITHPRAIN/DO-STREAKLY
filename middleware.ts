import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error caught safely:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on protected app routes and auth pages.
     * Public pages like '/' (landing page), favicon, and static assets bypass middleware entirely.
     */
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
