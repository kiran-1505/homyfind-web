import type { SearchFilters } from '@/types';

// Pagination
export const LISTINGS_PER_PAGE = 21;

// Defaults
export const DEFAULT_LOCATION = 'Bangalore';
export const DEFAULT_STATE = 'Karnataka';

// Form steps
export const ADD_LISTING_STEPS = ['PG Details', 'Location', 'Pricing', 'Amenities & Photos'] as const;

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

// Mock data for fallback
export const MOCK_PG_NAMES = [
  'Sunshine PG', 'Royal Residency', 'Green Valley PG', 'Comfort Zone',
  'Happy Homes PG', 'Elite Stay', 'Urban Nest', 'Cozy Corner PG',
  'Paradise Living', 'Smart Stay PG', 'Premium PG', 'Golden Residency',
  'Maple House PG', 'Crystal Homes', 'Silver Oak PG', 'Zenith Living',
  'Orchid Residency', 'Horizon PG', 'Nest Inn PG', 'Haven Stay',
  'Bliss PG', 'Metro Living PG', 'Ivy Residency', 'Star PG',
  'Cloud Nine PG', 'Tranquil Stay', 'Amber House PG', 'Vista PG',
  'Emerald Living', 'Summit PG',
];

export const MOCK_LANDMARKS = [
  'Near Metro Station', 'Close to Tech Park', 'Near University',
  'Shopping Mall Nearby', 'Bus Stop 2 mins', 'Market Area',
];

// House rules master list
export const RULES_LIST = [
  'No Smoking', 'No Drinking', 'No Visitors After 10 PM',
  'Gate Closes at 11 PM', 'No Loud Music After 10 PM', 'No Pets',
  'ID Proof Required', 'Rent Due by 5th', '1 Month Notice to Vacate',
  'Maintain Cleanliness', 'No Non-Veg Cooking', 'No Opposite Gender Visitors',
] as const;

// Rule English name -> translation key mapping
export const RULE_KEYS: Record<string, string> = {
  'No Smoking': 'noSmoking',
  'No Drinking': 'noDrinking',
  'No Visitors After 10 PM': 'noVisitorsAfter10',
  'Gate Closes at 11 PM': 'gateCloses11',
  'No Loud Music After 10 PM': 'noLoudMusic',
  'No Pets': 'noPets',
  'ID Proof Required': 'idProofRequired',
  'Rent Due by 5th': 'rentDueBy5th',
  '1 Month Notice to Vacate': 'oneMonthNotice',
  'Maintain Cleanliness': 'maintainCleanliness',
  'No Non-Veg Cooking': 'noNonVegCooking',
  'No Opposite Gender Visitors': 'noOppositeGenderVisitors',
};

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
export const ADD_LISTING_STEP_KEYS = ['pgDetails', 'location', 'pricing', 'amenitiesPhotos'] as const;

// Image upload limits
export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Empty filters for reset
export const EMPTY_FILTERS: SearchFilters = {
  location: '',
  sharingOption: null,
  maxRent: null,
  gender: null,
  foodIncluded: null,
};
