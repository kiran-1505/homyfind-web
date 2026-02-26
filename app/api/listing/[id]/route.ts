import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Try Firebase for user-submitted advertisements
    if (!listingId.startsWith('google-') && !listingId.startsWith('mock-') && !listingId.startsWith('fsq-') && !listingId.startsWith('osm-')) {
      const docRef = doc(db, 'pg_advertisements', listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return NextResponse.json({
          success: true,
          data: {
            id: docSnap.id,
            pgName: data.pgName,
            ownerName: data.ownerName,
            ownerPhone: data.ownerPhone,
            ownerEmail: data.ownerEmail,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            nearbyLandmark: data.nearbyLandmark,
            sharingOption: data.sharingOption,
            rent: data.rent,
            securityDeposit: data.securityDeposit,
            foodIncluded: data.foodIncluded,
            preferredGender: data.preferredGender,
            amenities: data.amenities || [],
            rules: data.rules || [],
            description: data.description,
            images: data.images || [],
            totalRooms: data.totalRooms,
            availableRooms: data.availableRooms,
            availableFrom: data.availableFrom,
            verified: data.verified || false,
            verificationPlan: data.verificationPlan || (data.verified ? 'verified' : 'free'),
            rating: 4.5,
            reviewCount: 0,
            ownerId: 'owner',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
