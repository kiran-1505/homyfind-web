import { NextRequest, NextResponse } from 'next/server';
import { searchPGAdvertisements } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Try to find in Firebase first
    if (listingId.startsWith('firebase-')) {
      // This is a Firebase listing - we'd need to implement a getById function
      // For now, return not found and let the frontend use cached data
      return NextResponse.json({
        success: false,
        message: 'Please use cached data from search results',
      });
    }

    // For Google Maps listings, return not found
    // The frontend will use localStorage cache
    return NextResponse.json({
      success: false,
      message: 'Listing details available in cache',
    });

  } catch (error: any) {
    console.error('Error fetching listing details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

