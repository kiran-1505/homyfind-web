import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Find My PG - Find PG, Paying Guest & Hostel Near You in India',
    template: '%s | Find My PG',
  },
  description: 'Find My PG helps you search verified PG accommodations, paying guest rooms, hostels & co-living spaces in Bangalore, Mumbai, Delhi, Pune, Hyderabad & Chennai. Compare prices, amenities & book today.',
  keywords: [
    'find my pg', 'find pg', 'pg near me', 'paying guest', 'pg accommodation',
    'pg in bangalore', 'pg in mumbai', 'pg in delhi', 'pg in pune', 'pg in hyderabad', 'pg in chennai',
    'boys pg', 'girls pg', 'co-living', 'hostel near me', 'rooms for rent',
    'pg with food', 'single room pg', 'shared room pg', 'affordable pg',
    'find-my-pg', 'findmypg', 'pg finder', 'pg search',
    'paying guest near me', 'pg accommodation near me',
  ],
  metadataBase: new URL('https://find-my-pg.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'hi': '/hi',
      'kn': '/kn',
      'te': '/te',
      'ta': '/ta',
      'ml': '/ml',
    },
  },
  openGraph: {
    title: 'Find My PG - Find PG, Paying Guest & Hostel Near You in India',
    description: 'Search verified PG accommodations across Bangalore, Mumbai, Delhi, Pune, Hyderabad & Chennai. Compare prices, amenities & move in today.',
    url: 'https://find-my-pg.com',
    siteName: 'Find My PG',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find My PG - PG, Paying Guest & Hostel Finder in India',
    description: 'Search verified PG accommodations across major Indian cities. Compare prices, amenities & book today.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6471889682951602"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Find My PG',
              alternateName: ['Find-My-PG', 'FindMyPG', 'Find My PG India'],
              url: 'https://find-my-pg.com',
              description: 'Find verified PG accommodations, paying guest rooms, hostels & co-living spaces across major Indian cities.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://find-my-pg.com/?location={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Find My PG',
              url: 'https://find-my-pg.com',
              logo: 'https://find-my-pg.com/find-my-pg-logo.jpg',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'homyfind@gmail.com',
                contactType: 'customer service',
              },
            }),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
