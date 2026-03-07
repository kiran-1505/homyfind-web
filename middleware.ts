import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// NOTE: In-memory rate limiting resets on Vercel serverless cold starts.
// For production-grade rate limiting, migrate to @upstash/ratelimit + @upstash/redis.
// See: https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const MAX_ENTRIES = 10000;

/** Per-endpoint rate limits (requests per minute) */
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
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

/** Allowed CORS origin — set to your production domain only (e.g. https://find-my-pg.com). */
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://find-my-pg.com';

/**
 * Apply strict CORS: only allow requests from CORS_ORIGIN.
 * For API routes, sets Access-Control-Allow-Origin only when Origin matches.
 */
function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  if (origin && origin === CORS_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function middleware(request: NextRequest) {
  // Preflight: respond to OPTIONS with CORS and 204
  if (request.method === 'OPTIONS') {
    const res = NextResponse.next();
    addCorsHeaders(request, res);
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  // API routes: rate limiting + security headers + CORS
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const now = Date.now();
    const { windowMs, max } = getRateConfig(request.nextUrl.pathname);
    const rateLimitKey = `${ip}:${request.nextUrl.pathname}`;
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
      const res = addSecurityHeaders(NextResponse.next());
      return addCorsHeaders(request, res);
    }

    if (entry.count >= max) {
      const res = addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      );
      return addCorsHeaders(request, res);
    }

    entry.count++;
    const res = addSecurityHeaders(NextResponse.next());
    return addCorsHeaders(request, res);
  }

  // All other routes: locale detection (security headers via next.config.js)
  return intlMiddleware(request);
}

/**
 * Security headers applied to ALL routes (API + pages).
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
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
