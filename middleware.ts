import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function middleware(request: NextRequest) {
  // API routes: rate limiting only, no locale processing
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      return NextResponse.next();
    }

    if (entry.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    entry.count++;
    return NextResponse.next();
  }

  // All other routes: locale detection and routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
