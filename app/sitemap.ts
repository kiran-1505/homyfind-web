import type { MetadataRoute } from 'next';

const BASE_URL = 'https://find-my-pg.com';

const cities = [
  'bangalore', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'hi', 'kn', 'te', 'ta', 'ml'];
  const staticPages = ['', '/about', '/contact', '/privacy', '/terms', '/login', '/add-listing'];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // City-specific landing hints (for search engines to associate cities with the site)
  for (const city of cities) {
    entries.push({
      url: `${BASE_URL}/?location=${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  return entries;
}
