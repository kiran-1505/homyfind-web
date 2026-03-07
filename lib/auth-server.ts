/**
 * Server-side authentication verification for API routes.
 * Uses Firebase Admin SDK to properly verify ID token signatures.
 */
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getAdminAuthInstance } from '@/lib/firebase-admin';

export interface VerifiedUser {
  uid: string;
  phone: string | null;
  email: string | null;
}

/**
 * Verify a Firebase ID token from the Authorization header using Admin SDK.
 * Returns the verified user info or null if invalid.
 */
export async function verifyAuthToken(request: NextRequest): Promise<VerifiedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.slice(7);
    if (!idToken) return null;

    const decodedToken = await getAdminAuthInstance().verifyIdToken(idToken);

    // Extract phone number (remove +91 prefix for 10-digit format)
    let phone: string | null = null;
    if (decodedToken.phone_number) {
      phone = decodedToken.phone_number.replace(/^\+91/, '');
    }

    return {
      uid: decodedToken.uid,
      phone,
      email: decodedToken.email || null,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify admin API key from Authorization header.
 * Uses timing-safe comparison to prevent timing attacks.
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

  const provided = authHeader.slice(7);
  const keyBuf = Buffer.from(adminKey, 'utf8');
  const providedBuf = Buffer.from(provided, 'utf8');
  if (keyBuf.length !== providedBuf.length) return false;

  return crypto.timingSafeEqual(keyBuf, providedBuf);
}
