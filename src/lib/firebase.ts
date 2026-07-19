import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('MASUKKAN_') &&
  firebaseConfig.projectId && !firebaseConfig.projectId.includes('MASUKKAN_') &&
  firebaseConfig.appId && !firebaseConfig.appId.includes('MASUKKAN_')
);

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Enable offline persistence for better reliability in preview environments
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence failed-precondition: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence unimplemented in this browser.');
      }
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

// Google Auth Provider setup for Google Workspace scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('bss_google_access_token') : null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear status if token isn't in memory/localStorage anymore
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bss_google_access_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure firebase-applet-config.json');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined' && cachedAccessToken) {
      localStorage.setItem('bss_google_access_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bss_google_access_token');
  }
};


/**
 * Generic helper to fetch all documents in a collection
 */
export async function getCollectionData<T>(collectionName: string): Promise<T[] | null> {
  if (!db) return null;
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const data: T[] = [];
    snapshot.forEach((docSnap) => {
      data.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    return data;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return null;
  }
}

/**
 * Generic helper to save/overwrite a document in a collection
 */
export async function saveDocument(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, docId);
    // Remove the id from the stored payload to avoid duplication, it will be restored on fetch
    const { id, ...payload } = data;
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving document ${docId} in ${collectionName}:`, error);
    return false;
  }
}

/**
 * Generic helper to delete a document from a collection
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    return false;
  }
}

export { isFirebaseConfigured, db };
