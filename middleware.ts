import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Rate limiting configuration
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
const MAX_ENTRIES = 10000; // Prevent unbounded memory growth

/**
 * Parse the real client IP from x-forwarded-for header.
 * Takes the first IP (closest to client) from comma-separated list.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP from the chain (closest to client)
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export function middleware(request: NextRequest) {
  // API routes: rate limiting only, no locale processing
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now > entry.resetTime) {
      // Evict stale entries if map is too large
      if (rateLimit.size >= MAX_ENTRIES) {
        const cutoff = now - WINDOW_MS;
        const staleKeys: string[] = [];
        rateLimit.forEach((val, key) => {
          if (val.resetTime < cutoff) staleKeys.push(key);
        });
        staleKeys.forEach(key => rateLimit.delete(key));
        // If still too large after cleanup, clear oldest entries
        if (rateLimit.size >= MAX_ENTRIES) {
          const keysToDelete = Array.from(rateLimit.keys()).slice(0, 1000);
          keysToDelete.forEach(key => rateLimit.delete(key));
        }
      }
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      return addSecurityHeaders(NextResponse.next());
    }

    if (entry.count >= MAX_REQUESTS) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      );
    }

    entry.count++;
    return addSecurityHeaders(NextResponse.next());
  }

  // All other routes: locale detection and routing
  return intlMiddleware(request);
}

/**
 * Add basic security headers to API responses.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
