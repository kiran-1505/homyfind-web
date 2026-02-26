'use client';

import { useState, useEffect, useCallback } from 'react';
import { type User } from 'firebase/auth';
import { onAuthChange, normalizePhone } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Get the current user's Firebase ID token for authenticated API requests.
   * Returns null if not authenticated.
   * Usage: const token = await getIdToken();
   *        fetch('/api/...', { headers: { Authorization: `Bearer ${token}` } })
   */
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user || user.isAnonymous) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  return {
    user,
    loading,
    // Exclude anonymous users (used by lib/storage.ts for image uploads)
    isAuthenticated: !!user && !user.isAnonymous,
    // Normalized 10-digit phone, or null if not phone-auth
    phoneNumber: user?.phoneNumber ? normalizePhone(user.phoneNumber) : null,
    // Email, or null if not email-auth
    email: user?.email || null,
    // Which auth provider was used
    authMethod: user?.phoneNumber ? 'phone' as const : user?.email ? 'email' as const : null,
    // Get Firebase ID token for authenticated API requests
    getIdToken,
  };
}
