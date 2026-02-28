# Backend Completion Guide — What's Done & What's Left

## Current Backend Status (~95% Complete)

| Feature | Status | Where |
|---------|--------|-------|
| Firebase Firestore (database) | Done | `lib/firebase.ts`, `lib/firestore.ts` |
| Add PG listing API | Done | `app/api/add-advertisement/route.ts` |
| Search PG listings API | Done | `app/api/search-realtime/route.ts` |
| Google Maps Places API | Done | `lib/google-maps-places.ts` |
| Input validation (Zod) | Done | `lib/validations.ts` |
| Rate limiting middleware | Done | `middleware.ts` |
| Multi-language routing (6 langs) | Done | `i18n/` directory |
| Verified/Premium listing ranking | Done | Search API sorts by plan |
| Stripe + UPI payment APIs | Done | `app/api/create-checkout/`, `app/api/webhook/` |
| Payment success/cancelled pages | Done | `app/[locale]/payment-success/`, `payment-cancelled/` |
| Firebase Auth (Email + Phone OTP) | Done | `lib/auth.ts`, `hooks/useAuth.ts` |
| Server-side token verification | Done | `lib/auth-server.ts` |
| Owner login/signup page | Done | `app/[locale]/login/page.tsx` |
| Owner dashboard (view/edit/delete) | Done | `app/[locale]/dashboard/page.tsx` |
| Owner listings API | Done | `app/api/owner/listings/route.ts` |
| Update/Delete listing API | Done | `app/api/owner/update-listing/route.ts` |
| Firestore REST API for writes | Done | Uses owner's ID token (bypasses anon auth) |
| Image upload (Firebase Storage) | Done | `lib/storage.ts` |
| Predefined house rules (12 buttons) | Done | `constants/index.ts`, `messages/*.json` |
| Google Maps link field | Done | Add-listing form + detail page |
| Room configurations (multi-type) | Done | Multiple sharing types per listing |
| Search token backfill API | Done | `app/api/admin/backfill-tokens/route.ts` |
| Maps photo proxy API | Done | `app/api/maps-photo/route.ts` |
| Firestore security rules | Done | Firebase Console |
| Firebase Storage rules | Done | 5MB image limit, auth required |

---

## What's Left To Do

### Step 1: Static Pages for AdSense (1 hour)

These pages are required for Google AdSense approval:

| Page | Route | Content |
|------|-------|---------|
| About Us | `/about` | What Find-My-PG is, your mission |
| Privacy Policy | `/privacy` | Data collection, cookies |
| Contact Us | `/contact` | Email, phone, form |
| Terms of Service | `/terms` | Usage rules |

### Step 2: Apply for Google AdSense (10 minutes)

1. Go to https://adsense.google.com
2. Submit your website URL
3. Wait 1-2 weeks for approval
4. Once approved, create ad units and add to your pages

### Step 3: Reviews & Ratings System (Future)

- Allow tenants to rate PGs (1-5 stars)
- Display average rating on PG cards
- Show reviews on detail page

### Step 4: Chat System (Future)

- In-app messaging between tenants and owners
- Firebase Realtime Database or Firestore subcollection

### Step 5: City-Specific Landing Pages (SEO)

- `/pg-in-bangalore`, `/pg-in-hyderabad`, etc.
- Improves search engine ranking for target keywords

---

## Current Project File Structure

```
Find-My-PG-Web/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                    # Home page
│   │   ├── add-listing/page.tsx        # Add PG form (login required)
│   │   ├── listing/[id]/page.tsx       # PG detail page
│   │   ├── login/page.tsx              # Owner login (Email + Phone OTP)
│   │   ├── dashboard/page.tsx          # Owner dashboard (view/edit/delete)
│   │   ├── payment-success/page.tsx    # Payment success
│   │   ├── payment-cancelled/page.tsx  # Payment cancelled
│   │   ├── about/page.tsx              # TODO: About page
│   │   ├── privacy/page.tsx            # TODO: Privacy policy
│   │   ├── contact/page.tsx            # TODO: Contact page
│   │   └── terms/page.tsx              # TODO: Terms of service
│   └── api/
│       ├── add-advertisement/route.ts  # Add listing API
│       ├── search-realtime/route.ts    # Search API
│       ├── listing/[id]/route.ts       # Listing detail API
│       ├── create-checkout/route.ts    # Stripe checkout API
│       ├── webhook/route.ts            # Stripe webhook API
│       ├── maps-photo/route.ts         # Google Maps photo proxy
│       ├── owner/
│       │   ├── listings/route.ts       # Owner's listings API
│       │   └── update-listing/route.ts # Edit/delete listing API (REST API)
│       └── admin/
│           └── backfill-tokens/route.ts # Search token backfill (admin)
├── lib/
│   ├── firebase.ts                     # Firebase config (safe init)
│   ├── firebase-admin.ts              # Firebase Admin SDK (optional)
│   ├── firestore.ts                    # CRUD operations
│   ├── auth.ts                        # Client-side auth functions
│   ├── auth-server.ts                 # Server-side token verification
│   ├── storage.ts                     # Firebase Storage image upload
│   ├── stripe.ts                      # Stripe server config
│   ├── stripe-client.ts              # Stripe client helper
│   ├── google-maps-places.ts         # Google Maps API
│   └── validations.ts                # Zod schemas
├── components/
│   ├── PGCard.tsx                     # Listing card (verified/premium badges)
│   ├── SearchFilters.tsx              # Search + filters
│   └── LanguageSwitcher.tsx           # 6 language switcher
├── hooks/
│   ├── useAuth.ts                     # Auth state hook
│   └── useImageCarousel.ts           # Image carousel
├── constants/
│   └── index.ts                       # Amenities, house rules, cities
├── types/index.ts                     # All types (PGListing, RoomConfiguration)
├── messages/                          # 6 language translation files
└── middleware.ts                      # Rate limiting + i18n
```

---

## Environment Variables

```env
# Firebase Configuration (required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key (required)
GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Stripe (optional - for verified/premium plans)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Admin API Key (for admin endpoints)
ADMIN_API_KEY=your_admin_key

# Firebase Admin SDK (optional - for future server-side admin operations)
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## Remaining Checklist

- [ ] Create About, Privacy, Contact, Terms pages
- [ ] Apply for Google AdSense
- [ ] Set up Stripe live keys (switch from test to production)
- [ ] Add Google Analytics
- [ ] Create city-specific SEO landing pages
- [ ] Build reviews and ratings system
- [ ] Add chat between tenants and owners
- [ ] Build mobile app (React Native)

---

## Architecture Notes

### Update/Delete Flow (Firestore REST API)

The dashboard update/delete operations use the **Firestore REST API** with the owner's actual Firebase ID token. This is because:

1. Server-side API routes use the client SDK which signs in anonymously
2. Firestore security rules require `request.auth.uid == resource.data.ownerId`
3. Anonymous auth UID doesn't match the document's ownerId
4. Solution: Pass the owner's ID token to Firestore REST API directly

```
Dashboard (client) → PATCH /api/owner/update-listing (with Bearer token)
    → verifyAuthToken() validates the token
    → isOwner() checks UID/phone/email match
    → Firestore REST API PATCH with owner's token
    → Firestore rules see correct auth.uid → allows write
```

### Ownership Verification (Triple Check)

The `isOwner` function checks three identifiers:
1. `ownerId` (Firebase UID) - primary, set when listing is created by logged-in user
2. `ownerPhone` - fallback for phone-auth users
3. `ownerEmail` - fallback for email-auth users

---

## Costs Summary

| Service | Monthly Cost |
|---------|-------------|
| Vercel Hosting | Free |
| Firebase (Blaze - pay as you go) | Free (within free limits) |
| Google Maps API | Free (within $200 free credit) |
| Stripe | Free (2% only when you receive payments) |
| Domain (find-my-pg.com) | ~INR 46/month |
| **Total fixed cost** | **~INR 46/month** |
