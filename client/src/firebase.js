// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACst_zKrO0ZREqNry6O0egW3QMPjTAzF0",
  authDomain: "home-serve-d3d4a.firebaseapp.com",
  projectId: "home-serve-d3d4a",
  storageBucket: "home-serve-d3d4a.firebasestorage.app",
  messagingSenderId: "363939262812",
  appId: "1:363939262812:web:d9626675a03c1e235a5199",
  measurementId: "G-YW2XGSCP7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
