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
  cityLower?: string;
  state: string;
  pincode: string;
  nearbyLandmark: string;
  sharingOption: number;
  rent: number;
  securityDeposit: number;
  foodIncluded: boolean;
  preferredGender: 'Male' | 'Female' | 'Any';
  amenities: string[];
  rules: string[];
  description: string;
  images: string[];
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
export async function addPGAdvertisement(pgData: Omit<PGAdvertisement, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'cityLower'>): Promise<string> {
  try {
    const advertisementData = {
      ...pgData,
      cityLower: pgData.city.toLowerCase().trim(),
      verified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'pg_advertisements'), advertisementData);
    console.log('PG Advertisement added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding PG advertisement:', error);
    throw new Error(`Failed to add advertisement: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search PG advertisements in Firebase by city/location
 */
export async function searchPGAdvertisements(city: string): Promise<PGAdvertisement[]> {
  try {
    const cityLower = city.toLowerCase().trim();
    console.log(`Searching Firebase for PG ads in: ${city}`);

    // Query using cityLower for case-insensitive search.
    // Falls back to exact city match for older documents without cityLower field.
    const q = query(
      collection(db, 'pg_advertisements'),
      where('cityLower', '==', cityLower)
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
        cityLower: data.cityLower,
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

    // If no results with cityLower, try exact city match for legacy documents
    if (advertisements.length === 0) {
      const legacyQ = query(
        collection(db, 'pg_advertisements'),
        where('city', '==', city)
      );
      const legacySnapshot = await getDocs(legacyQ);
      legacySnapshot.forEach((doc) => {
        const data = doc.data();
        advertisements.push({
          id: doc.id,
          pgName: data.pgName,
          ownerName: data.ownerName,
          ownerPhone: data.ownerPhone,
          ownerEmail: data.ownerEmail,
          address: data.address,
          city: data.city,
          cityLower: data.cityLower,
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
    }

    console.log(`Found ${advertisements.length} Firebase advertisements for ${city}`);
    return advertisements;
  } catch (error) {
    console.error('Error searching Firebase advertisements:', error);
    throw new Error(`Firebase search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        pgName: data.pgName,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        address: data.address,
        city: data.city,
        cityLower: data.cityLower,
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

    return advertisements;
  } catch (error) {
    console.error('Error getting all advertisements:', error);
    throw new Error(`Failed to fetch advertisements: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
