import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuP1MMQ8-bpce7lgfAZE4cpse3ekwrYdw",
  authDomain: "muskan-cricket.firebaseapp.com",
  projectId: "muskan-cricket",
  storageBucket: "muskan-cricket.firebasestorage.app",
  messagingSenderId: "390289929867",
  appId: "1:390289929867:web:838ab29faab521ea2c468e",
  measurementId: "G-R4T3EL774G"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
