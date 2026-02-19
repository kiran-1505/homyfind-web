import type { SearchFilters } from '@/types';

// Pagination
export const LISTINGS_PER_PAGE = 21;

// Defaults
export const DEFAULT_LOCATION = 'Bangalore';
export const DEFAULT_STATE = 'Karnataka';

// Form steps
export const ADD_LISTING_STEPS = ['PG Details', 'Location', 'Pricing', 'Amenities'] as const;

// Amenities master list
export const AMENITIES_LIST = [
  'WiFi', 'AC', 'TV', 'Washing Machine', 'Fridge', 'Microwave',
  'Parking', 'CCTV', 'Security Guard', 'Power Backup', 'Water Purifier',
  'Laundry Service', 'Housekeeping', 'Gym',
] as const;

// Rent bracket options for filters
export const RENT_BRACKETS = [
  { value: 5000, label: 'Under 5,000' },
  { value: 8000, label: 'Under 8,000' },
  { value: 10000, label: 'Under 10,000' },
  { value: 15000, label: 'Under 15,000' },
  { value: 20000, label: 'Under 20,000' },
] as const;

// Sharing options
export const SHARING_OPTIONS = [
  { value: 1, label: 'Single' },
  { value: 2, label: 'Double' },
  { value: 3, label: 'Triple' },
  { value: 4, label: 'Four+' },
] as const;

// Gender options
export const GENDER_OPTIONS = ['Male', 'Female', 'Any'] as const;

// Cache settings
export const GOOGLE_MAPS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Pricing defaults for generated/transformed listings
export const BASE_PRICE = 8000;
export const PRICE_VARIANCE = 7000;
export const SHARING_BASE_PRICES: Record<number, number> = {
  1: 12000,
  2: 8000,
  3: 6000,
  4: 5000,
};

// City neighborhoods for fallback data
export const CITY_NEIGHBORHOODS: Record<string, string[]> = {
  bangalore: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Electronic City', 'BTM Layout', 'Marathahalli', 'JP Nagar'],
  mumbai: ['Andheri', 'Bandra', 'Powai', 'Thane', 'Goregaon', 'Malad', 'Borivali', 'Kandivali'],
  delhi: ['South Ex', 'Saket', 'Dwarka', 'Rohini', 'Laxmi Nagar', 'Pitampura', 'Janakpuri', 'Karol Bagh'],
  pune: ['Hinjewadi', 'Wakad', 'Kharadi', 'Viman Nagar', 'Aundh', 'Baner', 'Kothrud', 'Hadapsar'],
};

// Mock data for fallback
export const MOCK_PG_NAMES = [
  'Sunshine PG', 'Royal Residency', 'Green Valley PG', 'Comfort Zone',
  'Happy Homes PG', 'Elite Stay', 'Urban Nest', 'Cozy Corner PG',
  'Paradise Living', 'Smart Stay PG', 'Premium PG', 'Golden Residency',
];

export const MOCK_LANDMARKS = [
  'Near Metro Station', 'Close to Tech Park', 'Near University',
  'Shopping Mall Nearby', 'Bus Stop 2 mins', 'Market Area',
];

// Amenity English name -> translation key mapping
export const AMENITY_KEYS: Record<string, string> = {
  'WiFi': 'wifi',
  'AC': 'ac',
  'TV': 'tv',
  'Washing Machine': 'washingMachine',
  'Fridge': 'fridge',
  'Microwave': 'microwave',
  'Parking': 'parking',
  'CCTV': 'cctv',
  'Security Guard': 'securityGuard',
  'Power Backup': 'powerBackup',
  'Water Purifier': 'waterPurifier',
  'Laundry Service': 'laundryService',
  'Housekeeping': 'housekeeping',
  'Gym': 'gym',
  'Security': 'security',
};

// Rent bracket value -> translation key mapping
export const RENT_BRACKET_KEYS: Record<number, string> = {
  5000: 'under5000',
  8000: 'under8000',
  10000: 'under10000',
  15000: 'under15000',
  20000: 'under20000',
};

// Add listing step translation keys
export const ADD_LISTING_STEP_KEYS = ['pgDetails', 'location', 'pricing', 'amenities'] as const;

// Empty filters for reset
export const EMPTY_FILTERS: SearchFilters = {
  location: '',
  sharingOption: null,
  maxRent: null,
  gender: null,
  foodIncluded: null,
};
