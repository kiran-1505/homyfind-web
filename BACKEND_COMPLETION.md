# Backend Completion Guide — What's Done & What's Left

## What's Already Working (Your Current Backend)

| Feature | Status | Where |
|---------|--------|-------|
| Firebase Firestore (database) | ✅ Done | `lib/firebase.ts`, `lib/firestore.ts` |
| Add PG listing API | ✅ Done | `app/api/add-advertisement/route.ts` |
| Search PG listings API | ✅ Done | `app/api/search-realtime/route.ts` |
| Google Maps Places API | ✅ Done | `lib/google-maps-places.ts` |
| Input validation (Zod) | ✅ Done | `lib/validations.ts` |
| Rate limiting middleware | ✅ Done | `middleware.ts` |
| Multi-language routing (6 langs) | ✅ Done | `i18n/` directory |
| Verified/Premium listing ranking | ✅ Done | Search API sorts by plan |
| Stripe + UPI payment APIs | ✅ Done | `app/api/create-checkout/`, `app/api/webhook/` |
| Payment success/cancelled pages | ✅ Done | `app/[locale]/payment-success/`, `payment-cancelled/` |
| Update listing function | ✅ Done | `lib/firestore.ts` → `updatePGAdvertisement()` |
| Firestore security rules | ✅ Done | Firebase Console |
| Firebase Auth enabled | ✅ Done | Email + Phone + Google sign-in |
| Firebase Storage rules | ✅ Done | 5MB image limit, auth required |

**Your backend is ~85% complete.** Here's what's left to build.

---

## What's Left To Do (Next Week)

### Step 1: Set Up Stripe Account (30 minutes)

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with your email
3. Complete KYC:
   - PAN card number
   - Bank account details (for receiving payments)
   - Business name: "HomyFind" (individual/sole proprietorship is fine)
4. Once approved, go to **Developers → API Keys** and copy:
   - `Publishable key` → This is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → This is `STRIPE_SECRET_KEY`
5. Go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR_DOMAIN/api/webhook`
   - Events: Select `checkout.session.completed` and `customer.subscription.deleted`
   - Copy the webhook signing secret → This is `STRIPE_WEBHOOK_SECRET`
6. Add all 3 keys to **Vercel** (Settings → Environment Variables):
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
7. Also add to your local `.env.local` (use test keys for development):
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

**Payment methods automatically available:** UPI, Cards (Visa/Mastercard/RuPay), Netbanking, Wallets
**Stripe fee:** 2% per transaction. No setup fee. No monthly fee.

### Step 2: Build Login/Signup Page (1-2 hours)

Create `lib/auth.ts`:
```typescript
import { getFirebaseAuth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

export async function signUp(email: string, password: string) {
  const auth = getFirebaseAuth();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}
```

Create `contexts/AuthContext.tsx`:
```typescript
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Create login page at `app/[locale]/auth/page.tsx`:
- Email + password form
- Toggle between Sign Up and Sign In
- Redirect to add-listing or dashboard after login

### Step 3: Build Owner Dashboard (2-3 hours)

Create `app/[locale]/dashboard/page.tsx`:
- Show all listings owned by the logged-in user
- Each listing card shows: name, city, current plan, edit/upgrade buttons
- "Upgrade to Verified" and "Upgrade to Premium" buttons trigger Stripe checkout

Add to `lib/firestore.ts`:
```typescript
export async function getOwnerListings(ownerId: string): Promise<PGAdvertisement[]> {
  const q = query(
    collection(db, 'pg_advertisements'),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  // Map documents same as searchPGAdvertisements
}
```

### Step 4: Add Image Upload (1-2 hours)

Create `lib/storage.ts`:
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadPGImage(file: File, listingId: string): Promise<string> {
  const storageRef = ref(storage, `pg-images/${listingId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

Add file input to the add-listing form (Step 3 — Amenities section).

### Step 5: Create Static Pages for AdSense (1 hour)

These pages are required for Google AdSense approval:

| Page | Route | Content |
|------|-------|---------|
| About Us | `/about` | What HomyFind is, your mission |
| Privacy Policy | `/privacy` | Data collection, cookies |
| Contact Us | `/contact` | Email, phone, form |
| Terms of Service | `/terms` | Usage rules |

### Step 6: Apply for Google AdSense (10 minutes)

1. Go to https://adsense.google.com
2. Submit your website URL
3. Wait 1-2 weeks for approval
4. Once approved, create ad units and add to your pages

---

## Current Project File Structure

```
HomyFind-Web/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                    ✅ Home page
│   │   ├── add-listing/page.tsx        ✅ Add PG form
│   │   ├── listing/[id]/page.tsx       ✅ PG detail page
│   │   ├── payment-success/page.tsx    ✅ Payment success
│   │   ├── payment-cancelled/page.tsx  ✅ Payment cancelled
│   │   ├── auth/page.tsx               ❌ TODO: Login/Signup
│   │   ├── dashboard/page.tsx          ❌ TODO: Owner dashboard
│   │   ├── about/page.tsx              ❌ TODO: About page
│   │   ├── privacy/page.tsx            ❌ TODO: Privacy policy
│   │   ├── contact/page.tsx            ❌ TODO: Contact page
│   │   └── terms/page.tsx              ❌ TODO: Terms of service
│   └── api/
│       ├── add-advertisement/route.ts  ✅ Add listing API
│       ├── search-realtime/route.ts    ✅ Search API
│       ├── listing/[id]/route.ts       ✅ Listing detail API
│       ├── create-checkout/route.ts    ✅ Stripe checkout API
│       └── webhook/route.ts            ✅ Stripe webhook API
├── lib/
│   ├── firebase.ts                     ✅ Firebase config (safe init)
│   ├── firestore.ts                    ✅ CRUD operations
│   ├── stripe.ts                       ✅ Stripe server config
│   ├── stripe-client.ts               ✅ Stripe client helper
│   ├── google-maps-places.ts          ✅ Google Maps API
│   ├── validations.ts                 ✅ Zod schemas
│   ├── auth.ts                        ❌ TODO: Auth functions
│   └── storage.ts                     ❌ TODO: Image upload
├── components/
│   ├── PGCard.tsx                     ✅ Listing card (verified/premium badges)
│   ├── SearchFilters.tsx              ✅ Search + filters
│   └── LanguageSwitcher.tsx           ✅ 6 language switcher
├── contexts/
│   └── AuthContext.tsx                ❌ TODO: Auth provider
├── types/index.ts                     ✅ All types including VerificationPlan
├── messages/                          ✅ 6 language translation files
└── middleware.ts                      ✅ Rate limiting + i18n
```

---

## Environment Variables

```env
# ✅ Already configured in Vercel + .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAtSwGVH_rFBk6EdeQQ91VJoN4Fn6wHdU8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=homyfind-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://homyfind-app-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=homyfind-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=homyfind-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1061060765252
NEXT_PUBLIC_FIREBASE_APP_ID=1:1061060765252:web:85b0e7da05db7f0fd67e11
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-S82W1FE1QN
GOOGLE_MAPS_API_KEY=AIzaSyBcapryw6GrvEK-YUdM2vYupq8BwmFfNkU
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBcapryw6GrvEK-YUdM2vYupq8BwmFfNkU

# ❌ Add after Stripe account setup:
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Next Week Checklist

- [ ] Create Stripe account + complete KYC
- [ ] Add Stripe env vars to Vercel
- [ ] Set up Stripe webhook endpoint
- [ ] Build login/signup page (`/auth`)
- [ ] Build owner dashboard (`/dashboard`)
- [ ] Add image upload to add-listing form
- [ ] Create About, Privacy, Contact, Terms pages
- [ ] Apply for Google AdSense
- [ ] Test full payment flow (Stripe test mode)
- [ ] Go live with payments (switch to Stripe live keys)

---

## Payment Flow (How It Works)

```
PG Owner adds listing (free)
        ↓
Owner goes to Dashboard
        ↓
Clicks "Upgrade to Verified ₹299/mo" or "Premium ₹599/mo"
        ↓
Redirected to Stripe Checkout (UPI / Card / Netbanking)
        ↓
Payment successful → Stripe webhook fires
        ↓
Webhook updates Firebase: verified=true, verificationPlan='verified'
        ↓
Listing now shows Verified badge + ranks higher in search
        ↓
If subscription cancelled → Webhook downgrades to free
```

---

## Costs Summary

| Service | Monthly Cost |
|---------|-------------|
| Vercel Hosting | ₹0 |
| Firebase (Blaze - pay as you go) | ₹0 (within free limits) |
| Google Maps API | ₹0 (within $200 free credit) |
| Stripe | ₹0 (2% only when you receive payments) |
| Domain (homyfind.in) | ~₹46/month |
| **Total fixed cost** | **~₹46/month** |
