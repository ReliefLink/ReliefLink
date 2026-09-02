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

// CREATE RELIEF CAMP
export async function createReliefCamp(data) {
  const campData = {
    disasterId: data.disasterId,

    name: data.name,

    location: {
      lat: data.location.lat,
      lng: data.location.lng,
    },

    address: data.address || "",

    facilities: data.facilities || [],

    contact: data.contact || "",

    status: data.status || "active",

    createdAt: serverTimestamp(),
  };

  const campRef = await addDoc(
    collection(db, "reliefCamps"),
    campData
  );

  return campRef.id;
}

// GET ONE RELIEF CAMP
export async function getReliefCamp(campId) {
  const campRef = doc(db, "reliefCamps", campId);

  const campSnapshot = await getDoc(campRef);

  if (!campSnapshot.exists()) {
    throw new Error("Relief camp not found.");
  }

  return {
    id: campSnapshot.id,
    ...campSnapshot.data(),
  };
}

// UPDATE RELIEF CAMP
export async function updateReliefCamp(
  campId,
  updates
) {
  const campRef = doc(db, "reliefCamps", campId);

  await updateDoc(campRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// REALTIME RELIEF CAMP LISTENER
export function subscribeToReliefCamp(
  campId,
  callback
) {
  const campRef = doc(db, "reliefCamps", campId);

  return onSnapshot(
    campRef,
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
      console.error(
        "Relief camp listener error:",
        error
      );
    }
  );
}

// CLOSE RELIEF CAMP
export async function closeReliefCamp(campId) {
  await updateReliefCamp(campId, {
    status: "closed",
  });
}