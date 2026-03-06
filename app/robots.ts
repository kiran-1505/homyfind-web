import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/add-listing/'],
      },
    ],
    sitemap: 'https://find-my-pg.com/sitemap.xml',
  };
}
