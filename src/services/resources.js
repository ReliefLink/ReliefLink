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

// CREATE RESOURCE CAMP
export async function createResourceCamp(data) {
  const resourceCampData = {
    disasterId: data.disasterId,

    name: data.name,

    location: {
      lat: data.location.lat,
      lng: data.location.lng,
    },

    address: data.address || "",

    contact: data.contact || "",

    status: data.status || "active",

    resources: {
      food: data.resources?.food || 0,
      water: data.resources?.water || 0,
      blankets: data.resources?.blankets || 0,
      medicalSupplies:
        data.resources?.medicalSupplies || 0,
      rescueEquipment:
        data.resources?.rescueEquipment || 0,
    },

    updatedAt: serverTimestamp(),
  };

  const resourceCampRef = await addDoc(
    collection(db, "resourceCamps"),
    resourceCampData
  );

  return resourceCampRef.id;
}

// GET ONE RESOURCE CAMP
export async function getResourceCamp(
  resourceCampId
) {
  const resourceCampRef = doc(
    db,
    "resourceCamps",
    resourceCampId
  );

  const resourceCampSnapshot = await getDoc(
    resourceCampRef
  );

  if (!resourceCampSnapshot.exists()) {
    throw new Error("Resource camp not found.");
  }

  return {
    id: resourceCampSnapshot.id,
    ...resourceCampSnapshot.data(),
  };
}

// UPDATE RESOURCE CAMP
export async function updateResourceCamp(
  resourceCampId,
  updates
) {
  const resourceCampRef = doc(
    db,
    "resourceCamps",
    resourceCampId
  );

  await updateDoc(resourceCampRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// UPDATE RESOURCE QUANTITIES
export async function updateResourceQuantities(
  resourceCampId,
  resources
) {
  const resourceCampRef = doc(
    db,
    "resourceCamps",
    resourceCampId
  );

  await updateDoc(resourceCampRef, {
    resources: {
      food: resources.food ?? 0,
      water: resources.water ?? 0,
      blankets: resources.blankets ?? 0,
      medicalSupplies:
        resources.medicalSupplies ?? 0,
      rescueEquipment:
        resources.rescueEquipment ?? 0,
    },

    updatedAt: serverTimestamp(),
  });
}

// REALTIME RESOURCE CAMP LISTENER
export function subscribeToResourceCamp(
  resourceCampId,
  callback
) {
  const resourceCampRef = doc(
    db,
    "resourceCamps",
    resourceCampId
  );

  return onSnapshot(
    resourceCampRef,
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
        "Resource camp listener error:",
        error
      );
    }
  );
}

// CLOSE RESOURCE CAMP
export async function closeResourceCamp(
  resourceCampId
) {
  await updateResourceCamp(resourceCampId, {
    status: "closed",
  });
}