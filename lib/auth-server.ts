/**
 * Server-side authentication verification for API routes.
 * Verifies Firebase ID tokens without requiring firebase-admin SDK.
 * Uses the Firebase Auth REST API to validate tokens.
 */
import { NextRequest } from 'next/server';

export interface VerifiedUser {
  uid: string;
  phone: string | null;
  email: string | null;
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the verified user info or null if invalid.
 *
 * Usage in API routes:
 *   const user = await verifyAuthToken(request);
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function verifyAuthToken(request: NextRequest): Promise<VerifiedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (!idToken) return null;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error('Firebase API key not configured for token verification');
      return null;
    }

    // Use Firebase Auth REST API to verify the ID token
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) return null;

    // Extract phone number (remove +91 prefix for 10-digit format)
    let phone: string | null = null;
    if (user.phoneNumber) {
      phone = user.phoneNumber.replace(/^\+91/, '');
    }

    return {
      uid: user.localId,
      phone,
      email: user.email || null,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify admin API key from Authorization header.
 * Used for admin-only endpoints like backfill.
 */
export function verifyAdminKey(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  return authHeader.slice(7) === adminKey;
}
