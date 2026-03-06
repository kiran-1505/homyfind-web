import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Find-My-PG',
    short_name: 'Find-My-PG',
    description: 'Search and discover PG accommodations across major Indian cities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#6366F1',
    icons: [
      {
        src: '/find-my-pg-logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/find-my-pg-logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
