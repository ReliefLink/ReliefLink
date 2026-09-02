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

// CREATE RED ZONE
export async function createRedZone(data) {
  const redZoneData = {
    disasterId: data.disasterId,

    name: data.name,

    boundary: data.boundary,

    severity: data.severity,

    description: data.description,

    assignedNdrfTeamId: data.assignedNdrfTeamId || null,

    status: "active",

    createdAt: serverTimestamp(),
  };

  const redZoneRef = await addDoc(
    collection(db, "redZones"),
    redZoneData
  );

  return redZoneRef.id;
}

// GET ONE RED ZONE
export async function getRedZone(redZoneId) {
  const redZoneRef = doc(db, "redZones", redZoneId);

  const redZoneSnapshot = await getDoc(redZoneRef);

  if (!redZoneSnapshot.exists()) {
    throw new Error("Red Zone not found.");
  }

  return {
    id: redZoneSnapshot.id,
    ...redZoneSnapshot.data(),
  };
}

// REALTIME RED ZONE LISTENER
export function subscribeToRedZone(redZoneId, callback) {
  const redZoneRef = doc(db, "redZones", redZoneId);

  const unsubscribe = onSnapshot(
    redZoneRef,
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
      console.error("Red Zone listener error:", error);
    }
  );

  return unsubscribe;
}

// UPDATE RED ZONE
export async function updateRedZone(redZoneId, updates) {
  const redZoneRef = doc(db, "redZones", redZoneId);

  await updateDoc(redZoneRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ASSIGN NDRF TEAM
export async function assignNdrfToRedZone(
  redZoneId,
  ndrfTeamId
) {
  await updateRedZone(redZoneId, {
    assignedNdrfTeamId: ndrfTeamId,
  });
}

// CLOSE RED ZONE
export async function closeRedZone(redZoneId) {
  await updateRedZone(redZoneId, {
    status: "closed",
  });
}