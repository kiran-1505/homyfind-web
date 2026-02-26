import { NextRequest, NextResponse } from 'next/server';
import { PGListing } from '@/types';
import { DEFAULT_LOCATION } from '@/constants';
import { searchQuerySchema } from '@/lib/validations';
import { firebaseAdToPGListing, externalToPGListing } from '@/utils/transformers';
import { generateMockData } from '@/utils/mock-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    console.log(`Search starting for: ${location}`);

    // STEP 1: Check Firebase for user-added advertisements
    let firebaseListings: PGListing[] = [];
    try {
      const { searchPGAdvertisements } = await import('@/lib/firestore');
      const ads = await searchPGAdvertisements(location);
      firebaseListings = ads.map(firebaseAdToPGListing);
      console.log(`Firebase: ${firebaseListings.length} ads found`);
    } catch (fbError) {
      console.log(`Firebase error: ${fbError instanceof Error ? fbError.message : fbError}`);
    }

    // STEP 2: Try Google Maps Places API
    let googleMapsListings: PGListing[] = [];
    try {
      const { fetchFromGoogleMapsPlaces } = await import('@/lib/google-maps-places');
      googleMapsListings = await fetchFromGoogleMapsPlaces(location);
      console.log(`Google Maps: ${googleMapsListings.length} listings found`);
    } catch (googleError) {
      console.log(`Google Maps API error: ${googleError instanceof Error ? googleError.message : googleError}`);
    }

    // Combine Firebase + Google Maps listings
    if (firebaseListings.length > 0 || googleMapsListings.length > 0) {
      const allListings = [...firebaseListings, ...googleMapsListings];

      // Sort: premium first, then verified, then free listings
      const planRank: Record<string, number> = { premium: 0, verified: 1, free: 2 };
      allListings.sort((a, b) => {
        const rankA = planRank[a.verificationPlan] ?? 2;
        const rankB = planRank[b.verificationPlan] ?? 2;
        if (rankA !== rankB) return rankA - rankB;
        return (b.rating || 0) - (a.rating || 0);
      });

      const timeMs = Date.now() - startTime;
      console.log(`Search completed in ${(timeMs / 1000).toFixed(2)}s - ${allListings.length} total listings`);

      return NextResponse.json({
        success: true,
        data: allListings,
        count: allListings.length,
        source: firebaseListings.length > 0 ? 'firebase-and-google-maps' : 'google-maps-only',
        sources: {
          firebase: firebaseListings.length,
          googleMaps: googleMapsListings.length,
        },
        message: `Found ${allListings.length} PG listings`,
        timestamp: new Date().toISOString(),
        isRealData: true,
      });
    }

    // STEP 3: Fallback to web scraping (Foursquare + OpenStreetMap)
    console.log('Trying web scraping fallback...');
    const { getAggregatedPGData } = await import('@/lib/skyscanner-approach');
    const realListings = await getAggregatedPGData(location);

    if (realListings.length > 0) {
      const transformedListings = realListings.map(externalToPGListing);
      const timeMs = Date.now() - startTime;
      console.log(`Scraping completed in ${(timeMs / 1000).toFixed(2)}s - ${transformedListings.length} listings`);

      return NextResponse.json({
        success: true,
        data: transformedListings,
        count: transformedListings.length,
        source: 'web-scraping',
        message: `Found ${transformedListings.length} PG listings in ${location}`,
        timestamp: new Date().toISOString(),
        isRealData: true,
      });
    }

    // STEP 4: Final fallback to mock data
    console.log('No real data found, using sample data');

    return NextResponse.json({
      success: true,
      data: generateMockData(location, 30),
      count: 30,
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
