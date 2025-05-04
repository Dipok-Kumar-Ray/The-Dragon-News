// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq4vPzIEy7I3iOivkNBlzAfrJPpvHWcfw",
  authDomain: "breaking-news-dragon.firebaseapp.com",
  projectId: "breaking-news-dragon",
  storageBucket: "breaking-news-dragon.firebasestorage.app",
  messagingSenderId: "378255486398",
  appId: "1:378255486398:web:5f45d0d13080467aec9def"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;