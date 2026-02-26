import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Safe initialization — won't crash if env vars are missing during build
let app: ReturnType<typeof initializeApp>;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('Firebase init skipped during build:', (error as Error).message);
  app = null as any;
}

// Firestore & Storage — safe to initialize if app exists
const db = app ? getFirestore(app) : (null as any);
const storage = app ? getStorage(app) : (null as any);

// Auth — call this function when needed (login page, dashboard)
// NOT initialized at module level to prevent build crashes
function getFirebaseAuth() {
  return getAuth(app);
}

let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && app) {
  try {
    analytics = getAnalytics(app);
  } catch {
    // Analytics may fail in dev or if blocked by browser
  }
}

export { getFirebaseAuth, db, storage, app, analytics };
