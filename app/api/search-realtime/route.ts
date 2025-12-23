import { NextRequest, NextResponse } from 'next/server';

/**
 * REAL-TIME PG SEARCH - Priority order:
 * 1. Google Maps Places API (most reliable)
 * 2. Web scraping (fallback)
 * 3. Quality mock data (final fallback)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || searchParams.get('city') || 'Bangalore';

    console.log('\n' + '='.repeat(60));
    console.log(`🔍 REAL-TIME SEARCH STARTING for: ${location}`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
    console.log('📡 Fetching from Firebase + Google Maps...');
    console.log('='.repeat(60) + '\n');

    // STEP 1: Check Firebase for user-added advertisements
    console.log('🔥 Step 1: Checking Firebase for user-added PG advertisements...');
    const { searchPGAdvertisements } = await import('@/lib/firestore');
    const firebaseListings = await searchPGAdvertisements(location);
    
    if (firebaseListings.length > 0) {
      console.log(`✅ Found ${firebaseListings.length} user-added advertisements in Firebase!`);
    } else {
      console.log('⚠️ No user advertisements found in Firebase for this location');
    }

    // STEP 2: Try Google Maps Places API (most reliable)
    console.log('🗺️ Step 2: Trying Google Maps Places API...');
    let googleMapsListings: any[] = [];
    
    try {
      const { fetchFromGoogleMapsPlaces } = await import('@/lib/google-maps-places');
      googleMapsListings = await fetchFromGoogleMapsPlaces(location);

      if (googleMapsListings.length > 0) {
        console.log(`✅ SUCCESS! Found ${googleMapsListings.length} listings from Google Maps`);
      }
    } catch (googleError: any) {
      console.log(`⚠️ Google Maps API error: ${googleError.message}\n`);
    }

    // Combine Firebase listings + Google Maps listings
    if (firebaseListings.length > 0 || googleMapsListings.length > 0) {
      // Transform Firebase listings
      const transformedFirebase = firebaseListings.map((listing) => ({
        id: listing.id || `firebase-${Date.now()}`,
        pgName: listing.pgName,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        pincode: listing.pincode,
        nearbyLandmark: listing.nearbyLandmark,
        sharingOption: listing.sharingOption,
        rent: listing.rent,
        securityDeposit: listing.securityDeposit,
        images: listing.images.length > 0 ? listing.images : [`https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop`],
        description: listing.description,
        amenities: listing.amenities,
        rules: listing.rules,
        foodIncluded: listing.foodIncluded,
        preferredGender: listing.preferredGender,
        availableFrom: listing.availableFrom,
        totalRooms: listing.totalRooms,
        availableRooms: listing.availableRooms,
        ownerId: 'owner',
        ownerName: listing.ownerName,
        ownerPhone: listing.ownerPhone,
        ownerEmail: listing.ownerEmail,
        verified: listing.verified,
        rating: 4.5, // Default rating for new listings
        reviewCount: 0,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        sourceLink: '#',
        isRealData: true,
        source: 'firebase-user-ad',
      }));

      // Transform Google Maps listings
      const transformedGoogle = googleMapsListings.map((listing) => ({
          id: listing.id,
          pgName: listing.pgName,
          address: listing.address,
          city: listing.city,
          state: listing.state || 'India',
          pincode: listing.pincode || '',
          nearbyLandmark: listing.nearbyLandmark || listing.address,
          sharingOption: listing.sharingOption,
          rent: listing.rent,
          securityDeposit: listing.securityDeposit,
          images: listing.images,
          description: listing.description,
          amenities: listing.amenities,
          rules: listing.rules || [],
          foodIncluded: listing.foodIncluded,
          preferredGender: listing.preferredGender,
          availableFrom: listing.availableFrom,
          totalRooms: listing.totalRooms,
          availableRooms: listing.availableRooms,
          ownerId: listing.ownerId,
          ownerName: listing.ownerName,
          ownerPhone: listing.ownerPhone,
          ownerEmail: listing.ownerEmail,
          verified: listing.verified,
          rating: listing.rating,
          reviewCount: listing.reviewCount,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          sourceLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`,
          isRealData: true,
          source: 'google-maps-api',
        }));

        // Combine both sources: Firebase listings first, then Google Maps
        const allListings = [...transformedFirebase, ...transformedGoogle];

        const timeMs = Date.now() - startTime;
        console.log('\n' + '='.repeat(60));
        console.log(`⏱️  Total time: ${(timeMs / 1000).toFixed(2)}s`);
        console.log(`📊 Results:`);
        console.log(`   - ${firebaseListings.length} user advertisements (Firebase)`);
        console.log(`   - ${googleMapsListings.length} listings from Google Maps`);
        console.log(`   - ${allListings.length} total listings`);
        console.log('='.repeat(60) + '\n');

        return NextResponse.json({
          success: true,
          data: allListings,
          count: allListings.length,
          source: firebaseListings.length > 0 ? 'firebase-and-google-maps' : 'google-maps-only',
          sources: {
            firebase: firebaseListings.length,
            googleMaps: googleMapsListings.length,
          },
          message: `✅ Found ${allListings.length} PG listings (${firebaseListings.length} ads + ${googleMapsListings.length} from Google Maps)`,
          timestamp: new Date().toISOString(),
          isRealData: true,
        });
      }

    // STEP 2: Fallback to web scraping
    console.log('🌐 Step 2: Trying web scraping from PG websites...');
    const { getAggregatedPGData } = await import('@/lib/skyscanner-approach');
    
    console.log('⏳ This will take 10-15 seconds - scraping in progress!\n');
    
    const realListings = await getAggregatedPGData(location);
    
    const scrapingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log(`⏱️  Scraping completed in ${scrapingTime} seconds`);
    console.log(`📊 Results: ${realListings.length} listings found`);
    console.log('='.repeat(60) + '\n');

    if (realListings.length > 0) {
      // Transform to our format  
      const transformedListings = realListings.map((listing) => ({
        id: listing.id,
        pgName: listing.name,
        address: listing.location,
        city: listing.city,
        state: 'India',
        pincode: '',
        nearbyLandmark: listing.location,
        sharingOption: listing.sharingType,
        rent: listing.price,
        securityDeposit: listing.price * 2,
        images: [listing.image],
        description: `${listing.name} - ${listing.amenities.join(', ')}`,
        amenities: listing.amenities,
        rules: [],
        foodIncluded: listing.foodIncluded,
        preferredGender: listing.gender,
        availableFrom: new Date().toISOString(),
        totalRooms: 10,
        availableRooms: Math.floor(Math.random() * 5) + 1,
        ownerId: 'owner',
        ownerName: 'Contact via listing',
        ownerPhone: listing.phone || '',
        ownerEmail: '',
        verified: true,
        rating: listing.rating,
        reviewCount: listing.reviews,
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceLink: listing.link,
        isRealData: true,
      }));

      const scrapingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '='.repeat(60));
      console.log(`⏱️  Scraping completed in ${scrapingTime} seconds`);
      console.log(`📊 Results: ${transformedListings.length} REAL listings from web scraping`);
      console.log('='.repeat(60) + '\n');

      return NextResponse.json({
        success: true,
        data: transformedListings,
        count: transformedListings.length,
        source: 'web-scraping',
        message: `✅ Found ${transformedListings.length} REAL PG listings in ${location} from web scraping`,
        timestamp: new Date().toISOString(),
        isRealData: true,
      });
    }

    // STEP 3: Final fallback to quality mock data
    console.log('⚠️ No real data found, using quality sample data as final fallback');
    
    return NextResponse.json({
      success: true,
      data: generateMockData(location, 12),
      count: 12,
      source: 'sample-data',
      message: `Showing quality sample data for ${location}. Please add your Google Maps API key for real listings.`,
      isRealData: false,
    });

  } catch (error: any) {
    console.error('❌ Error in real-time search:', error);
    console.error('Stack:', error.stack);
    
    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: generateMockData('Bangalore', 12),
      count: 12,
      source: 'error-fallback',
      message: 'Showing sample data - scraping in progress (websites may be blocking)',
      isRealData: false,
    });
  }
}

function estimatePrice(city: string): number {
  const cityLower = city.toLowerCase();
  if (cityLower.includes('bangalore') || cityLower.includes('mumbai')) return 12000;
  if (cityLower.includes('delhi') || cityLower.includes('pune')) return 10000;
  if (cityLower.includes('hyderabad') || cityLower.includes('chennai')) return 9000;
  return 8000;
}

function generateMockData(location: string, count: number) {
  const pgNames = [
    'Sunshine PG', 'Royal Residency', 'Green Valley PG', 'Comfort Zone',
    'Happy Homes PG', 'Elite Stay', 'Urban Nest', 'Cozy Corner PG',
    'Paradise Living', 'Smart Stay PG', 'Premium PG', 'Golden Residency'
  ];

  const landmarks = [
    'Near Metro Station', 'Close to Tech Park', 'Near University',
    'Shopping Mall Nearby', 'Bus Stop 2 mins', 'Market Area'
  ];

  return Array.from({ length: count }, (_, i) => {
    const sharingOption = [1, 2, 3, 4][i % 4];
    const baseRent = sharingOption === 1 ? 12000 : 
                     sharingOption === 2 ? 8000 : 
                     sharingOption === 3 ? 6000 : 5000;
    
    return {
      id: `mock-${Date.now()}-${i}`,
      pgName: pgNames[i % pgNames.length] + ` - ${location}`,
      address: `Sector ${i + 1}, ${location}`,
      city: location,
      state: 'India',
      pincode: `${560000 + i}`,
      nearbyLandmark: landmarks[i % landmarks.length],
      sharingOption,
      rent: baseRent + (i * 500),
      securityDeposit: (baseRent + (i * 500)) * 2,
      images: [`https://picsum.photos/seed/${location}${i}/800/600`],
      description: `${sharingOption} sharing PG in ${location}. Clean, safe, and comfortable.`,
      amenities: ['WiFi', 'AC', 'Laundry', 'Security'],
      rules: ['No smoking', 'Visitors allowed till 9 PM'],
      foodIncluded: i % 2 === 0,
      preferredGender: ['Male', 'Female', 'Any'][i % 3],
      availableFrom: new Date().toISOString(),
      totalRooms: 10,
      availableRooms: Math.floor(Math.random() * 5) + 1,
      ownerId: `owner-${i}`,
      ownerName: `Owner ${i + 1}`,
      ownerPhone: `+91 98765${43210 + i}`,
      ownerEmail: `owner${i}@example.com`,
      verified: i % 3 !== 0,
      rating: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRealData: false,
    };
  });
}

