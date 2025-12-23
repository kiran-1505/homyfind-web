import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export interface PGAdvertisement {
  id?: string;
  pgName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nearbyLandmark: string;
  sharingOption: number; // 1, 2, 3, or 4 sharing
  rent: number;
  securityDeposit: number;
  foodIncluded: boolean;
  preferredGender: 'Male' | 'Female' | 'Any';
  amenities: string[];
  rules: string[];
  description: string;
  images: string[]; // URLs
  totalRooms: number;
  availableRooms: number;
  availableFrom: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Add a new PG advertisement to Firebase
 */
export async function addPGAdvertisement(pgData: Omit<PGAdvertisement, 'id' | 'createdAt' | 'updatedAt' | 'verified'>): Promise<string> {
  try {
    const advertisementData = {
      ...pgData,
      verified: false, // New advertisements need verification
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'pg_advertisements'), advertisementData);
    console.log('✅ PG Advertisement added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding PG advertisement:', error);
    throw new Error(`Failed to add advertisement: ${error.message}`);
  }
}

/**
 * Search PG advertisements in Firebase by city/location
 */
export async function searchPGAdvertisements(city: string): Promise<PGAdvertisement[]> {
  try {
    const cityLower = city.toLowerCase().trim();
    console.log(`🔍 Searching Firebase for PG ads in: ${city}`);

    const q = query(
      collection(db, 'pg_advertisements'),
      where('city', '==', city)
    );

    const querySnapshot = await getDocs(q);
    const advertisements: PGAdvertisement[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      advertisements.push({
        id: doc.id,
        pgName: data.pgName,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        nearbyLandmark: data.nearbyLandmark,
        sharingOption: data.sharingOption,
        rent: data.rent,
        securityDeposit: data.securityDeposit,
        foodIncluded: data.foodIncluded,
        preferredGender: data.preferredGender,
        amenities: data.amenities || [],
        rules: data.rules || [],
        description: data.description,
        images: data.images || [],
        totalRooms: data.totalRooms,
        availableRooms: data.availableRooms,
        availableFrom: data.availableFrom,
        verified: data.verified || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    console.log(`✅ Found ${advertisements.length} Firebase advertisements for ${city}`);
    return advertisements;
  } catch (error: any) {
    console.error('❌ Error searching Firebase advertisements:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get all PG advertisements (for admin/listing page)
 */
export async function getAllPGAdvertisements(): Promise<PGAdvertisement[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'pg_advertisements'));
    const advertisements: PGAdvertisement[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      advertisements.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as PGAdvertisement);
    });

    return advertisements;
  } catch (error: any) {
    console.error('❌ Error getting all advertisements:', error);
    return [];
  }
}

