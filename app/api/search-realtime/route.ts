import { NextRequest, NextResponse } from 'next/server';
import { PGListing } from '@/types';
import { DEFAULT_LOCATION, LISTINGS_PER_PAGE } from '@/constants';
import { searchQuerySchema } from '@/lib/validations';
import { firebaseAdToPublicListing } from '@/utils/transformers';
import { generateMockData } from '@/utils/mock-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Apply server-side filters to listings */
function applyFilters(listings: PGListing[], params: URLSearchParams): PGListing[] {
  let filtered = listings;

  const maxRent = params.get('maxRent');
  if (maxRent) {
    const max = parseInt(maxRent, 10);
    if (!isNaN(max)) filtered = filtered.filter(l => l.rent <= max);
  }

  const sharingOption = params.get('sharingOption');
  if (sharingOption) {
    const sharing = parseInt(sharingOption, 10);
    if (!isNaN(sharing)) filtered = filtered.filter(l => l.sharingOption === sharing);
  }

  const gender = params.get('gender');
  if (gender && ['Male', 'Female', 'Any'].includes(gender)) {
    filtered = filtered.filter(l => l.preferredGender === gender || l.preferredGender === 'Any');
  }

  const food = params.get('foodIncluded');
  if (food === 'true') filtered = filtered.filter(l => l.foodIncluded);
  if (food === 'false') filtered = filtered.filter(l => !l.foodIncluded);

  return filtered;
}

/** Paginate results server-side */
function paginate(listings: PGListing[], params: URLSearchParams): { page: number; totalPages: number; data: PGListing[] } {
  const limit = Math.min(parseInt(params.get('limit') || String(LISTINGS_PER_PAGE), 10), 50);
  const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
  const start = (page - 1) * limit;
  return {
    page,
    totalPages: Math.ceil(listings.length / limit),
    data: listings.slice(start, start + limit),
  };
}

/**
 * Cross-source deduplication: removes listings that likely refer to the same
 * physical place by comparing normalised names and addresses.
 */
function deduplicateListings(listings: PGListing[]): PGListing[] {
  const seen = new Set<string>();
  const result: PGListing[] = [];

  for (const listing of listings) {
    const normName = listing.pgName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    const normCity = listing.city.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const fingerprint = `${normName}-${normCity}`;

    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      result.push(listing);
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const locationRaw = searchParams.get('location') || searchParams.get('city') || DEFAULT_LOCATION;

    // Validate location
    const parsed = searchQuerySchema.safeParse({ location: locationRaw });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid location parameter' },
        { status: 400 }
      );
    }
    const location = parsed.data.location;

    // Optional: ?source=firebase to skip Google Maps API during testing
    const sourceFilter = searchParams.get('source');
    const firebaseOnly = sourceFilter === 'firebase';

    console.log(`Search starting for: ${location}${firebaseOnly ? ' (Firebase only)' : ''}`);

    // ──────────────────────────────────────────────────────────
    // RUN SOURCES: Firebase (user-submitted) + Google Maps (live data)
    // ──────────────────────────────────────────────────────────

    const firebasePromise = (async () => {
      const { searchPGAdvertisements } = await import('@/lib/firestore');
      const ads = await searchPGAdvertisements(location);
      return ads.map(firebaseAdToPublicListing);
    })();

    const googleMapsPromise = firebaseOnly
      ? Promise.resolve([] as PGListing[])
      : (async () => {
          const { fetchFromGoogleMapsPlaces } = await import('@/lib/google-maps-places');
          return fetchFromGoogleMapsPlaces(location);
        })();

    const [firebaseResult, googleMapsResult] = await Promise.allSettled([
      firebasePromise,
      googleMapsPromise,
    ]);

    // Collect results from each source
    const firebaseListings: PGListing[] =
      firebaseResult.status === 'fulfilled' ? firebaseResult.value : [];
    const googleMapsListings: PGListing[] =
      googleMapsResult.status === 'fulfilled' ? googleMapsResult.value : [];

    // Log per-source counts
    const sourceErrors: Record<string, string> = {};

    if (firebaseResult.status === 'rejected') {
      const errMsg = firebaseResult.reason instanceof Error
        ? firebaseResult.reason.message
        : String(firebaseResult.reason);
      console.error(`Firebase search FAILED: ${errMsg}`);
      sourceErrors.firebase = errMsg;
    } else {
      console.log(`Firebase: ${firebaseListings.length} ads found`);
      if (firebaseListings.length === 0) {
        console.warn(`Firebase returned 0 results for "${location}" — check Firestore security rules if you expect results`);
      }
    }
    if (!firebaseOnly) {
      if (googleMapsResult.status === 'rejected') {
        const errMsg = googleMapsResult.reason instanceof Error
          ? googleMapsResult.reason.message
          : String(googleMapsResult.reason);
        console.log(`Google Maps error: ${errMsg}`);
        sourceErrors.googleMaps = errMsg;
      } else {
        console.log(`Google Maps: ${googleMapsListings.length} listings found`);
      }
    }

    // Combine: Firebase first (owner-submitted), then Google Maps (live data)
    const combinedListings = [
      ...firebaseListings,
      ...googleMapsListings,
    ];

    if (combinedListings.length > 0) {
      const deduplicated = deduplicateListings(combinedListings);

      // Sort: Firestore ads first, then by verification plan and rating
      const sourceRank: Record<string, number> = { firestore: 0, google: 1 };
      const planRank: Record<string, number> = { premium: 0, verified: 1, free: 2 };
      deduplicated.sort((a, b) => {
        const srcA = sourceRank[a.source ?? ''] ?? 2;
        const srcB = sourceRank[b.source ?? ''] ?? 2;
        if (srcA !== srcB) return srcA - srcB;
        const rankA = planRank[a.verificationPlan] ?? 2;
        const rankB = planRank[b.verificationPlan] ?? 2;
        if (rankA !== rankB) return rankA - rankB;
        return (b.rating || 0) - (a.rating || 0);
      });

      // Apply server-side filters
      const filtered = applyFilters(deduplicated, searchParams);

      // Paginate
      const { page, totalPages, data: pageData } = paginate(filtered, searchParams);

      const timeMs = Date.now() - startTime;
      console.log(
        `Search completed in ${(timeMs / 1000).toFixed(2)}s - ${filtered.length} results (${deduplicated.length} before filters, ${combinedListings.length} before dedup)`
      );

      return NextResponse.json({
        success: true,
        data: pageData,
        count: filtered.length,
        page,
        totalPages,
        source: 'all-sources',
        sources: {
          firebase: firebaseListings.length,
          googleMaps: googleMapsListings.length,
        },
        ...(Object.keys(sourceErrors).length > 0 && { sourceErrors }),
        message: `Found ${filtered.length} PG listings`,
        timestamp: new Date().toISOString(),
        isRealData: true,
      });
    }

    // FALLBACK: No real data from any source — use sample data
    console.log('No real data found from any source, using sample data');
    const mockData = generateMockData(location, 30);
    const { page, totalPages, data: pageData } = paginate(mockData, searchParams);

    return NextResponse.json({
      success: true,
      data: pageData,
      count: mockData.length,
      page,
      totalPages,
      source: 'sample-data',
      message: `Showing sample data for ${location}. Add your Google Maps API key for real listings.`,
      isRealData: false,
    });

  } catch (error) {
    console.error('Error in real-time search:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Search failed. Please try again.',
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
