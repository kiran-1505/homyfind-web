import { collection, addDoc, query, where, getDocs, getDoc, Timestamp, doc, updateDoc, limit as firestoreLimit, type Firestore } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, getFirebaseAuth } from './firebase';
import type { RoomConfiguration } from '@/types';

/**
 * Get the Firestore instance, throwing a clear error if not initialized.
 */
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not initialized. Check your Firebase environment variables.');
  }
  return db;
}

/** Returns Firestore or null so search can fail gracefully and other sources still work. */
function getDbOrNull(): Firestore | null {
  return db;
}

/**
 * Ensure Firebase Auth is initialized (anonymous sign-in as fallback).
 * If anonymous auth is disabled in Firebase Console, this silently continues
 * since Firestore rules may allow unauthenticated reads.
 *
 * Uses a simple lock to prevent concurrent anonymous sign-in race conditions.
 */
let authPromise: Promise<void> | null = null;
let authWarningShown = false;

async function ensureAuth(): Promise<void> {
  // If there's already an auth attempt in progress, wait for it
  if (authPromise) {
    await authPromise;
    return;
  }

  try {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      authPromise = signInAnonymously(auth).then(() => {});
      await authPromise;
    }
  } catch (error) {
    // Only log once to avoid spamming the console on every request
    if (!authWarningShown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/admin-restricted-operation') {
        console.warn('[Firestore] Anonymous auth is DISABLED in Firebase Console. Enable it at: Firebase Console > Authentication > Sign-in method > Anonymous. Proceeding without auth.');
      } else {
        console.warn('[Firestore] ensureAuth failed:', code || error);
      }
      authWarningShown = true;
    }
    // Continue anyway — Firestore rules may allow unauthenticated access
  } finally {
    authPromise = null;
  }
}

export interface PGAdvertisement {
  id?: string;
  pgName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  area: string;
  address: string;
  city: string;
  cityLower?: string;
  state: string;
  pincode: string;
  nearbyLandmark: string;
  sharingOption: number;
  rent: number;
  securityDeposit: number;
  roomConfigurations: RoomConfiguration[];
  foodIncluded: boolean;
  preferredGender: 'Male' | 'Female' | 'Any';
  amenities: string[];
  rules: string[];
  description: string;
  images: string[];
  totalRooms: number;
  availableRooms: number;
  availableFrom: string;
  ownerId?: string;
  googleMapsLink?: string;
  verified: boolean;
  verificationPlan: 'free' | 'verified' | 'premium';
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper: parse roomConfigurations from Firestore document data
 * Handles backward compatibility for old docs without roomConfigurations
 */
function parseRoomConfigurations(data: Record<string, unknown>): RoomConfiguration[] {
  if (Array.isArray(data.roomConfigurations) && data.roomConfigurations.length > 0) {
    return data.roomConfigurations;
  }
  // Backward compat: build single config from legacy fields
  return [{
    sharingType: (data.sharingOption as number) || 2,
    rent: (data.rent as number) || 0,
    securityDeposit: (data.securityDeposit as number) || 0,
    availableRooms: (data.availableRooms as number) || 0,
  }];
}

/**
 * Helper: map a Firestore document to PGAdvertisement
 */
function docToPGAdvertisement(docId: string, data: Record<string, unknown>): PGAdvertisement {
  const roomConfigurations = parseRoomConfigurations(data);
  return {
    id: docId,
    pgName: data.pgName as string,
    ownerName: data.ownerName as string,
    ownerPhone: data.ownerPhone as string,
    ownerEmail: (data.ownerEmail as string) || '',
    area: (data.area as string) || '',
    address: data.address as string,
    city: data.city as string,
    cityLower: data.cityLower as string | undefined,
    state: data.state as string,
    pincode: data.pincode as string,
    nearbyLandmark: data.nearbyLandmark as string,
    sharingOption: data.sharingOption as number,
    rent: data.rent as number,
    securityDeposit: data.securityDeposit as number,
    roomConfigurations,
    foodIncluded: data.foodIncluded as boolean,
    preferredGender: data.preferredGender as 'Male' | 'Female' | 'Any',
    amenities: (data.amenities as string[]) || [],
    rules: (data.rules as string[]) || [],
    description: data.description as string,
    images: (data.images as string[]) || [],
    totalRooms: data.totalRooms as number,
    availableRooms: data.availableRooms as number,
    availableFrom: data.availableFrom as string,
    ownerId: data.ownerId as string | undefined,
    googleMapsLink: (data.googleMapsLink as string) || undefined,
    verified: (data.verified as boolean) || false,
    verificationPlan: (data.verificationPlan as 'free' | 'verified' | 'premium') || ((data.verified as boolean) ? 'verified' : 'free'),
    createdAt: (data.createdAt as { toDate: () => Date })?.toDate?.() || new Date(),
    updatedAt: (data.updatedAt as { toDate: () => Date })?.toDate?.() || new Date(),
  };
}

/**
 * Build searchTokens array from listing fields for area-level and name search.
 * Tokens include city, area, address, nearby landmark, and pgName words.
 */
function buildSearchTokens(
  city: string,
  area: string,
  address: string,
  nearbyLandmark: string,
  pgName?: string
): string[] {
  const tokens = new Set<string>();

  // Add city and its aliases
  const cityLower = city.toLowerCase().trim();
  if (cityLower) tokens.add(cityLower);
  const aliases = CITY_ALIASES[cityLower] || [];
  for (const alias of aliases) tokens.add(alias);

  // Add area (e.g. "Koramangala", "HSR Layout", "Electronic City")
  if (area) {
    const areaLower = area.toLowerCase().trim();
    tokens.add(areaLower);
    const areaParts = areaLower.split(/[\s,]+/).filter(t => t.length >= 2);
    for (const part of areaParts) tokens.add(part);
  }

  // Add PG name words so searching by name finds the listing
  if (pgName) {
    const nameParts = pgName.toLowerCase().split(/[\s,]+/).map(t => t.trim()).filter(t => t.length >= 2);
    for (const part of nameParts) tokens.add(part);
    const nameLower = pgName.toLowerCase().trim();
    if (nameLower.length >= 2) tokens.add(nameLower);
  }

  // Tokenize address
  const addressParts = address.toLowerCase().split(/[\s,]+/).map(t => t.trim()).filter(t => t.length >= 2);
  for (const part of addressParts) tokens.add(part);
  const addressSegments = address.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length >= 2);
  for (const seg of addressSegments) tokens.add(seg);

  // Tokenize nearby landmark
  if (nearbyLandmark) {
    const landmarkParts = nearbyLandmark.toLowerCase().split(/[\s,]+/).map(t => t.trim()).filter(t => t.length >= 2);
    for (const part of landmarkParts) tokens.add(part);
    const landmarkLower = nearbyLandmark.toLowerCase().trim();
    if (landmarkLower.length >= 2) tokens.add(landmarkLower);
  }

  // Remove common noise words
  const noise = new Set(['pg', 'in', 'at', 'the', 'for', 'and', 'or', 'no', 'near', 'of', 'to']);
  return Array.from(tokens).filter(t => !noise.has(t));
}

/**
 * Add a new PG advertisement to Firebase
 */
export async function addPGAdvertisement(pgData: Omit<PGAdvertisement, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'verificationPlan' | 'cityLower'>): Promise<string> {
  try {
    await ensureAuth();

    const advertisementData = {
      ...pgData,
      cityLower: pgData.city.toLowerCase().trim(),
      areaLower: (pgData.area || '').toLowerCase().trim(),
      searchTokens: buildSearchTokens(pgData.city, pgData.area, pgData.address, pgData.nearbyLandmark, pgData.pgName),
      verified: false,
      verificationPlan: 'free' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(getDb(), 'pg_advertisements'), advertisementData);
    console.log('PG Advertisement added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding PG advertisement:', error);
    throw new Error(`Failed to add advertisement: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Indian city alias map — searches for one name also look for the other.
 */
const CITY_ALIASES: Record<string, string[]> = {
  bangalore: ['bengaluru'],
  bengaluru: ['bangalore'],
  mumbai: ['bombay'],
  bombay: ['mumbai'],
  chennai: ['madras'],
  madras: ['chennai'],
  kolkata: ['calcutta'],
  calcutta: ['kolkata'],
  kochi: ['cochin'],
  cochin: ['kochi'],
  varanasi: ['benaras', 'banaras'],
  benaras: ['varanasi'],
  banaras: ['varanasi'],
  thiruvananthapuram: ['trivandrum'],
  trivandrum: ['thiruvananthapuram'],
  puducherry: ['pondicherry'],
  pondicherry: ['puducherry'],
  gurugram: ['gurgaon'],
  gurgaon: ['gurugram'],
  pune: ['poona'],
  poona: ['pune'],
};

/**
 * Search PG advertisements in Firebase by city/location/area.
 * Search strategy (in order):
 *   1. Exact `cityLower` match + city aliases (Bangalore<>Bengaluru, etc.)
 *   2. `searchTokens` array-contains for area-level search (Koramangala, HSR Layout, etc.)
 *   3. Legacy `city` field fallback for older documents
 */
export async function searchPGAdvertisements(location: string): Promise<PGAdvertisement[]> {
  const searchLower = location.toLowerCase().trim();
  console.log(`[Firestore] Searching for PG ads (normalized: "${searchLower}")`);

  const database = getDbOrNull();
  if (!database) {
    console.error('[Firestore] Not initialized - check NEXT_PUBLIC_FIREBASE_* env vars. Returning no results.');
    return [];
  }

  try {
    // Auth is required for Firestore reads when security rules need request.auth != null.
    // Force auth and fail loudly so we know when it breaks.
    try {
      await ensureAuth();
    } catch (authErr) {
      console.error('[Firestore] ensureAuth FAILED for search — reads will likely be blocked:', authErr);
    }

    const seenIds = new Set<string>();
    const advertisements: PGAdvertisement[] = [];
    let queryErrors = 0;

    const addUnique = (ad: PGAdvertisement) => {
      if (ad.id && !seenIds.has(ad.id)) {
        seenIds.add(ad.id);
        advertisements.push(ad);
      }
    };

    const col = collection(database, 'pg_advertisements');

    // 1. Primary search on cityLower (exact match)
    try {
      const q = query(col, where('cityLower', '==', searchLower));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
      });
    } catch (err) {
      queryErrors++;
      console.error('[Firestore] cityLower query FAILED:', err);
    }

    // 2. City aliases (e.g. Bangalore <> Bengaluru)
    const aliases = CITY_ALIASES[searchLower] || [];
    for (const alias of aliases) {
      try {
        const aliasQ = query(col, where('cityLower', '==', alias));
        const aliasSnapshot = await getDocs(aliasQ);
        aliasSnapshot.forEach((docSnap) => {
          addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
        });
      } catch (err) {
        queryErrors++;
        console.error('[Firestore] alias query FAILED:', err);
      }
    }

    // 2b. Area-based search (e.g. "Indiranagar", "Koramangala")
    try {
      const areaQ = query(col, where('areaLower', '==', searchLower));
      const areaSnapshot = await getDocs(areaQ);
      areaSnapshot.forEach((docSnap) => {
        addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
      });
    } catch (err) {
      queryErrors++;
      console.error('[Firestore] areaLower query FAILED:', err);
    }

    // 3. Token-based search: area, locality, and PG name (always run so name search works)
    try {
      const tokenQ = query(col, where('searchTokens', 'array-contains', searchLower));
      const tokenSnapshot = await getDocs(tokenQ);
      tokenSnapshot.forEach((docSnap) => {
        addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
      });
    } catch (err) {
      queryErrors++;
      console.error('[Firestore] searchTokens query FAILED:', err);
    }

    // 3b. Multi-word search: try each word as token (e.g. "Sunshine PG" -> "sunshine")
    const words = searchLower.split(/[\s,]+/).filter(w => w.length >= 2);
    for (const word of words) {
      try {
        const wordTokenQ = query(col, where('searchTokens', 'array-contains', word));
        const wordTokenSnap = await getDocs(wordTokenQ);
        wordTokenSnap.forEach((docSnap) => {
          addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
        });
      } catch (err) {
        queryErrors++;
        console.error(`[Firestore] token word "${word}" query FAILED:`, err);
      }
    }

    // 4. Legacy: exact city match for docs without cityLower
    try {
      const legacyQ = query(col, where('city', '==', location));
      const legacySnapshot = await getDocs(legacyQ);
      legacySnapshot.forEach((docSnap) => {
        addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
      });
      for (const alias of aliases) {
        const titleAlias = alias.charAt(0).toUpperCase() + alias.slice(1);
        const legacyAliasQ = query(col, where('city', '==', titleAlias));
        const legacyAliasSnapshot = await getDocs(legacyAliasQ);
        legacyAliasSnapshot.forEach((docSnap) => {
          addUnique(docToPGAdvertisement(docSnap.id, docSnap.data()));
        });
      }
    } catch (err) {
      queryErrors++;
      console.error('[Firestore] legacy city query FAILED:', err);
    }

    if (queryErrors > 0) {
      console.error(`[Firestore] WARNING: ${queryErrors} queries failed! Check Firestore security rules & auth. Found ${advertisements.length} ads despite errors.`);
    }
    console.log(`[Firestore] Found ${advertisements.length} advertisements`);
    return advertisements;
  } catch (error) {
    console.error('[Firestore] Search failed (returning []):', error);
    return [];
  }
}

/**
 * Backfill searchTokens for existing documents that don't have them.
 * Call once from an admin route or manually to migrate old data.
 * Processes in batches to avoid memory issues in serverless environments.
 */
export async function backfillSearchTokens(): Promise<number> {
  await ensureAuth();
  const BATCH_SIZE = 100;
  let updated = 0;
  let lastDoc = null;

  // Process in batches
  while (true) {
    let q;
    if (lastDoc) {
      // Note: for simplicity we re-query all and skip — Firestore doesn't have easy cursor-based pagination without orderBy
      break; // Single pass is sufficient for most datasets
    } else {
      q = query(collection(getDb(), 'pg_advertisements'), firestoreLimit(BATCH_SIZE));
    }

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) break;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const needsTokens = !data.searchTokens || !Array.isArray(data.searchTokens) || data.searchTokens.length === 0;
      const area = (data.area as string) || '';
      const needsAreaLower = area && !data.areaLower;
      if (needsTokens || needsAreaLower) {
        const updates: Record<string, unknown> = {};
        if (needsTokens) {
          const tokens = buildSearchTokens(
            (data.city as string) || '',
            area,
            (data.address as string) || '',
            (data.nearbyLandmark as string) || '',
            (data.pgName as string) || ''
          );
          updates.searchTokens = tokens;
          if (!data.cityLower) updates.cityLower = ((data.city as string) || '').toLowerCase().trim();
        }
        if (needsAreaLower) updates.areaLower = area.toLowerCase().trim();
        await updateDoc(doc(getDb(), 'pg_advertisements', docSnap.id), updates);
        updated++;
      }
      lastDoc = docSnap;
    }

    if (querySnapshot.docs.length < BATCH_SIZE) break;
  }

  console.log(`Backfilled searchTokens for ${updated} documents`);
  return updated;
}

/**
 * Get PG advertisements by owner phone number
 */
export async function getListingsByOwnerPhone(phone: string): Promise<PGAdvertisement[]> {
  try {
    const q = query(
      collection(getDb(), 'pg_advertisements'),
      where('ownerPhone', '==', phone)
    );
    const querySnapshot = await getDocs(q);
    const advertisements: PGAdvertisement[] = [];

    querySnapshot.forEach((docSnap) => {
      advertisements.push(docToPGAdvertisement(docSnap.id, docSnap.data()));
    });

    console.log(`Found ${advertisements.length} listings for owner`);
    return advertisements;
  } catch (error) {
    console.error('Error getting listings by owner phone:', error);
    throw new Error(`Failed to fetch owner listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get PG advertisements by owner email
 */
export async function getListingsByOwnerEmail(email: string): Promise<PGAdvertisement[]> {
  try {
    const q = query(
      collection(getDb(), 'pg_advertisements'),
      where('ownerEmail', '==', email)
    );
    const querySnapshot = await getDocs(q);
    const advertisements: PGAdvertisement[] = [];

    querySnapshot.forEach((docSnap) => {
      advertisements.push(docToPGAdvertisement(docSnap.id, docSnap.data()));
    });

    console.log(`Found ${advertisements.length} listings for owner`);
    return advertisements;
  } catch (error) {
    console.error('Error getting listings by owner email:', error);
    throw new Error(`Failed to fetch owner listings by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get PG advertisements by owner Firebase UID (ownerId).
 * Use this when the user is logged in so listings created while authenticated are found.
 */
export async function getListingsByOwnerId(ownerId: string): Promise<PGAdvertisement[]> {
  try {
    await ensureAuth();
    const q = query(
      collection(getDb(), 'pg_advertisements'),
      where('ownerId', '==', ownerId)
    );
    const querySnapshot = await getDocs(q);
    const advertisements: PGAdvertisement[] = [];

    querySnapshot.forEach((docSnap) => {
      advertisements.push(docToPGAdvertisement(docSnap.id, docSnap.data()));
    });

    console.log(`Found ${advertisements.length} listings for owner (uid)`);
    return advertisements;
  } catch (error) {
    console.error('Error getting listings by owner id:', error);
    throw new Error(`Failed to fetch owner listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single PG advertisement by ID
 */
export async function getPGAdvertisementById(id: string): Promise<PGAdvertisement | null> {
  try {
    const docRef = doc(getDb(), 'pg_advertisements', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToPGAdvertisement(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Error getting PG advertisement:', error);
    throw new Error(`Failed to fetch advertisement: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

