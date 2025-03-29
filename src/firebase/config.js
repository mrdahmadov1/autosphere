// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB_-G9h0vnQGk8c4Sksf9LZo9mMzdS5WoQ',
  authDomain: 'autosphere-801ca.firebaseapp.com',
  projectId: 'autosphere-801ca',
  storageBucket: 'autosphere-801ca.appspot.com',
  messagingSenderId: '338968389930',
  appId: '1:338968389930:web:5cd239310ac4323b071653',
  measurementId: 'G-S0HHW8P2HE',
  databaseURL: 'https://autosphere-801ca-default-rtdb.firebaseio.com',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
