import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { createBlock, setBlockTracking } from "vue";


const firebaseConfig = {
  apiKey: "AIzaSyCwjBfaaOxu0q3af_aPIlvDnpvSE1z3ms0",
  authDomain: "instant-geek.firebaseapp.com",
  projectId: "instant-geek",
  storageBucket: "instant-geek.firebasestorage.app",
  messagingSenderId: "317020332794",
  appId: "1:317020332794:web:933ab287d47fafd86cdf43",
  measurementId: "G-5F717TETW2"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };