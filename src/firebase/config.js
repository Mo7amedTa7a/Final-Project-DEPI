// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration - Your project settings from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCIwsSjPNW72yKMqPf9rkM5lvz10GzwdE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cutetap-ce6ae.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cutetap-ce6ae",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cutetap-ce6ae.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "561049694912",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:561049694912:web:9a46adacf2cbb7e4863325",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0W1QRQDFB4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Analytics (only in production environment)
let analytics = null;
if (typeof window !== "undefined" && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics initialization failed:", error);
  }
}
export { analytics };

export default app;

