import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Simple in-memory photo cache to avoid re-fetching the same image from Google.
 * Stores the raw buffer + content-type. Entries expire after 1 hour.
 * Max 100 entries to cap memory usage (~15MB at ~150KB avg per photo).
 */
interface CachedPhoto {
  buffer: ArrayBuffer;
  contentType: string;
  timestamp: number;
}

const photoCache = new Map<string, CachedPhoto>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 100;

function evictExpiredEntries() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  photoCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => photoCache.delete(key));
}

/**
 * GET /api/maps-photo?ref=PHOTO_REFERENCE&w=800
 * Proxies Google Maps Place Photo requests so the API key is never exposed to the client.
 * Includes an in-memory cache to avoid duplicate fetches for the same photo reference.
 */
export async function GET(request: NextRequest) {
  try {
    const photoRef = request.nextUrl.searchParams.get('ref');
    const maxWidth = request.nextUrl.searchParams.get('w') || '800';

    if (!photoRef) {
      return NextResponse.json({ error: 'Missing photo reference' }, { status: 400 });
    }

    // Validate photo reference — allow all URL-safe chars Google may use
    // Google photo references are opaque strings; we just guard against injection
    if (photoRef.length > 2000 || /[<>"{}|\\^`\x00-\x1f]/.test(photoRef)) {
      return NextResponse.json({ error: 'Invalid photo reference' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 });
    }

    // Check in-memory cache first
    const cacheKey = `${photoRef}:${maxWidth}`;
    const cached = photoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-Content-Type-Options': 'nosniff',
          'X-Cache': 'HIT',
        },
      });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${apiKey}`;

    const response = await fetch(googleUrl, { redirect: 'follow' });

    if (!response.ok) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Store in cache (evict old entries if cache is full)
    evictExpiredEntries();
    if (photoCache.size >= MAX_CACHE_SIZE) {
      // Remove the oldest entry
      const firstKey = photoCache.keys().next().value;
      if (firstKey) photoCache.delete(firstKey);
    }
    photoCache.set(cacheKey, { buffer: imageBuffer, contentType, timestamp: Date.now() });

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Maps photo proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
