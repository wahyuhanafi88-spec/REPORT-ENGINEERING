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

// Validate if Firebase config environment variables are available
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('MASUKKAN_') &&
  firebaseConfig.projectId && !firebaseConfig.projectId.includes('MASUKKAN_') &&
  firebaseConfig.appId && !firebaseConfig.appId.includes('MASUKKAN_')
);

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    
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
