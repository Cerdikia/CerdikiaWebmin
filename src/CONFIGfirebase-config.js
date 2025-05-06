// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor auth supaya bisa digunakan di komponen lain
export const auth = getAuth(app);
