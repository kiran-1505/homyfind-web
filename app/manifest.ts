import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://find-my-pg.com';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Find My PG - PG, Paying Guest & Hostel Near You',
    short_name: 'Find My PG',
    description: 'Search verified PG accommodations, paying guest rooms, hostels & co-living spaces in Bangalore, Mumbai, Delhi, Pune, Hyderabad & Chennai.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#6366f1',
    background_color: '#f9fafb',
    lang: 'en-IN',
    categories: ['lifestyle', 'travel'],
    icons: [
      {
        src: '/find-my-pg-logo.jpg',
        sizes: 'any',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/find-my-pg-logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
      {
        src: '/find-my-pg-logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
    screenshots: [],
    related_applications: [],
    prefer_related_applications: false,
  };
}
