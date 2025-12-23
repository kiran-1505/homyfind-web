import { NextRequest, NextResponse } from 'next/server';
import { searchPGsOnGoogle, transformPlaceToPGListing } from '@/lib/google-places';
import { scrapeMultiplePGSources } from '@/lib/web-scraper';

/**
 * REAL-TIME PG SEARCH API (Skyscanner Approach)
 * 
 * This endpoint searches for PGs in real-time without storing data.
 * It aggregates results from multiple sources:
 * 1. Google Places API
 * 2. PG websites (NoBroker, Nestaway, etc.)
 * 3. Other sources
 * 
 * Just like Skyscanner searches flights, this searches PGs on-demand
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'Bangalore';
    const useGoogle = searchParams.get('google') !== 'false';
    const useScraping = searchParams.get('scrape') === 'true';

    console.log(`🔍 Real-time search for PGs in: ${location}`);

    const allResults: any[] = [];

    // Source 1: Google Places API (if API key is available)
    if (useGoogle) {
      try {
        console.log('Searching Google Places...');
        const googleResults = await searchPGsOnGoogle(location);
        const transformed = googleResults.map((place, i) => 
          transformPlaceToPGListing(place, i)
        );
        allResults.push(...transformed);
        console.log(`✅ Found ${googleResults.length} results from Google Places`);
      } catch (error) {
        console.log('❌ Google Places search failed:', error);
      }
    }

    // Source 2: Web Scraping (if enabled)
    if (useScraping) {
      try {
        console.log('Scraping PG websites...');
        const scrapedResults = await scrapeMultiplePGSources(location);
        // Transform scraped results to PGListing format
        // allResults.push(...scrapedResults);
        console.log(`✅ Scraped ${scrapedResults.length} results from websites`);
      } catch (error) {
        console.log('❌ Web scraping failed:', error);
      }
    }

    // If no real results, return mock data for development
    if (allResults.length === 0) {
      console.log('⚠️ No real-time results found. Returning mock data for development.');
      return NextResponse.json({
        success: true,
        data: generateQuickMockData(location, 12),
        count: 12,
        source: 'mock',
        message: 'Using mock data. Configure Google Places API key for real results.',
      });
    }

    return NextResponse.json({
      success: true,
      data: allResults,
      count: allResults.length,
      sources: {
        google: useGoogle,
        scraping: useScraping,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in real-time PG search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Real-time search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Quick mock data generator for development
function generateQuickMockData(location: string, count: number) {
  const pgNames = [
    'Sunshine PG', 'Royal Residency', 'Green Valley PG', 'Comfort Zone',
    'Happy Homes PG', 'Elite Stay', 'Urban Nest', 'Cozy Corner PG',
    'Paradise Living', 'Smart Stay PG', 'Premium PG', 'Golden Residency'
  ];

  return Array.from({ length: count }, (_, i) => {
    const sharingOption = [1, 2, 3, 4][i % 4];
    const baseRent = sharingOption === 1 ? 12000 : 
                     sharingOption === 2 ? 8000 : 
                     sharingOption === 3 ? 6000 : 5000;
    
    return {
      id: `rt-${Date.now()}-${i}`,
      pgName: pgNames[i % pgNames.length],
      address: `Sector ${i + 1}, ${location}`,
      city: location,
      state: 'India',
      pincode: `${560000 + i}`,
      nearbyLandmark: 'Near Metro Station',
      sharingOption,
      rent: baseRent + (i * 500),
      securityDeposit: (baseRent + (i * 500)) * 2,
      images: [
        `https://picsum.photos/seed/${location}${i}/800/600`,
      ],
      description: `Real-time search result for ${location}. ${sharingOption} sharing PG accommodation.`,
      amenities: ['WiFi', 'AC', 'Laundry'],
      rules: [],
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
    };
  });
}

