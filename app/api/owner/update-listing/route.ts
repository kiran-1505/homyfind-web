import { NextRequest, NextResponse } from 'next/server';
import { getPGAdvertisementById } from '@/lib/firestore';
import { verifyAuthToken } from '@/lib/auth-server';
import { updateListingSchema } from '@/lib/validations';

const FIRESTORE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

/**
 * Verify ownership strictly by ownerId (Firebase UID).
 * Phone/email matching was removed to prevent IDOR attacks.
 */
function isOwner(existing: { ownerId?: string }, uid: string): boolean {
  return !!existing.ownerId && existing.ownerId === uid;
}

/**
 * Convert a JS value to Firestore REST API Value format.
 */
function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Update a Firestore document via REST API using the user's ID token.
 * This bypasses the anonymous-auth limitation of the client SDK on the server.
 */
async function firestoreRestUpdate(docPath: string, fields: Record<string, unknown>, idToken: string): Promise<void> {
  const firestoreFields: Record<string, unknown> = {};
  const fieldPaths: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    firestoreFields[key] = toFirestoreValue(value);
    fieldPaths.push(key);
  }

  // Also update updatedAt
  firestoreFields['updatedAt'] = { timestampValue: new Date().toISOString() };
  fieldPaths.push('updatedAt');

  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${docPath}?updateMask.fieldPaths=${fieldPaths.join('&updateMask.fieldPaths=')}`;

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
    console.error('Firestore REST update failed:', response.status, errorBody);
    throw new Error(`Firestore update failed: ${response.status}`);
  }
}

/**
 * Delete a Firestore document via REST API using the user's ID token.
 */
async function firestoreRestDelete(docPath: string, idToken: string): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${docPath}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Firestore REST delete failed:', response.status, errorBody);
    throw new Error(`Firestore delete failed: ${response.status}`);
  }
}

/**
 * Extract the raw ID token from the Authorization header.
 */
function extractIdToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7) || null;
}

/**
 * PATCH — Update specific fields of a listing (with token-based ownership verification)
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

    const idToken = extractIdToken(request);
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, updates } = body;

    if (!listingId || !updates) {
      return NextResponse.json(
        { success: false, error: 'listingId and updates are required' },
        { status: 400 }
      );
    }

    // Verify ownership using authenticated user's identity
    const existing = await getPGAdvertisementById(listingId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (!isOwner(existing, user.uid)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: you do not own this listing' },
        { status: 403 }
      );
    }

    // Validate updates using Zod schema
    const validationInput = {
      listingId,
      ...(user.phone ? { phone: user.phone } : {}),
      ...(user.email ? { email: user.email } : {}),
      updates,
    };

    const result = updateListingSchema.safeParse(validationInput);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    const validatedUpdates = result.data.updates;

    if (Object.keys(validatedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Use Firestore REST API with the user's own ID token
    await firestoreRestUpdate(`pg_advertisements/${listingId}`, validatedUpdates, idToken);

    console.log('Listing updated via REST API:', listingId);

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Delete a listing (with token-based ownership verification)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = extractIdToken(request);
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'listingId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await getPGAdvertisementById(listingId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (!isOwner(existing, user.uid)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: you do not own this listing' },
        { status: 403 }
      );
    }

    // Use Firestore REST API with the user's own ID token
    await firestoreRestDelete(`pg_advertisements/${listingId}`, idToken);

    console.log('Listing deleted via REST API:', listingId);

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
