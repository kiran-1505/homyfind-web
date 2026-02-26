export type VerificationPlan = 'free' | 'verified' | 'premium';

export interface PGListing {
  id: string;
  pgName: string;
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
  ownerPhone: string;
  ownerEmail: string;
  verified: boolean;
  verificationPlan: VerificationPlan;
  rating: number;
  reviewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
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

export interface ExternalPGListing {
  id: string;
  name: string;
  location: string;
  city: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  amenities: string[];
  sharingType: number;
  gender: 'Male' | 'Female' | 'Any';
  foodIncluded: boolean;
  phone?: string;
  link: string;
}
