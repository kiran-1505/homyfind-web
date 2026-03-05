import { PGListing } from '@/types';
import type { PGAdvertisement } from '@/lib/firestore';

/**
 * Transform for PUBLIC responses — strips owner PII (phone/email).
 * Use this for search results and public listing endpoints.
 */
export function firebaseAdToPublicListing(ad: PGAdvertisement): PGListing {
  const listing = firebaseAdToPGListing(ad);
  return {
    ...listing,
    ownerPhone: '',
    ownerEmail: '',
  };
}

/**
 * Transform a Firebase PGAdvertisement into the canonical PGListing shape.
 * WARNING: Includes PII (ownerPhone/ownerEmail). Only use for authenticated owner views.
 */
export function firebaseAdToPGListing(ad: PGAdvertisement): PGListing {
  return {
    id: ad.id || `firebase-${Date.now()}`,
    pgName: ad.pgName,
    area: ad.area || '',
    address: ad.address,
    city: ad.city,
    state: ad.state,
    pincode: ad.pincode,
    nearbyLandmark: ad.nearbyLandmark,
    sharingOption: ad.sharingOption,
    rent: ad.rent,
    securityDeposit: ad.securityDeposit,
    roomConfigurations: ad.roomConfigurations || [{
      sharingType: ad.sharingOption,
      rent: ad.rent,
      securityDeposit: ad.securityDeposit,
      availableRooms: ad.availableRooms,
    }],
    images: ad.images.length > 0 ? ad.images : [],
    description: ad.description,
    amenities: ad.amenities,
    rules: ad.rules,
    foodIncluded: ad.foodIncluded,
    preferredGender: ad.preferredGender,
    availableFrom: ad.availableFrom,
    totalRooms: ad.totalRooms,
    availableRooms: ad.availableRooms,
    ownerId: ad.ownerId || 'unknown',
    ownerName: ad.ownerName,
    ownerPhone: ad.ownerPhone,
    ownerEmail: ad.ownerEmail,
    googleMapsLink: ad.googleMapsLink,
    verified: true,
    verificationPlan: ad.verificationPlan || 'verified',
    rating: ad.rating || 0,
    reviewCount: ad.reviewCount || 0,
    createdAt: typeof ad.createdAt === 'string' ? ad.createdAt : (ad.createdAt instanceof Date ? ad.createdAt.toISOString() : new Date().toISOString()),
    updatedAt: typeof ad.updatedAt === 'string' ? ad.updatedAt : (ad.updatedAt instanceof Date ? ad.updatedAt.toISOString() : new Date().toISOString()),
    source: 'firestore',
  };
}