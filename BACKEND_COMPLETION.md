# Backend Completion Guide — What's Done & What's Left

## What's Already Working (Your Current Backend)

| Feature | Status | Where |
|---------|--------|-------|
| Firebase Firestore (database) | Working | `lib/firebase.ts`, `lib/firestore.ts` |
| Add PG listing API | Working | `app/api/add-advertisement/route.ts` |
| Search PG listings API | Working | `app/api/search-realtime/route.ts` |
| Google Maps Places API | Working | `lib/google-maps-places.ts` |
| Input validation (Zod) | Working | `lib/validations.ts` |
| Rate limiting middleware | Working | `middleware.ts` |
| Multi-language routing | Working | `i18n/` directory |
| Verified/Premium listing ranking | Working | Search API sorts by plan |

**Your backend is ~70% complete.** The core listing and search flow works. Here's what's missing for a production-ready monetized platform.

---

## What's Missing (Priority Order)

### Priority 1: User Authentication (PG Owners)
**Why**: PG owners need to log in to manage their listings and pay for verification.

**What to build:**
- Firebase Authentication (already included in your Firebase setup)
- Sign up / Login pages for PG owners
- Owner dashboard to manage their listings

**Steps:**

1. **Enable Firebase Auth** — Go to Firebase Console → Authentication → Sign-in method → Enable "Phone" and "Email/Password"

2. **Create auth utility** — `lib/auth.ts`:
```typescript
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
```

3. **Create auth context** — `contexts/AuthContext.tsx`:
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

4. **Create login/signup page** — `app/[locale]/auth/page.tsx`
   - Simple email + password form
   - Link to from "List Your PG" button
   - After login, redirect to add-listing page

5. **Protect add-listing page** — Check if user is logged in before allowing form submission

### Priority 2: Owner Dashboard
**Why**: PG owners need to see and manage their listings.

**What to build:**
- Dashboard page showing owner's listings
- Edit/delete listing functionality
- View enquiry count per listing

**Steps:**

1. **Create dashboard page** — `app/[locale]/dashboard/page.tsx`
2. **Add Firestore query** — Get listings where `ownerId == currentUser.uid`
3. **Add edit functionality** — Update existing Firestore document
4. **Add delete functionality** — Soft-delete (set `active: false`) rather than hard-delete

**Firestore function to add in `lib/firestore.ts`:**
```typescript
export async function getOwnerListings(ownerId: string): Promise<PGAdvertisement[]> {
  const q = query(
    collection(db, 'pg_advertisements'),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  // ... map documents same as searchPGAdvertisements
}

export async function updatePGAdvertisement(id: string, data: Partial<PGAdvertisement>): Promise<void> {
  const docRef = doc(db, 'pg_advertisements', id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
}
```

### Priority 3: Payment Integration (For Verified/Premium Plans)
**Why**: This is your primary revenue source — PG owners pay for better visibility.

**Cheapest option: Razorpay** (Free to set up, 2% per transaction)

**Steps:**

1. **Sign up at** https://razorpay.com (free, instant activation for Indian businesses)

2. **Install Razorpay**:
```bash
npm install razorpay
```

3. **Create payment API** — `app/api/create-order/route.ts`:
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const { plan, listingId } = await request.json();

  const amount = plan === 'premium' ? 59900 : 29900; // paise (₹599 or ₹299)

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `order_${listingId}_${Date.now()}`,
    notes: { listingId, plan },
  });

  return Response.json({ orderId: order.id, amount });
}
```

4. **Create payment verification API** — `app/api/verify-payment/route.ts`:
```typescript
import crypto from 'crypto';

export async function POST(request: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, plan } = await request.json();

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment verified — update listing in Firestore
    const { updatePGAdvertisement } = await import('@/lib/firestore');
    await updatePGAdvertisement(listingId, {
      verified: true,
      verificationPlan: plan,
    });
    return Response.json({ success: true });
  }

  return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 });
}
```

5. **Add Razorpay checkout button** on the owner dashboard:
```typescript
// Load Razorpay script in your component
const handlePayment = async (plan: 'verified' | 'premium') => {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    body: JSON.stringify({ plan, listingId }),
  });
  const { orderId, amount } = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'HomyFind',
    description: `${plan} Plan - Monthly`,
    order_id: orderId,
    handler: async (response) => {
      await fetch('/api/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          ...response,
          listingId,
          plan,
        }),
      });
      // Refresh dashboard
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

6. **Add to `.env.local`:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Priority 4: Admin Panel
**Why**: You need to manage listings, verify PG owners, and track revenue.

**Cheapest option**: Use Firebase Console directly for now. Build admin panel later.

**Quick admin tasks via Firebase Console:**
- View all listings: Firestore → `pg_advertisements` collection
- Manually verify a PG: Edit document → set `verified: true`, `verificationPlan: 'verified'`
- Delete spam listings: Delete document directly
- View users: Authentication → Users tab

**Later (when you have 100+ listings):**
- Build `/admin` page with password protection
- Add listing approval workflow
- Add revenue dashboard

### Priority 5: Image Upload
**Why**: Currently images are URL-based. PG owners need to upload photos.

**Use Firebase Storage** (5GB free on Spark plan):

```typescript
// lib/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export async function uploadPGImage(file: File, listingId: string): Promise<string> {
  const storageRef = ref(storage, `pg-images/${listingId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

### Priority 6: Google AdSense Integration
**Why**: Passive income from ad impressions and clicks.

**Steps:**
1. Sign up at https://adsense.google.com
2. Get your AdSense publisher ID (ca-pub-XXXXX)
3. Add the AdSense script to `app/layout.tsx`:
```html
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```
4. Create an AdBanner component for placing ads between listings

---

## Required Pages You Still Need to Build

| Page | Route | Purpose |
|------|-------|---------|
| Login/Signup | `/auth` | PG owner authentication |
| Owner Dashboard | `/dashboard` | Manage listings, upgrade plan |
| About Us | `/about` | Required for AdSense approval |
| Privacy Policy | `/privacy` | Required for AdSense approval |
| Contact Us | `/contact` | Required for AdSense approval |
| Terms of Service | `/terms` | Legal protection |

---

## Environment Variables to Add

```env
# Already in your .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GOOGLE_MAPS_API_KEY=...

# Add these when ready:
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## Implementation Order (Do This In Sequence)

```
Week 1: Deploy on Vercel (free) + Buy domain
         ↓
Week 2: Add About/Privacy/Contact/Terms pages
         ↓
Week 3: Add Firebase Auth + Login page
         ↓
Week 4: Build Owner Dashboard
         ↓
Week 5: Add image upload to add-listing form
         ↓
Week 6: Apply for Google AdSense
         ↓
Week 7: Integrate Razorpay for verified plans
         ↓
Week 8: Launch verified/premium plans
```

---

## Firebase Free Tier Limits (Spark Plan)

| Resource | Free Limit | Enough For |
|----------|-----------|------------|
| Firestore reads | 50,000/day | ~2,000 searches/day |
| Firestore writes | 20,000/day | ~1,000 new listings/day |
| Firestore storage | 1 GB | ~10,000 listings |
| Storage (files) | 5 GB | ~5,000 photos |
| Authentication | Unlimited | Unlimited users |
| Hosting | 10 GB/month | Not using (we use Vercel) |

These limits are more than enough for the first 6-12 months.
