import { z } from 'zod';

export const roomConfigurationSchema = z.object({
  sharingType: z.number().int().min(1).max(4),
  rent: z.number().int().min(1000, 'Rent must be at least 1,000').max(100000),
  securityDeposit: z.number().int().min(0).max(500000),
  availableRooms: z.number().int().min(0).max(1000),
});

export const addListingSchema = z.object({
  pgName: z.string().min(2, 'PG name must be at least 2 characters').max(100),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters').max(100),
  ownerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  ownerEmail: z.string().email('Must be a valid email address').optional().or(z.literal('')).default(''),
  area: z.string().min(2, 'Area must be at least 2 characters').max(200),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  state: z.string().min(2, 'State must be at least 2 characters').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit pincode'),
  nearbyLandmark: z.string().max(200).optional().default(''),
  googleMapsLink: z.string().url('Must be a valid URL').optional().or(z.literal('')).default(''),
  // Room configurations — array of sharing/rent combos
  roomConfigurations: z.array(roomConfigurationSchema).min(1, 'At least one room configuration is required'),
  // Legacy single fields — derived from roomConfigurations for backward compat
  sharingOption: z.number().int().min(1).max(4),
  rent: z.number().int().min(1000, 'Rent must be at least 1,000').max(100000),
  securityDeposit: z.number().int().min(0).max(500000),
  foodIncluded: z.boolean().optional().default(false),
  preferredGender: z.enum(['Male', 'Female', 'Any']),
  amenities: z.array(z.string()).optional().default([]),
  rules: z.array(z.string()).optional().default([]),
  description: z.string().max(2000).optional().default(''),
  images: z.array(z.string().url()).optional().default([]),
  totalRooms: z.number().int().min(1, 'Must have at least 1 room').max(1000),
  availableRooms: z.number().int().min(0).max(1000),
  availableFrom: z.string().refine(val => !isNaN(Date.parse(val)), 'Must be a valid date'),
});

// Search query schema — allows Unicode for Indian language scripts (Hindi, Kannada, Telugu, Tamil, Malayalam)
// Using RegExp constructor to avoid es5 target limitation on the 'u' flag in regex literals
const unicodeLocationRegex = new RegExp('^[\\p{L}\\p{N}\\s,.\\-]+$', 'u');
export const searchQuerySchema = z.object({
  location: z.string().min(1).max(100).regex(unicodeLocationRegex, 'Invalid location format'),
});

export const updateListingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number').optional(),
  email: z.string().email('Must be a valid email address').optional(),
  updates: z.object({
    description: z.string().max(2000).optional(),
    images: z.array(z.string().url('Each image must be a valid URL')).optional(),
    amenities: z.array(z.string()).optional(),
    roomConfigurations: z.array(roomConfigurationSchema).min(1).optional(),
    foodIncluded: z.boolean().optional(),
    availableRooms: z.number().int().min(0).max(1000).optional(),
    availableFrom: z.string().refine(val => !isNaN(Date.parse(val)), 'Must be a valid date').optional(),
    rules: z.array(z.string()).optional(),
    rent: z.number().int().min(1000).max(100000).optional(),
    securityDeposit: z.number().int().min(0).max(500000).optional(),
    sharingOption: z.number().int().min(1).max(4).optional(),
    totalRooms: z.number().int().min(1).max(1000).optional(),
    preferredGender: z.enum(['Male', 'Female', 'Any']).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field must be updated'),
});
