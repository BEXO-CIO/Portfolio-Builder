/**
 * Firebase initialisation for Bexo (mybexo project).
 * Uses the Firebase JS SDK v10 — compatible with Expo managed workflow.
 * Import this file first (or any service that imports it) to ensure the app
 * is initialised before auth / firestore calls are made.
 */

import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAjdoByKWrLxmdcUa6ceMBmKV1H_K5qgC0',
  authDomain: 'mybexo.firebaseapp.com',
  projectId: 'mybexo',
  storageBucket: 'mybexo.firebasestorage.app',
  messagingSenderId: '860803616355',
  appId: '1:860803616355:web:80942687e61199197bb256',
  measurementId: 'G-9DDFB9XBV8',
};

// Avoid double-initialisation (important for Expo fast-refresh)
const existingApps = getApps();
const app = existingApps.length === 0 ? initializeApp(firebaseConfig) : existingApps[0];

// Auth — use getAuth if already initialised (guards against hot-reload errors),
// otherwise initialise with AsyncStorage persistence so the session survives restarts.
export const auth = existingApps.length === 0
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);


// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

export default app;
