import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWm-dJw_pHqQ5jmIyrV1VNodeSnnH0wrM",
  authDomain: "kinetik-1234.firebaseapp.com",
  projectId: "kinetik-1234",
  storageBucket: "kinetik-1234.firebasestorage.app",
  messagingSenderId: "169247644410",
  appId: "1:169247644410:web:800455b254e06f551d4743",
  measurementId: "G-5SLG2CDF2E",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
