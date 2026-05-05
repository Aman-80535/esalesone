import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from 'firebase/auth';



// Read firebase config from environment. NEXT_PUBLIC_ prefix allows usage in client-side code.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Basic sanity check in development to make missing envs visible
if (process.env.NODE_ENV !== 'production') {
  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('Missing Firebase environment variables:', missing.join(', '));
  }
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
