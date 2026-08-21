import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvOp6rgkEucRHbhPjR5tEga6YXJolxRTs",
  authDomain: "nth-chiller-p7854.firebaseapp.com",
  projectId: "nth-chiller-p7854",
  storageBucket: "nth-chiller-p7854.firebasestorage.app",
  messagingSenderId: "567795840707",
  appId: "1:567795840707:web:ba93040e7d30b1e2f69476"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-f3e3a5f4-fc93-4ab3-b27f-3d54fd8dade0");

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
