import { PGListing } from '@/types';
import { GOOGLE_MAPS_CACHE_TTL, BASE_PRICE, PRICE_VARIANCE } from '@/constants';

/**
 * Generate a deterministic hash-based number from a string.
 * Used for stable prices/values that don't change on page refresh.
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Build a proxied photo URL that hides the API key from the client.
 */
function buildPhotoUrl(photoReference: string): string {
  return `/api/maps-photo?ref=${encodeURIComponent(photoReference)}`;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    width?: number;
    height?: number;
  }>;
  types: string[];
}

interface GooglePlaceDetails {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
}

// In-memory cache to avoid duplicate API calls within the same server session
const searchCache = new Map<string, { data: PGListing[]; timestamp: number }>();

/**
 * Multiple search queries to maximize PG discovery.
 * Each query targets different terminology used for PG accommodations in India.
 */
const SEARCH_QUERIES = [
  'PG paying guest accommodation in',
  'hostel accommodation in',
  'guest house lodge in',
  'co-living space in',
  'working women hostel in',
  'boys girls hostel in',
];

/**
 * Run a single Google Maps text search and return raw GooglePlace results.
 * Follows up to 2 next_page_tokens for maximum results.
 */
async function runSingleGoogleQuery(
  query: string,
  apiKey: string
): Promise<GooglePlace[]> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results) {
    return [];
  }

  let results: GooglePlace[] = data.results || [];

  // Follow pagination (Google returns up to 60 results across 3 pages)
  let nextPageToken = data.next_page_token;
  let pageCount = 1;
  while (nextPageToken && pageCount < 3) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const nextUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
    const nextResponse = await fetch(nextUrl);
    const nextData = await nextResponse.json();
    if (nextData.status === 'OK' && nextData.results) {
      results = [...results, ...nextData.results];
    }
    nextPageToken = nextData.next_page_token;
    pageCount++;
  }

  return results;
}

/**
 * Fetch PG listings from Google Maps Places API using multiple search queries
 * for maximum coverage. Results are deduplicated by place_id.
 */
export async function fetchFromGoogleMapsPlaces(location: string): Promise<PGListing[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.log('Google Maps API key not configured');
    return [];
  }

  // Check cache first to avoid redundant API calls
  const cacheKey = location.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GOOGLE_MAPS_CACHE_TTL) {
    console.log(`Cache hit for "${location}" - returning ${cached.data.length} cached results`);
    return cached.data;
  }

  const startTime = Date.now();
  console.log(`Fetching from Google Maps Places API for: ${location} (${SEARCH_QUERIES.length} queries)`);

  try {
    // Run all search queries in parallel for speed
    const queryPromises = SEARCH_QUERIES.map(prefix => {
      const fullQuery = `${prefix} ${location}`;
      return runSingleGoogleQuery(fullQuery, apiKey).then(results => {
        console.log(`Google Maps query "${prefix}...": ${results.length} results`);
        return results;
      });
    });

    const allQueryResults = await Promise.allSettled(queryPromises);

    // Collect all results and deduplicate by place_id
    const seenPlaceIds = new Set<string>();
    const uniqueResults: GooglePlace[] = [];

    for (const result of allQueryResults) {
      if (result.status === 'fulfilled') {
        for (const place of result.value) {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id);
            uniqueResults.push(place);
          }
        }
      }
    }

    console.log(`Google Maps: ${uniqueResults.length} unique places after deduplication`);

    if (uniqueResults.length === 0) {
      return [];
    }

    const listings: PGListing[] = uniqueResults.map((place, index) => {
      const imageUrls: string[] = [];
      if (place.photos && place.photos.length > 0) {
        const photosToFetch = place.photos.slice(0, 5);
        for (const photo of photosToFetch) {
          imageUrls.push(
            buildPhotoUrl(photo.photo_reference)
          );
        }
      }

      const addressParts = place.formatted_address.split(',');
      const city = addressParts[addressParts.length - 2]?.trim() || location;
      const state = addressParts[addressParts.length - 1]?.trim() || 'India';

      const placeHash = hashCode(place.place_id);
      const price = BASE_PRICE + (placeHash % PRICE_VARIANCE);

      return {
        id: `google-${place.place_id}`,
        pgName: place.name,
        area: addressParts[0]?.trim() || '',
        address: place.formatted_address,
        city: city,
        state: state,
        pincode: '',
        nearbyLandmark: place.formatted_address,
        sharingOption: [1, 2, 3, 4][index % 4],
        rent: price,
        securityDeposit: price * 2,
        roomConfigurations: [{
          sharingType: [1, 2, 3, 4][index % 4],
          rent: price,
          securityDeposit: price * 2,
          availableRooms: (placeHash % 5) + 1,
        }],
        images: imageUrls,
        description: `${place.name} - Comfortable PG accommodation`,
        amenities: ['WiFi', 'Security', 'Power Backup'],
        rules: [],
        foodIncluded: index % 2 === 0,
        preferredGender: (['Male', 'Female', 'Any'][index % 3] as 'Male' | 'Female' | 'Any'),
        availableFrom: new Date().toISOString(),
        totalRooms: 10,
        availableRooms: (placeHash % 5) + 1,
        ownerId: 'google-maps',
        ownerName: 'Contact via Google',
        ownerPhone: '',
        ownerEmail: '',
        verified: false,
        verificationPlan: 'free' as const,
        rating: place.rating || 4.0,
        reviewCount: place.user_ratings_total || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'google',
      };
    });

    searchCache.set(cacheKey, { data: listings, timestamp: Date.now() });

    const timeMs = Date.now() - startTime;
    console.log(`Google Maps API: ${listings.length} listings (${timeMs}ms)`);

    return listings;

  } catch (error) {
    const timeMs = Date.now() - startTime;
    console.error(`Google Maps API failed (${timeMs}ms):`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Get detailed information about a specific place.
 * Returns a full PGListing-shaped object with ALL photo URLs resolved.
 * The Place Details API returns up to 10 photos (vs Text Search which returns only 1).
 */
export async function getPlaceDetails(placeId: string): Promise<PGListing | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return null;
  }

  try {
    const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,types,geometry';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      return null;
    }

    const place = data.result;

    // Convert ALL photo references to actual image URLs (up to 10 photos)
    const imageUrls: string[] = [];
    if (place.photos && place.photos.length > 0) {
      const photosToFetch = place.photos.slice(0, 10);
      for (const photo of photosToFetch) {
        imageUrls.push(
          buildPhotoUrl(photo.photo_reference)
        );
      }
    }

    console.log(`Place Details for ${placeId}: ${imageUrls.length} photos resolved`);

    const addressParts = (place.formatted_address || '').split(',');
    const city = addressParts[addressParts.length - 2]?.trim() || '';
    const state = addressParts[addressParts.length - 1]?.trim() || 'India';
    const detailHash = hashCode(placeId);
    const price = BASE_PRICE + (detailHash % PRICE_VARIANCE);

    return {
      id: `google-${placeId}`,
      pgName: place.name || 'PG Accommodation',
      area: '',
      address: place.formatted_address || '',
      city,
      state,
      pincode: '',
      nearbyLandmark: place.formatted_address || '',
      sharingOption: 2,
      rent: price,
      securityDeposit: price * 2,
      roomConfigurations: [{
        sharingType: 2,
        rent: price,
        securityDeposit: price * 2,
        availableRooms: 3,
      }],
      images: imageUrls,
      description: `${place.name} - Comfortable PG accommodation`,
      amenities: ['WiFi', 'Security', 'Power Backup'],
      rules: [],
      foodIncluded: false,
      preferredGender: 'Any' as const,
      availableFrom: new Date().toISOString(),
      totalRooms: 10,
      availableRooms: 3,
      ownerId: 'google-maps',
      ownerName: place.formatted_phone_number ? 'Contact via Phone' : 'Contact via Google',
      ownerPhone: place.formatted_phone_number || '',
      ownerEmail: '',
      verified: false,
      verificationPlan: 'free' as const,
      rating: place.rating || 4.0,
      reviewCount: place.user_ratings_total || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'google',
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}
