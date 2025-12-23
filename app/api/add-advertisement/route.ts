import { NextRequest, NextResponse } from 'next/server';
import { addPGAdvertisement } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'pgName', 'ownerName', 'ownerPhone', 'ownerEmail',
      'address', 'city', 'state', 'pincode',
      'sharingOption', 'rent', 'securityDeposit',
      'preferredGender', 'totalRooms', 'availableRooms', 'availableFrom'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Add advertisement to Firebase
    const docId = await addPGAdvertisement({
      pgName: body.pgName,
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      ownerEmail: body.ownerEmail,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      nearbyLandmark: body.nearbyLandmark || '',
      sharingOption: body.sharingOption,
      rent: body.rent,
      securityDeposit: body.securityDeposit,
      foodIncluded: body.foodIncluded || false,
      preferredGender: body.preferredGender,
      amenities: body.amenities || [],
      rules: body.rules || [],
      description: body.description || '',
      images: body.images || [],
      totalRooms: body.totalRooms,
      availableRooms: body.availableRooms,
      availableFrom: body.availableFrom,
    });

    console.log(`✅ Advertisement added successfully with ID: ${docId}`);

    return NextResponse.json({
      success: true,
      message: 'Advertisement submitted successfully! It will be visible after verification.',
      advertisementId: docId,
    });

  } catch (error: any) {
    console.error('❌ Error adding advertisement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add advertisement' },
      { status: 500 }
    );
  }
}

