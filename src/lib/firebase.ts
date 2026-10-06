import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Anonymous identity is only required when submitting a new registration/order.
// Merely importing this module must not make a database request.
let pendingIdentity: Promise<string> | null = null;
export async function ensureParticipantIdentity(): Promise<string> {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser.uid;
  if (!pendingIdentity) {
    pendingIdentity = signInAnonymously(auth).then(({ user }) => user.uid).finally(() => { pendingIdentity = null; });
  }
  return pendingIdentity;
}
