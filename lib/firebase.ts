// Firebase configuration for web
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtSwGVH_rFBk6EdeQQ91VJoN4Fn6wHdU8",
  authDomain: "homyfind-app.firebaseapp.com",
  databaseURL: "https://homyfind-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "homyfind-app",
  storageBucket: "homyfind-app.firebasestorage.app",
  messagingSenderId: "1061060765252",
  appId: "1:1061060765252:web:85b0e7da05db7f0fd67e11",
  measurementId: "G-S82W1FE1QN"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, storage, app, analytics };

