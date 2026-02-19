import { z } from 'zod';

export const addListingSchema = z.object({
  pgName: z.string().min(2, 'PG name must be at least 2 characters').max(100),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters').max(100),
  ownerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  ownerEmail: z.string().email('Must be a valid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  state: z.string().min(2, 'State must be at least 2 characters').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit pincode'),
  nearbyLandmark: z.string().max(200).optional().default(''),
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

export const searchQuerySchema = z.object({
  location: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s,.\-]+$/, 'Invalid location format'),
});
