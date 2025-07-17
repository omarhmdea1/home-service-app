import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACst_zKrO0ZREqNry6O0egW3QMPjTAzF0",
  authDomain: "home-serve-d3d4a.firebaseapp.com",
  projectId: "home-serve-d3d4a",
  storageBucket: "home-serve-d3d4a.appspot.com",
  messagingSenderId: "363939262812",
  appId: "1:363939262812:web:d9626675a03c1e235a5199",
  measurementId: "G-YW2XGSCP7Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app, auth };
