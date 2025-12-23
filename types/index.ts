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
  rating: number;
  reviewCount: number;
  createdAt: any;
  updatedAt: any;
}

