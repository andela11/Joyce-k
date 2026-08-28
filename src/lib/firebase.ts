import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const DEFAULT_FIREBASE_CONFIG = {
  projectId: "project-3d67e178-916c-43a6-8ed",
  appId: "1:628144571376:web:17dfe5bf54d218bff9d335",
  apiKey: "AIzaSyCWAcUsXFIoCarryrqQUjucYUbY-Hwy-bU",
  authDomain: "project-3d67e178-916c-43a6-8ed.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-amouraffinitsren-c32d4bb0-dc6c-4323-a295-58f2775f5c7d",
  storageBucket: "project-3d67e178-916c-43a6-8ed.firebasestorage.app",
  messagingSenderId: "628144571376",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config?.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config?.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config?.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config?.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config?.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config?.appId || DEFAULT_FIREBASE_CONFIG.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(
  app,
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config?.firestoreDatabaseId || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId
);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
};
export type { FirebaseUser };
