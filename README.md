# 🏠 HomyFind - Find Your Perfect PG

> A modern, real-time PG (Paying Guest) accommodation search platform built with Next.js, Firebase, and Google Maps API. Multi-language support for Indian languages.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### 🌐 Multi-Language (i18n)
- **6 Indian languages** – English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), Malayalam (മലയാളം)
- **next-intl** – Locale routing with `as-needed` prefix (default English has no URL prefix)
- **Language switcher** – In-header dropdown to change language
- **Translated UI** – All labels, filters, forms, and messages in `messages/*.json`

### 🔍 Smart Search
- **Real-time Google Maps Integration** – Fetch live PG listings from Google Maps
- **Firebase Firestore Storage** – User-submitted PG advertisements
- **Advanced Filtering** – Filter by rent, sharing type, gender, food inclusion
- **Pagination** – Browse through unlimited listings (21 per page, configurable in `constants`)

### 🏠 Listing Management
- **Detailed PG Pages** – Photo galleries (carousel), amenities, contact details, Google Maps links
- **Add Advertisement** – Multi-step form (PG Details → Location → Pricing → Amenities) with Zod validation
- **Verified Listings** – Trust badges for verified properties
- **Real-time Updates** – Instant synchronization across all users

### 🎨 Modern UI/UX
- **Responsive Design** – Works on mobile, tablet, and desktop (with mobile menu)
- **Listing Cards** – Image carousel, ratings, sharing/food badges, “View Details”
- **Smooth Animations** – Hover effects and transitions
- **Loading & Error States** – Dedicated loading and error boundaries

### 🔐 Security & Performance
- **API Rate Limiting** – 60 requests per minute per IP on `/api/*` (middleware)
- **Zod Validation** – Request validation for add-listing and search query
- **Firebase Security Rules** – Protected data access
- **Type Safety** – Full TypeScript and shared types
- **Next.js Image** – Optimized images; allowed domains in `next.config.js`
- **SEO** – Meta tags and locale-aware layout

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account ([Get one free](https://firebase.google.com/))
- Google Cloud account for Maps API ([Get $200 free credit](https://cloud.google.com/))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd HomyFind-Web
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing (e.g. `homyfind-app`)
3. Enable **Firestore Database**:
   - Click "Create Database"
   - Choose location: `us-central1` or `asia-southeast1`
   - Start in **test mode** for development

4. Set up **Firestore Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pg_advertisements/{adId} {
      allow read: if true;
      allow write: if true; // Restrict with auth in production
    }
  }
}
```

### 4. Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable: **Places API (New)**, **Places API**, **Maps JavaScript API**
4. Create an API key under Credentials and restrict it to these APIs
5. Add the key to `.env.local`

**Cost:** $200 free credit/month ≈ thousands of searches at no cost.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. If port 3000 is in use, Next.js will use 3001.

---

## 📂 Project Structure

```
HomyFind-Web/
├── app/
│   ├── layout.tsx                    # Root layout (globals.css only)
│   ├── [locale]/                      # Locale-based routes (i18n)
│   │   ├── layout.tsx                 # Locale layout, metadata, NextIntlClientProvider
│   │   ├── page.tsx                   # Home: search, filters, listing grid, pagination
│   │   ├── loading.tsx                # Loading UI
│   │   ├── not-found.tsx              # 404 page
│   │   ├── error.tsx                  # Error boundary
│   │   ├── add-listing/
│   │   │   └── page.tsx               # Multi-step add PG form
│   │   └── listing/[id]/
│   │       └── page.tsx               # PG detail page (gallery, amenities, contact)
│   └── api/
│       ├── search-realtime/
│       │   └── route.ts               # Search: Firestore + Google Maps + fallback
│       ├── add-advertisement/
│       │   └── route.ts               # POST add listing (Zod-validated)
│       └── listing/[id]/
│           └── route.ts               # GET single listing
├── components/
│   ├── PGCard.tsx                     # Listing card with carousel
│   ├── SearchFilters.tsx              # Search + filters (rent, sharing, gender, food)
│   └── LanguageSwitcher.tsx           # Locale dropdown
├── hooks/
│   └── useImageCarousel.ts            # Image carousel state
├── i18n/
│   ├── routing.ts                     # Locales: en, hi, kn, te, ta, ml
│   ├── request.ts                     # next-intl request config (loads messages)
│   └── navigation.ts                  # Link, useRouter, usePathname (locale-aware)
├── messages/                          # JSON translation files
│   ├── en.json
│   ├── hi.json
│   ├── kn.json
│   ├── te.json
│   ├── ta.json
│   └── ml.json
├── lib/
│   ├── firebase.ts                    # Firebase app, auth, firestore, storage, analytics
│   ├── firestore.ts                   # Firestore: add/search PG ads
│   ├── google-maps-places.ts          # Google Maps Places API + cache
│   ├── skyscanner-approach.ts        # Fallback aggregated/mock data
│   └── validations.ts                 # Zod: addListingSchema, searchQuerySchema
├── utils/
│   ├── index.ts                       # safeParseJSON, safeSetLocalStorage, formatINR
│   ├── transformers.ts                # firebaseAdToPGListing, externalToPGListing
│   └── mock-data.ts                   # generateMockData for fallback
├── constants/
│   └── index.ts                       # LISTINGS_PER_PAGE, amenities, rent brackets, cities, etc.
├── types/
│   └── index.ts                       # PGListing, SearchFilters, ApiResponse, ExternalPGListing
├── middleware.ts                      # next-intl + API rate limiting (60/min)
├── next.config.js                     # next-intl plugin, image domains
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 Key Features in Code

### Search Pipeline

1. **Firebase Firestore** – User-submitted PG advertisements (by city)
2. **Google Maps Places API** – Real-time PG listings (with TTL cache)
3. **Fallback** – Aggregated/mock data when APIs fail or are unavailable

### Pagination

- **21 listings per page** (set in `constants/index.ts`: `LISTINGS_PER_PAGE`)
- Previous/Next and page numbers; “X–Y of Z” counter; scroll to top on change

### PG Detail Page

- **Photo carousel** (hooks/useImageCarousel) with thumbnails
- Full info: name, rating, description, amenities, rules, rent, deposit, sharing, food
- Contact: owner name, phone, email
- Google Maps link

### Add Advertisement

- **Multi-step form**: PG Details → Location → Pricing → Amenities
- **Zod** validation in `lib/validations.ts`; API uses `addListingSchema.safeParse()`
- Fields: name, description, owner contact, address, city, state, pincode, rent, deposit, sharing, amenities, rules, rooms, gender, food, availability

### Locales & Routing

- **Locales**: `en` (default), `hi`, `kn`, `te`, `ta`, `ml`
- **Prefix**: `as-needed` (e.g. `/` for English, `/hi` for Hindi)
- **Middleware**: next-intl for locale detection; `/api/*` gets rate limiting only (no locale)

---

## 🛠️ Tech Stack

| Technology   | Purpose |
|-------------|---------|
| **Next.js 14** | App Router, API routes, SSR |
| **TypeScript** | Type-safe code and shared types |
| **Tailwind CSS** | Utility-first styling |
| **next-intl** | i18n routing and translations |
| **Zod** | Request validation (add listing, search) |
| **Firebase Firestore** | User-submitted PG listings |
| **Google Maps API** | Places and PG data |
| **Lucide React** | Icons |
| **Vercel** | Hosting (optional) |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and link the project
3. In Vercel Dashboard → Project Settings → Environment Variables, add all keys from `.env.local`
4. Deploy: `vercel --prod`

### Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📱 API Endpoints

### Search PGs

```
GET /api/search-realtime?location=Bangalore
```

Query validated with `searchQuerySchema` (location required). Response shape:

```json
{
  "success": true,
  "data": [...listings],
  "count": 60,
  "source": "google-maps-places-api",
  "isRealData": true,
  "message": "..."
}
```

### Add Advertisement

```
POST /api/add-advertisement
Content-Type: application/json
```

Body validated with `addListingSchema` (Zod). Example fields:

```json
{
  "pgName": "Sunshine PG",
  "ownerName": "John Doe",
  "ownerPhone": "9876543210",
  "ownerEmail": "john@example.com",
  "address": "...",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "sharingOption": 2,
  "rent": 8000,
  "securityDeposit": 10000,
  "foodIncluded": false,
  "preferredGender": "Any",
  "amenities": ["WiFi", "AC"],
  "rules": [],
  "description": "...",
  "images": [],
  "totalRooms": 10,
  "availableRooms": 3,
  "availableFrom": "2025-03-01"
}
```

### Get Listing by ID

```
GET /api/listing/[id]
```

Returns a single PG listing (Firestore or Google Place details when applicable).

---

## 🔧 Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (default port 3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

---

## 🎨 Customization

### Pagination

Edit `constants/index.ts`:

```typescript
export const LISTINGS_PER_PAGE = 21; // Change as needed
```

### Theme (Tailwind)

Edit `tailwind.config.js` and extend `theme.colors` (e.g. `primary`).

### Amenities

Edit `constants/index.ts`: `AMENITIES_LIST` and, for translations, `AMENITY_KEYS` and the `messages/*.json` files.

### New Locale

1. Add locale in `i18n/routing.ts` to `locales`.
2. Add `messages/<locale>.json` (copy from `en.json` and translate).

---

## 🐛 Troubleshooting

- **Google Maps returns no results** – Check API key in `.env.local`, enable required APIs in Google Cloud, allow a few minutes after creating the key.
- **Firebase permission denied** – Check Firestore rules and Firebase config in `.env.local`.
- **429 Too Many Requests** – API rate limit is 60 requests/minute per IP; wait and retry.
- **Listings show ₹0** – Check API response shape and `utils/transformers.ts` mapping.
- **Port in use** – Next.js may use 3001 if 3000 is busy, or stop the process using the port.

---

## 🔐 Security (Production)

1. **Firestore**: Require auth for create/update/delete; keep read rules as needed.
2. **Google Maps API**: Restrict key by HTTP referrer and APIs.
3. **Secrets**: Never commit `.env.local`; use platform env vars (e.g. Vercel).

---

## 📈 Future Enhancements

- [ ] User authentication (Firebase Auth)
- [ ] Image upload for PG listings
- [ ] Admin panel for verification
- [ ] Booking system
- [ ] Payment integration
- [ ] Email notifications
- [ ] Reviews and ratings
- [ ] Chat between users and owners
- [ ] Map-based search
- [ ] Mobile app (e.g. React Native)

---

## 🤝 Contributing

Contributions are welcome: bug reports, feature ideas, and pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Firebase](https://firebase.google.com/)
- [Google Maps](https://developers.google.com/maps)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)
- [Zod](https://zod.dev/)

---

**Built with ❤️ by the HomyFind Team**

🌐 **Live Demo**: [https://homyfind-web.vercel.app](https://homyfind-web.vercel.app)
