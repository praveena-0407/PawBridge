// PawBridge Firebase configuration
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLv6tuDx1ilxQ3JP1-nWlEktZ3Im_Ha0E",
  authDomain: "pawbridgeweb.firebaseapp.com",
  projectId: "pawbridgeweb",
  storageBucket: "pawbridgeweb.firebasestorage.app",
  messagingSenderId: "905254824026",
  appId: "1:905254824026:web:59be993ed9313892a51063",
  measurementId: "G-3GXG7Q2JQX"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
