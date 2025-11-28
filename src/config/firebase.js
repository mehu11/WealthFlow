import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCZKvEGgyaw5UbphDLRRqlY3bNHVW2O9l8",
  authDomain: "wealthflow-90fd6.firebaseapp.com",
  projectId: "wealthflow-90fd6",
  storageBucket: "wealthflow-90fd6.firebasestorage.app",
  messagingSenderId: "993008724734",
  appId: "1:993008724734:web:207ce0368c3891cb2313af",
  measurementId: "G-RJ1CQBDV7T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT these services so App.jsx can use them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;