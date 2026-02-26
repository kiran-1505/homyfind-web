import { NextRequest, NextResponse } from 'next/server';
import { getListingsByOwnerPhone, getListingsByOwnerEmail, getListingsByOwnerId } from '@/lib/firestore';
import type { PGAdvertisement } from '@/lib/firestore';
import { verifyAuthToken } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const seenIds = new Set<string>();
    const listings: PGAdvertisement[] = [];

    const addUnique = (ad: PGAdvertisement) => {
      if (ad.id && !seenIds.has(ad.id)) {
        seenIds.add(ad.id);
        listings.push(ad);
      }
    };

    // 1. Fetch by ownerId first (listings created while logged in)
    try {
      const byUid = await getListingsByOwnerId(user.uid);
      byUid.forEach(addUnique);
    } catch (e) {
      console.warn('getListingsByOwnerId failed:', e);
    }

    // 2. Also fetch by phone so we find listings created with same number (before login or legacy)
    if (user.phone) {
      try {
        const byPhone = await getListingsByOwnerPhone(user.phone);
        byPhone.forEach(addUnique);
      } catch (e) {
        console.warn('getListingsByOwnerPhone failed:', e);
      }
    }

    // 3. Also fetch by email
    if (user.email) {
      try {
        const byEmail = await getListingsByOwnerEmail(user.email);
        byEmail.forEach(addUnique);
      } catch (e) {
        console.warn('getListingsByOwnerEmail failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    console.error('Error fetching owner listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
