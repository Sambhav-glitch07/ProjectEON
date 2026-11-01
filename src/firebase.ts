/**
 * Project EON - Firebase SDK Initialization
 * Release 1.0.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Connect to the exact provisioned Firestore database instance
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutOwner() {
  return signOut(auth);
}

// Validation connection to Firestore on initialization
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (err: unknown) {
    // If offline or permission denied (empty doc), connection was still reached
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('offline')) {
      console.warn('Firestore connection warning:', msg);
      return false;
    }
    return true;
  }
}
