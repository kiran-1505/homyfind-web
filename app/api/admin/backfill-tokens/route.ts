import { NextRequest, NextResponse } from 'next/server';
import { backfillSearchTokens } from '@/lib/firestore';
import { verifyAdminKey } from '@/lib/auth-server';

/**
 * POST /api/admin/backfill-tokens
 * One-time migration: adds searchTokens to existing Firestore documents
 * so area-level search (Koramangala, HSR Layout, etc.) works.
 *
 * Protected: requires ADMIN_API_KEY in Authorization header.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    if (!verifyAdminKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updated = await backfillSearchTokens();
    return NextResponse.json({
      success: true,
      message: `Backfilled searchTokens for ${updated} documents`,
      updated,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json(
      { success: false, error: 'Backfill failed' },
      { status: 500 }
    );
  }
}
