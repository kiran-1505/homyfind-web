import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

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
let app: FirebaseApp | null = null;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('Firebase init skipped during build:', (error as Error).message);
}

// Firestore & Storage — safe to initialize if app exists
const db: Firestore | null = app ? getFirestore(app) : null;
const storage: FirebaseStorage | null = app ? getStorage(app) : null;

// Auth — call this function when needed (login page, dashboard)
// NOT initialized at module level to prevent build crashes
function getFirebaseAuth() {
  if (!app) {
    throw new Error('Firebase is not initialized. Check your environment variables.');
  }
  return getAuth(app);
}

export { getFirebaseAuth, db, storage, app };
