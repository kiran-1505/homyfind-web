import { NextRequest, NextResponse } from 'next/server';
import { getPGAdvertisementById } from '@/lib/firestore';
import { firebaseAdToPGListing } from '@/utils/transformers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Try Firebase for user-submitted advertisements
    if (!listingId.startsWith('google-') && !listingId.startsWith('mock-') && !listingId.startsWith('fsq-') && !listingId.startsWith('osm-')) {
      const ad = await getPGAdvertisementById(listingId);
      if (ad) {
        const listing = firebaseAdToPGListing(ad);
        // Remove sensitive PII from public response
        return NextResponse.json({
          success: true,
          data: {
            ...listing,
            ownerPhone: '', // Redacted — contact via listing owner
            ownerEmail: '', // Redacted — contact via listing owner
          },
        });
      }
    }

    // For Google Maps listings, try place details
    if (listingId.startsWith('google-')) {
      const placeId = listingId.replace('google-', '');
      const { getPlaceDetails } = await import('@/lib/google-maps-places');
      const details = await getPlaceDetails(placeId);
      if (details) {
        return NextResponse.json({ success: true, data: details });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Listing not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching listing details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
