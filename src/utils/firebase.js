// utils/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Create a function to get the current user
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); 
      resolve(user);
    }, reject);
  });
};

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in:", user);

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      // New user - create the document
      console.log("Creating new user document in Firestore...");
      await setDoc(userDocRef, {
        userName: user.displayName || "New User",
        userImage: user.photoURL || "", // Set initial photoURL
        userBio: "New Collector",
      });
    } else {
      // Existing user - check if photoURL has changed
      const existingPhotoURL = userDocSnapshot.data().userImage; 
      if (user.photoURL && user.photoURL !== existingPhotoURL) {
        console.log("Updating user profile picture in Firestore...");
        await updateDoc(userDocRef, {
          userImage: user.photoURL,
        });
      } else {
        console.log("User profile picture is already up-to-date.");
      }
    } 

  } catch (error) {
    console.error("Sign-in error:", error);
  }
};

const logOut = () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
};

export {
  db,
  auth,
  storage,
  signInWithGoogle,
  logOut,
  getCurrentUser, 
};