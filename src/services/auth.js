import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

// REGISTER
export async function registerUser(email, password, name, phone) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    name: name,
    phone: phone,
    role: "citizen",
    createdAt: serverTimestamp(),
  });

  return user;
}

// LOGIN
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

// GET USER PROFILE
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));

  if (!userDoc.exists()) {
    throw new Error("User profile not found.");
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  };
}

// GET USER ROLE
export async function getUserRole(uid) {
  const profile = await getUserProfile(uid);

  return profile.role;
}

// LOGOUT
export async function logoutUser() {
  await signOut(auth);
}

// LISTEN FOR AUTH CHANGES
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// GET CURRENT USER
export function getCurrentUser() {
  return auth.currentUser;
}