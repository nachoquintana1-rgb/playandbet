import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBN62iXkuwN3oCVR7vjxCi90HTS2gaC6jI",
  authDomain: "playandbet.firebaseapp.com",
  projectId: "playandbet",
  storageBucket: "playandbet.firebasestorage.app",
  messagingSenderId: "414960647609",
  appId: "1:414960647609:web:c58a3ed151f10eb9d9ca68"
};

let app, auth, db, googleProvider;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn("Firebase initialization failed.", error);
}

export { auth, db, googleProvider };
