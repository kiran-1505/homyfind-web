import { PGListing, ExternalPGListing } from '@/types';
import type { PGAdvertisement } from '@/lib/firestore';

/**
 * Transform a Firebase PGAdvertisement into the canonical PGListing shape.
 */
export function firebaseAdToPGListing(ad: PGAdvertisement): PGListing {
  return {
    id: ad.id || `firebase-${Date.now()}`,
    pgName: ad.pgName,
    address: ad.address,
    city: ad.city,
    state: ad.state,
    pincode: ad.pincode,
    nearbyLandmark: ad.nearbyLandmark,
    sharingOption: ad.sharingOption,
    rent: ad.rent,
    securityDeposit: ad.securityDeposit,
    images: ad.images.length > 0 ? ad.images : [],
    description: ad.description,
    amenities: ad.amenities,
    rules: ad.rules,
    foodIncluded: ad.foodIncluded,
    preferredGender: ad.preferredGender,
    availableFrom: ad.availableFrom,
    totalRooms: ad.totalRooms,
    availableRooms: ad.availableRooms,
    ownerId: 'owner',
    ownerName: ad.ownerName,
    ownerPhone: ad.ownerPhone,
    ownerEmail: ad.ownerEmail,
    verified: ad.verified,
    rating: 4.5,
    reviewCount: 0,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
  };
}

/**
 * Transform an ExternalPGListing (Foursquare/OSM) into the canonical PGListing shape.
 */
export function externalToPGListing(ext: ExternalPGListing): PGListing {
  return {
    id: ext.id,
    pgName: ext.name,
    address: ext.location,
    city: ext.city,
    state: 'India',
    pincode: '',
    nearbyLandmark: ext.location,
    sharingOption: ext.sharingType,
    rent: ext.price,
    securityDeposit: ext.price * 2,
    images: [ext.image],
    description: `${ext.name} - ${ext.amenities.join(', ')}`,
    amenities: ext.amenities,
    rules: [],
    foodIncluded: ext.foodIncluded,
    preferredGender: ext.gender,
    availableFrom: new Date().toISOString(),
    totalRooms: 10,
    availableRooms: Math.floor(Math.random() * 5) + 1,
    ownerId: 'owner',
    ownerName: 'Contact via listing',
    ownerPhone: ext.phone || '',
    ownerEmail: '',
    verified: true,
    rating: ext.rating,
    reviewCount: ext.reviews,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
