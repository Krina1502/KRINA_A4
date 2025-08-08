// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDh6kunj6HH_7VxCvlhQbSkkX9OTXt_rTs",
  authDomain: "event-organizer-38a7e.firebaseapp.com",
  projectId: "event-organizer-38a7e",
  storageBucket: "event-organizer-38a7e.appspot.com",
  messagingSenderId: "903338553477",
  appId: "1:903338553477:web:b5d02c886006baf485f9ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use persistent auth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
