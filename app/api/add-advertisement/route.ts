import { NextRequest, NextResponse } from 'next/server';
import { addPGAdvertisement } from '@/lib/firestore';
import { addListingSchema } from '@/lib/validations';

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

    const docId = await addPGAdvertisement({
      pgName: validated.pgName,
      ownerName: validated.ownerName,
      ownerPhone: validated.ownerPhone,
      ownerEmail: validated.ownerEmail,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      pincode: validated.pincode,
      nearbyLandmark: validated.nearbyLandmark,
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to add advertisement' },
      { status: 500 }
    );
  }
}
