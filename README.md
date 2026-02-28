# Find-My-PG - Find Your Perfect PG

> A modern, real-time PG (Paying Guest) accommodation search platform for India. Built with Next.js, Firebase, Stripe, and Google Maps API. Supports 6 Indian languages with verified and premium listing tiers.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

## Features

### Multi-Language Support (i18n)
- **6 Indian languages** - English, Hindi, Kannada, Telugu, Tamil, Malayalam
- Locale-based routing with `as-needed` prefix (English has no URL prefix)
- In-header language switcher dropdown
- All UI labels, filters, forms, and messages translated

### Smart Search Pipeline
- **Firebase Firestore** - User-submitted PG advertisements
- **Google Maps Places API** - Real-time PG listings with 5-minute cache (up to 60 results)
- **Multi-tier fallback** - Firebase > Google Maps > Foursquare/OSM > Mock data
- **Advanced filtering** - Rent range, sharing type, gender preference, food inclusion
- **Smart ranking** - Premium listings appear first, then verified, then free

### Verified & Premium Listings
- **Free plan** - Standard listing, appears in search results
- **Verified plan (INR 299/mo)** - Green verified badge, higher search ranking
- **Premium plan (INR 599/mo)** - Gold premium badge, top of search results, highlighted card with amber border
- **Stripe Checkout** - Subscription payments via UPI, cards, netbanking
- **Webhook-powered** - Automatic upgrades on payment, downgrades on cancellation

### Owner Authentication & Dashboard
- **Email + Password** login and signup for PG owners
- **Phone + OTP** authentication via Firebase
- **Owner Dashboard** - View, edit, and delete your listings
- **Token-based API security** - All owner operations require valid Firebase ID token
- **Ownership verification** - UID, phone, and email-based checks on update/delete
- **Firestore REST API** - Server-side writes using owner's auth token (bypasses anonymous auth limitations)

### Listing Management
- **Detailed PG pages** - Photo gallery, amenities, house rules, contact details, Google Maps link
- **Multi-step add form** - PG Details > Location > Pricing > Amenities & Photos (Zod validated)
- **Photo upload** - Up to 10 photos per listing via Firebase Storage (5MB each)
- **Predefined house rules** - 12 selectable rule buttons (No Smoking, No Drinking, etc.) + custom rules
- **Predefined amenities** - 15 selectable amenity buttons (WiFi, AC, Parking, etc.)
- **Room configurations** - Multiple sharing types per listing (single, double, triple, 4+)
- **Google Maps link** - Owners can paste their exact location pin
- **Edit from dashboard** - Update description, photos, amenities, pricing, availability
- **Delete from dashboard** - Remove listings with confirmation dialog
- **Login required** - Add-listing page redirects to login if not authenticated

### Security & Performance
- **Rate limiting** - 60 requests/minute per IP on all API routes
- **Zod validation** - Input sanitization on all API endpoints
- **Firebase Security Rules** - Protected data access with auth requirements
- **Firebase Storage** - 5MB image limit, authentication required
- **Build-safe Firebase init** - Lazy initialization prevents Vercel build crashes
- **Full TypeScript** - Shared types across frontend and API
- **Firestore REST API** - Update/delete operations use owner's ID token directly

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | App Router, API routes, SSR |
| **TypeScript** | Type-safe code and shared types |
| **Tailwind CSS** | Utility-first styling |
| **Firebase Firestore** | PG listing database |
| **Firebase Auth** | Email/Password + Phone OTP sign-in |
| **Firebase Storage** | Image uploads |
| **Google Maps Places API** | Live PG data |
| **Stripe** | Subscription payments (UPI, Cards, Netbanking) |
| **next-intl** | i18n routing and translations |
| **Zod** | Request validation |
| **Lucide React** | Icons |
| **Vercel** | Hosting |

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account ([firebase.google.com](https://firebase.google.com/))
- Google Cloud account for Maps API ([cloud.google.com](https://cloud.google.com/))
- Stripe account for payments ([stripe.com](https://stripe.com/)) - optional, can be added later

### 1. Clone & Install

```bash
git clone https://github.com/kiran-1505/find-my-pg-web.git
cd Find-My-PG-Web
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe (optional - for verified/premium plans)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Admin API Key (for admin endpoints like backfill-tokens)
ADMIN_API_KEY=your_admin_key
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (e.g. `find-my-pg-app`)
3. Enable **Firestore Database** (location: `asia-southeast1` recommended for India)
4. Enable **Authentication** - Turn on Email/Password and Phone sign-in
5. Enable **Storage** - Set 5MB file size limit
6. Deploy security rules:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pg_advertisements/{adId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pg-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

### 4. Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable: **Places API (New)**, **Places API**, **Maps JavaScript API**
3. Create an API key and restrict it to these APIs
4. Add the key to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
Find-My-PG-Web/
├── app/
│   ├── layout.tsx                         # Root layout
│   ├── [locale]/                          # Locale-based routes (i18n)
│   │   ├── layout.tsx                     # Locale layout + metadata
│   │   ├── page.tsx                       # Home: search, filters, listing grid
│   │   ├── loading.tsx                    # Loading UI
│   │   ├── not-found.tsx                  # 404 page
│   │   ├── error.tsx                      # Error boundary
│   │   ├── add-listing/page.tsx           # Multi-step add PG form (login required)
│   │   ├── listing/[id]/page.tsx          # PG detail page
│   │   ├── login/page.tsx                 # Owner login (Email + Phone OTP)
│   │   ├── dashboard/page.tsx             # Owner dashboard (view/edit/delete listings)
│   │   ├── payment-success/page.tsx       # Stripe payment success
│   │   └── payment-cancelled/page.tsx     # Stripe payment cancelled
│   └── api/
│       ├── search-realtime/route.ts       # Search: Firestore + Google Maps + fallback
│       ├── add-advertisement/route.ts     # POST: Add listing (Zod validated, auth required)
│       ├── listing/[id]/route.ts          # GET: Single listing detail
│       ├── create-checkout/route.ts       # POST: Create Stripe checkout session
│       ├── webhook/route.ts               # POST: Stripe webhook handler
│       ├── maps-photo/route.ts            # GET: Proxy Google Maps photos
│       ├── owner/
│       │   ├── listings/route.ts          # GET: Owner's listings (auth required)
│       │   └── update-listing/route.ts    # PATCH/DELETE: Edit/delete listing (auth + ownership)
│       └── admin/
│           └── backfill-tokens/route.ts   # POST: Backfill search tokens (admin key required)
├── components/
│   ├── PGCard.tsx                         # Listing card (verified/premium badges)
│   ├── SearchFilters.tsx                  # Search + filters UI
│   └── LanguageSwitcher.tsx               # Locale dropdown
├── lib/
│   ├── firebase.ts                        # Firebase config (build-safe init)
│   ├── firebase-admin.ts                  # Firebase Admin SDK (optional, for future use)
│   ├── firestore.ts                       # Firestore CRUD operations
│   ├── auth.ts                            # Client-side auth (signIn, signUp, signOut)
│   ├── auth-server.ts                     # Server-side token verification (REST API)
│   ├── storage.ts                         # Firebase Storage image upload
│   ├── stripe.ts                          # Stripe server config + plan pricing
│   ├── stripe-client.ts                   # Stripe client helper + checkout redirect
│   ├── google-maps-places.ts              # Google Maps Places API + cache
│   └── validations.ts                     # Zod schemas (add, update, search)
├── utils/
│   ├── index.ts                           # Helpers: safeParseJSON, formatINR
│   ├── transformers.ts                    # Data transformers (Firebase/external to PGListing)
│   └── mock-data.ts                       # Fallback mock data generator
├── hooks/
│   ├── useAuth.ts                         # Auth state hook (user, loading, login/logout)
│   └── useImageCarousel.ts                # Image carousel state
├── i18n/
│   ├── routing.ts                         # Locales: en, hi, kn, te, ta, ml
│   ├── request.ts                         # next-intl request config
│   └── navigation.ts                      # Locale-aware Link, useRouter
├── messages/                              # Translation files (6 languages)
│   ├── en.json, hi.json, kn.json
│   ├── te.json, ta.json, ml.json
├── constants/
│   └── index.ts                           # Config: amenities, house rules, cities
├── types/
│   └── index.ts                           # TypeScript types (PGListing, RoomConfiguration)
├── middleware.ts                           # Rate limiting + i18n middleware
├── next.config.js                         # next-intl plugin, image remote patterns
├── tailwind.config.js
└── tsconfig.json
```

---

## API Endpoints

### Public Endpoints

#### Search PGs
```
GET /api/search-realtime?location=Bangalore
```
Returns listings sorted by plan tier (premium > verified > free), then by rating.

#### Get Listing by ID
```
GET /api/listing/[id]
```
Returns a single PG listing with all details.

#### Add Advertisement
```
POST /api/add-advertisement
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```
Body validated with Zod. Required fields: pgName, ownerName, ownerPhone, address, city, state, pincode, sharingOption, rent, securityDeposit, preferredGender, foodIncluded.

### Owner Endpoints (Auth Required)

#### Get Owner's Listings
```
GET /api/owner/listings
Authorization: Bearer <firebase-id-token>
```
Returns all listings owned by the authenticated user (matches by ownerId, phone, or email).

#### Update Listing
```
PATCH /api/owner/update-listing
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "listingId": "abc123",
  "updates": { "description": "Updated description" }
}
```
Verifies ownership, validates with Zod, then updates via Firestore REST API using the owner's token.

#### Delete Listing
```
DELETE /api/owner/update-listing
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{ "listingId": "abc123" }
```
Verifies ownership, then deletes via Firestore REST API using the owner's token.

### Payment Endpoints

#### Create Checkout Session
```
POST /api/create-checkout
Content-Type: application/json

{
  "plan": "verified",
  "listingId": "abc123",
  "ownerEmail": "owner@example.com"
}
```
Creates a Stripe Checkout session for monthly subscription. Returns redirect URL.

#### Stripe Webhook
```
POST /api/webhook
```
Handles `checkout.session.completed` (upgrades listing) and `customer.subscription.deleted` (downgrades to free).

### Admin Endpoints

#### Backfill Search Tokens
```
POST /api/admin/backfill-tokens
Authorization: Bearer <admin-api-key>
```
Backfills `searchTokens` and `areaLower` for existing documents that don't have them.

---

## Payment Flow

```
PG Owner adds listing (free)
        |
Owner clicks "Upgrade to Verified (INR 299/mo)" or "Premium (INR 599/mo)"
        |
Redirected to Stripe Checkout (UPI / Card / Netbanking)
        |
Payment successful --> Stripe webhook fires
        |
Webhook updates Firebase: verified=true, verificationPlan='verified'|'premium'
        |
Listing shows badge + ranks higher in search
        |
If subscription cancelled --> Webhook downgrades to free plan
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add all environment variables from `.env.local` in Vercel Dashboard > Settings > Environment Variables
4. Deploy - Vercel auto-detects Next.js

**Stripe Webhook Setup:**
- Add endpoint URL: `https://your-domain.com/api/webhook`
- Select events: `checkout.session.completed`, `customer.subscription.deleted`
- Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Custom Domain

1. Purchase domain (e.g. `find-my-pg.com`)
2. In Vercel Dashboard > Settings > Domains, add your domain
3. Update DNS records as instructed by Vercel

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

---

## What's Done & What's Remaining

### Done
- [x] Multi-language support (6 languages)
- [x] Real-time PG search with Google Maps
- [x] Add PG listing form with validation
- [x] Photo upload to Firebase Storage
- [x] Predefined house rules (12 selectable buttons + custom)
- [x] Google Maps link field for owners
- [x] Room configurations (multiple sharing types per listing)
- [x] Verified and Premium listing badges
- [x] Stripe payment integration (UPI, Cards, Netbanking)
- [x] Payment success/cancelled pages
- [x] Rate limiting and security
- [x] Owner authentication (Email + Phone OTP)
- [x] Owner dashboard (view, edit, delete listings)
- [x] Token-based API security for owner operations
- [x] Firestore REST API for update/delete (bypasses anonymous auth)
- [x] Search token backfill admin endpoint

### Remaining
- [ ] About, Privacy, Contact, Terms pages (required for AdSense)
- [ ] Google AdSense integration
- [ ] Reviews and ratings system
- [ ] Chat between tenants and owners
- [ ] Map-based search view
- [ ] Email/SMS notifications
- [ ] City-specific landing pages (SEO)
- [ ] Mobile app (React Native)

---

## Customization

### Pagination
Edit `constants/index.ts` - `LISTINGS_PER_PAGE` (default: 21)

### Theme
Edit `tailwind.config.js` - Extend `theme.colors` (e.g. `primary`)

### Amenities
Edit `constants/index.ts` - `AMENITIES_LIST` and corresponding translation keys in `messages/*.json` under `amenityNames`

### House Rules
Edit `constants/index.ts` - `RULES_LIST` and corresponding translation keys in `messages/*.json` under `ruleNames`

### Add New Language
1. Add locale code to `i18n/routing.ts`
2. Create `messages/<locale>.json` (copy from `en.json` and translate)

---

## Monthly Costs

| Service | Cost |
|---------|------|
| Vercel Hosting | Free |
| Firebase (Blaze plan) | Free (within free tier) |
| Google Maps API | Free ($200 monthly credit) |
| Stripe | 2% per transaction (no fixed fees) |
| Domain (.in) | ~INR 46/month |
| **Total fixed cost** | **~INR 46/month** |

---

## Troubleshooting

- **Google Maps returns no results** - Check API key in `.env.local`, enable required APIs in Google Cloud Console
- **Firebase permission denied on reads** - Verify Firestore rules allow reads, check auth config
- **Firebase permission denied on update/delete** - The API uses Firestore REST API with the user's ID token. Ensure Firestore rules allow `update, delete: if request.auth.uid == resource.data.ownerId`
- **429 Too Many Requests** - Rate limit is 60 requests/minute per IP; wait and retry
- **Stripe payments not working** - Ensure all 3 Stripe env vars are set; payments are disabled if `STRIPE_SECRET_KEY` is missing
- **Vercel build fails with auth/invalid-api-key** - Make sure all Firebase env vars are added in Vercel Dashboard
- **Port in use** - Next.js will auto-use port 3001 if 3000 is busy
- **Login not working** - Ensure Email/Password authentication is enabled in Firebase Console > Authentication > Sign-in method

---

## Contributing

Contributions are welcome! Bug reports, feature ideas, and pull requests.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Stripe](https://stripe.com/)
- [Google Maps](https://developers.google.com/maps)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)
- [Zod](https://zod.dev/)

---

**Built with care for India's PG seekers**

[Live Demo](https://find-my-pg.com) | [GitHub](https://github.com/kiran-1505/find-my-pg-web)
