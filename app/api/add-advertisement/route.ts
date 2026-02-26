import { NextRequest, NextResponse } from 'next/server';
import { addPGAdvertisement, getPGAdvertisementById } from '@/lib/firestore';
import { addListingSchema } from '@/lib/validations';
import { verifyAuthToken } from '@/lib/auth-server';
import { MAX_IMAGES } from '@/constants';

const FIRESTORE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const result = addListingSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    const validated = result.data;

    // If user is authenticated, link listing to their account so it appears in dashboard
    let ownerId: string | undefined;
    let ownerPhone = validated.ownerPhone;
    let ownerEmail = validated.ownerEmail || '';
    const authUser = await verifyAuthToken(request);
    if (authUser) {
      ownerId = authUser.uid;
      // Use normalized phone/email from auth so getListingsByOwnerPhone/Email find this listing
      if (authUser.phone) ownerPhone = authUser.phone;
      if (authUser.email) ownerEmail = authUser.email;
    }

    const docId = await addPGAdvertisement({
      pgName: validated.pgName,
      ownerName: validated.ownerName,
      ownerPhone,
      ownerEmail,
      ...(ownerId ? { ownerId } : {}),
      area: validated.area,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      pincode: validated.pincode,
      nearbyLandmark: validated.nearbyLandmark,
      ...(validated.googleMapsLink ? { googleMapsLink: validated.googleMapsLink } : {}),
      roomConfigurations: validated.roomConfigurations,
      sharingOption: validated.sharingOption,
      rent: validated.rent,
      securityDeposit: validated.securityDeposit,
      foodIncluded: validated.foodIncluded,
      preferredGender: validated.preferredGender,
      amenities: validated.amenities,
      rules: validated.rules,
      description: validated.description,
      images: validated.images,
      totalRooms: validated.totalRooms,
      availableRooms: validated.availableRooms,
      availableFrom: validated.availableFrom,
    });

    return NextResponse.json({
      success: true,
      message: 'Advertisement submitted successfully! It will be visible after verification.',
      advertisementId: docId,
    });

  } catch (error) {
    console.error('Error adding advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add advertisement' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Update an existing listing's images (with auth + ownership verification)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, images } = body;

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // Validate image count
    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Validate each image is a valid URL string
    for (const img of images) {
      if (typeof img !== 'string' || (!img.startsWith('https://') && !img.startsWith('http://'))) {
        return NextResponse.json(
          { success: false, error: 'All images must be valid URLs' },
          { status: 400 }
        );
      }
    }

    // Verify ownership
    const existing = await getPGAdvertisementById(listingId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const ownerPhone = user.phone;
    const ownerEmail = user.email;
    const isOwner =
      (existing.ownerId && existing.ownerId === user.uid) ||
      (ownerPhone && existing.ownerPhone === ownerPhone) ||
      (ownerEmail && existing.ownerEmail && existing.ownerEmail === ownerEmail);

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: you do not own this listing' },
        { status: 403 }
      );
    }

    // Use Firestore REST API with the user's token (bypasses anonymous auth PERMISSION_DENIED)
    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!idToken || !FIRESTORE_PROJECT_ID) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const firestoreFields: Record<string, unknown> = {
      images: { arrayValue: { values: images.map((url: string) => ({ stringValue: url })) } },
      updatedAt: { timestampValue: new Date().toISOString() },
    };

    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/pg_advertisements/${listingId}?updateMask.fieldPaths=images&updateMask.fieldPaths=updatedAt`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields: firestoreFields }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Firestore REST image update failed:', response.status, errorBody);
      return NextResponse.json(
        { success: false, error: 'Failed to update images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing updated with images',
    });
  } catch (error) {
    console.error('Error updating advertisement images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update images' },
      { status: 500 }
    );
  }
}
