import { PGListing } from '@/types';
import { MOCK_PG_NAMES, MOCK_LANDMARKS, SHARING_BASE_PRICES } from '@/constants';

const GENDERS: Array<'Male' | 'Female' | 'Any'> = ['Male', 'Female', 'Any'];

export function generateMockData(location: string, count: number): PGListing[] {
  return Array.from({ length: count }, (_, i) => {
    const sharingOption = [1, 2, 3, 4][i % 4];
    const baseRent = SHARING_BASE_PRICES[sharingOption] || 8000;

    return {
      id: `mock-${Date.now()}-${i}`,
      pgName: MOCK_PG_NAMES[i % MOCK_PG_NAMES.length] + ` - ${location}`,
      area: `Sector ${i + 1}`,
      address: `Sector ${i + 1}, ${location}`,
      city: location,
      state: 'India',
      pincode: `${560000 + i}`,
      nearbyLandmark: MOCK_LANDMARKS[i % MOCK_LANDMARKS.length],
      sharingOption,
      rent: baseRent + (i * 500),
      securityDeposit: (baseRent + (i * 500)) * 2,
      roomConfigurations: i % 3 === 0
        ? [
            { sharingType: 2, rent: baseRent + (i * 500), securityDeposit: (baseRent + (i * 500)) * 2, availableRooms: 3 },
            { sharingType: 1, rent: baseRent + (i * 500) + 4000, securityDeposit: (baseRent + (i * 500) + 4000) * 2, availableRooms: 2 },
          ]
        : [
            { sharingType: sharingOption, rent: baseRent + (i * 500), securityDeposit: (baseRent + (i * 500)) * 2, availableRooms: Math.floor(Math.random() * 5) + 1 },
          ],
      images: [`https://picsum.photos/seed/${location}${i}/800/600`],
      description: `${sharingOption} sharing PG in ${location}. Clean, safe, and comfortable.`,
      amenities: ['WiFi', 'AC', 'Laundry', 'Security'],
      rules: ['No smoking', 'Visitors allowed till 9 PM'],
      foodIncluded: i % 2 === 0,
      preferredGender: GENDERS[i % 3],
      availableFrom: new Date().toISOString(),
      totalRooms: 10,
      availableRooms: Math.floor(Math.random() * 5) + 1,
      ownerId: `owner-${i}`,
      ownerName: `Owner ${i + 1}`,
      ownerPhone: `+91 98765${43210 + i}`,
      ownerEmail: `owner${i}@example.com`,
      verified: false,
      verificationPlan: 'free' as const,
      rating: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
