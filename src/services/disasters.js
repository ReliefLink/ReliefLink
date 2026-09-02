import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// CREATE DISASTER
export async function createDisaster(data) {
  const disasterData = {
    name: data.name,
    type: data.type,
    description: data.description,

    affectedArea: data.affectedArea,

    status: "active",

    startTime: data.startTime || null,
    endTime: null,

    createdAt: serverTimestamp(),
  };

  const disasterRef = await addDoc(
    collection(db, "disasters"),
    disasterData
  );

  return disasterRef.id;
}

// GET ONE DISASTER
export async function getDisaster(disasterId) {
  const disasterRef = doc(db, "disasters", disasterId);

  const disasterSnapshot = await getDoc(disasterRef);

  if (!disasterSnapshot.exists()) {
    throw new Error("Disaster not found.");
  }

  return {
    id: disasterSnapshot.id,
    ...disasterSnapshot.data(),
  };
}

// REALTIME DISASTER LISTENER
export function subscribeToDisaster(disasterId, callback) {
  const disasterRef = doc(db, "disasters", disasterId);

  const unsubscribe = onSnapshot(
    disasterRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    (error) => {
      console.error("Disaster listener error:", error);
    }
  );

  return unsubscribe;
}

// UPDATE DISASTER
export async function updateDisaster(disasterId, updates) {
  const disasterRef = doc(db, "disasters", disasterId);

  await updateDoc(disasterRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// END DISASTER
export async function endDisaster(disasterId) {
  await updateDisaster(disasterId, {
    status: "ended",
    endTime: new Date(),
  });
}