import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from 'firebase/auth';



const firebaseConfig = {
  apiKey: "AIzaSyDITY8aay6ZKISfvJKu3SsfAyzh-chXugQ",
  authDomain: "saasakitechassignment.firebaseapp.com",
  projectId: "saasakitechassignment",
  storageBucket: "saasakitechassignment.firebasestorage.app",
  messagingSenderId: "65013905108",
  appId: "1:65013905108:web:05d049e0d5eda725df2d41",
  measurementId: "G-DYJC359YVH"
};



export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
