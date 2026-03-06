import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Allowed origins for CORS — only your domains */
const CORS_ORIGINS = new Set([
  'https://find-my-pg.com',
  'https://www.find-my-pg.com',
  'https://find-my-pg.vercel.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
]);

// NOTE: In-memory rate limiting resets on Vercel serverless cold starts.
// For production-grade rate limiting, migrate to @upstash/ratelimit + @upstash/redis.
// See: https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const MAX_ENTRIES = 10000;

/**
 * Daily per-IP quota for expensive endpoints that trigger paid API calls.
 * Limits total searches per IP per day to prevent billing abuse.
 */
const dailyQuota = new Map<string, { count: number; resetTime: number }>();
const DAILY_SEARCH_QUOTA = 100; // max searches per IP per day
const DAILY_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkDailyQuota(ip: string): boolean {
  const now = Date.now();
  const key = `daily:${ip}`;
  const entry = dailyQuota.get(key);

  if (!entry || now > entry.resetTime) {
    dailyQuota.set(key, { count: 1, resetTime: now + DAILY_WINDOW });
    return true;
  }

  if (entry.count >= DAILY_SEARCH_QUOTA) return false;
  entry.count++;
  return true;
}

/** Per-endpoint rate limits (requests per window) */
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  '/api/search-realtime': { windowMs: 60_000, max: 10 },
  '/api/maps-photo': { windowMs: 60_000, max: 30 },
  '/api/listing/': { windowMs: 60_000, max: 20 },
  '/api/create-checkout': { windowMs: 60_000, max: 5 },
  '/api/add-advertisement': { windowMs: 60_000, max: 10 },
  '/api/owner/update-listing': { windowMs: 60_000, max: 20 },
  '/api/admin/': { windowMs: 60_000, max: 5 },
  default: { windowMs: 60_000, max: 60 },
};

function getRateConfig(pathname: string): { windowMs: number; max: number } {
  for (const [route, config] of Object.entries(RATE_LIMITS)) {
    if (route !== 'default' && pathname.startsWith(route)) return config;
  }
  return RATE_LIMITS.default;
}

/**
 * Parse the real client IP from x-forwarded-for header.
 * Takes the first IP (closest to client) from comma-separated list.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export function middleware(request: NextRequest) {
  // API routes: rate limiting + security headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const now = Date.now();
    const pathname = request.nextUrl.pathname;

    // Daily quota for expensive endpoints that trigger paid external API calls
    if (pathname.startsWith('/api/search-realtime') || pathname.startsWith('/api/maps-photo') || pathname.startsWith('/api/listing/')) {
      if (!checkDailyQuota(ip)) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: 'Daily request limit reached. Please try again tomorrow.' },
            { status: 429 }
          ), request
        );
      }
    }

    const { windowMs, max } = getRateConfig(pathname);
    const rateLimitKey = `${ip}:${pathname}`;
    const entry = rateLimit.get(rateLimitKey);

    if (!entry || now > entry.resetTime) {
      // Evict stale entries if map is too large
      if (rateLimit.size >= MAX_ENTRIES) {
        const cutoff = now - 120_000;
        const staleKeys: string[] = [];
        rateLimit.forEach((val, key) => {
          if (val.resetTime < cutoff) staleKeys.push(key);
        });
        staleKeys.forEach(key => rateLimit.delete(key));
        if (rateLimit.size >= MAX_ENTRIES) {
          const keysToDelete = Array.from(rateLimit.keys()).slice(0, 1000);
          keysToDelete.forEach(key => rateLimit.delete(key));
        }
      }
      rateLimit.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
      return addSecurityHeaders(NextResponse.next(), request);
    }

    if (entry.count >= max) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        ), request
      );
    }

    entry.count++;
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // All other routes: locale detection and routing
  // NOTE: Do NOT modify the intlMiddleware response — adding headers breaks
  // the internal rewrite on Vercel Edge Runtime. Security headers for page
  // routes are applied via next.config.js `headers()` instead.
  return intlMiddleware(request);
}

/**
 * Security + CORS headers applied to ALL routes (API + pages).
 */
function addSecurityHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  // CORS: only allow requests from our domains
  if (request) {
    const origin = request.headers.get('origin');
    if (origin && CORS_ORIGINS.has(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://homyfind-app.firebasestorage.app https://maps.googleapis.com https://images.unsplash.com https://picsum.photos https://lh3.googleusercontent.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.google.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com https://api.stripe.com https://firestore.googleapis.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://recaptcha.google.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
