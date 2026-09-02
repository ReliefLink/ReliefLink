import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// CREATE OFFICIAL UPDATE
export async function createUpdate(data) {
  const updateData = {
    disasterId: data.disasterId,
    title: data.title,
    message: data.message,
    priority: data.priority || "normal",
    publishedBy: data.publishedBy,
    createdAt: serverTimestamp(),
  };

  const updateRef = await addDoc(
    collection(db, "updates"),
    updateData
  );

  return updateRef.id;
}

// REALTIME UPDATES LISTENER
export function subscribeToUpdates(disasterId, callback) {
  const updatesQuery = query(
    collection(db, "updates"),
    where("disasterId", "==", disasterId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    updatesQuery,
    (snapshot) => {
      const updates = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      callback(updates);
    },
    (error) => {
      console.error("Updates listener error:", error);
    }
  );
}