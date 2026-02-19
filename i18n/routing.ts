import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'kn', 'te', 'ta', 'ml'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
