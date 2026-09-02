import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function testFirestore() {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      message: "ReliefLink Firestore connection works!",
      createdAt: serverTimestamp(),
    });

    console.log("Firestore test successful:", docRef.id);
  } catch (error) {
    console.error("Firestore test failed:", error);
  }
}