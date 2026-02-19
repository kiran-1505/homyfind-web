import { PGListing } from '@/types';
import { GOOGLE_MAPS_CACHE_TTL, BASE_PRICE, PRICE_VARIANCE } from '@/constants';

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
 * Fetch PG listings from Google Maps Places API
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
  console.log(`Fetching from Google Maps Places API for: ${location}`);

  try {
    const query = `PG paying guest accommodation in ${location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      console.log(`No results for: "${query}" (Status: ${data.status})`);
      return [];
    }

    let results: GooglePlace[] = data.results || [];
    console.log(`Found ${results.length} results for: "${query}"`);

    // Fetch additional pages using next_page_token (Google returns up to 60 results across 3 pages)
    let nextPageToken = data.next_page_token;
    let pageCount = 1;
    while (nextPageToken && pageCount < 3) {
      // Google requires a short delay before using the next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));
      const nextUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
      const nextResponse = await fetch(nextUrl);
      const nextData = await nextResponse.json();
      if (nextData.status === 'OK' && nextData.results) {
        results = [...results, ...nextData.results];
        console.log(`Page ${pageCount + 1}: ${nextData.results.length} more results (total: ${results.length})`);
      }
      nextPageToken = nextData.next_page_token;
      pageCount++;
    }

    const listings: PGListing[] = results.map((place, index) => {
      const imageUrls: string[] = [];
      if (place.photos && place.photos.length > 0) {
        const photosToFetch = place.photos.slice(0, 5);
        for (const photo of photosToFetch) {
          imageUrls.push(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`
          );
        }
      }

      const addressParts = place.formatted_address.split(',');
      const city = addressParts[addressParts.length - 2]?.trim() || location;
      const state = addressParts[addressParts.length - 1]?.trim() || 'India';

      const price = BASE_PRICE + Math.floor(Math.random() * PRICE_VARIANCE);

      return {
        id: `google-${place.place_id}`,
        pgName: place.name,
        address: place.formatted_address,
        city: city,
        state: state,
        pincode: '',
        nearbyLandmark: place.formatted_address,
        sharingOption: [1, 2, 3, 4][index % 4],
        rent: price,
        securityDeposit: price * 2,
        images: imageUrls,
        description: `${place.name} - Comfortable PG accommodation`,
        amenities: ['WiFi', 'Security', 'Power Backup'],
        rules: [],
        foodIncluded: index % 2 === 0,
        preferredGender: (['Male', 'Female', 'Any'][index % 3] as 'Male' | 'Female' | 'Any'),
        availableFrom: new Date().toISOString(),
        totalRooms: 10,
        availableRooms: Math.floor(Math.random() * 5) + 1,
        ownerId: 'google-maps',
        ownerName: 'Contact via Google',
        ownerPhone: '',
        ownerEmail: '',
        verified: true,
        rating: place.rating || 4.0,
        reviewCount: place.user_ratings_total || 10,
        createdAt: new Date(),
        updatedAt: new Date(),
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
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return null;
  }

  try {
    const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}
