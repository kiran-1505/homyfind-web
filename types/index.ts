export type VerificationPlan = 'free' | 'verified' | 'premium';

export interface RoomConfiguration {
  sharingType: number;      // 1 = single, 2 = double, 3 = triple, 4 = four+
  rent: number;             // monthly rent for this config
  securityDeposit: number;  // security deposit for this config
  availableRooms: number;   // rooms available for this config
}

/** Used for ordering: database (Firestore) ads first, then API-sourced listings. */
export type ListingSource = 'firestore' | 'google';

export interface PGListing {
  id: string;
  pgName: string;
  area: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nearbyLandmark: string;
  sharingOption: number;
  rent: number;
  securityDeposit: number;
  images: string[];
  description: string;
  amenities: string[];
  rules: string[];
  foodIncluded: boolean;
  preferredGender: 'Male' | 'Female' | 'Any';
  availableFrom: string;
  totalRooms: number;
  availableRooms: number;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  googleMapsLink?: string;
  verified: boolean;
  roomConfigurations: RoomConfiguration[];
  verificationPlan: VerificationPlan;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  /** When set, used to show database ads first; firestore = high priority. */
  source?: ListingSource;
}

export interface SearchFilters {
  location: string;
  sharingOption: number | null;
  maxRent: number | null;
  gender: 'Male' | 'Female' | 'Any' | null;
  foodIncluded: boolean | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  source?: string;
  sources?: Record<string, number>;
  isRealData?: boolean;
  timestamp?: string;
}

