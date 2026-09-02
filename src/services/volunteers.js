import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// ========================================
// CREATE VOLUNTEER APPLICATION
// ========================================

export async function createVolunteer(data) {
  const volunteerData = {
    userId: data.userId,
    name: data.name,
    phone: data.phone,
    type: data.type,
    organization: data.organization || null,

    // New applications always start unapproved.
    approved: false,
    available: false,

    location: data.location || null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const volunteerRef = await addDoc(
    collection(db, "volunteers"),
    volunteerData
  );

  return volunteerRef.id;
}


// ========================================
// GET VOLUNTEER
// ========================================

export async function getVolunteer(volunteerId) {
  const volunteerRef = doc(
    db,
    "volunteers",
    volunteerId
  );

  const volunteerSnapshot = await getDoc(
    volunteerRef
  );

  if (!volunteerSnapshot.exists()) {
    throw new Error("Volunteer not found.");
  }

  return {
    id: volunteerSnapshot.id,
    ...volunteerSnapshot.data(),
  };
}


// ========================================
// GET MY VOLUNTEER PROFILE
// ========================================

export async function getMyVolunteerProfile(userId) {
  const volunteersQuery = query(
    collection(db, "volunteers"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(
    volunteersQuery
  );

  if (snapshot.empty) {
    return null;
  }

  const volunteerDocument = snapshot.docs[0];

  return {
    id: volunteerDocument.id,
    ...volunteerDocument.data(),
  };
}


// ========================================
// UPDATE VOLUNTEER
// ========================================

export async function updateVolunteer(
  volunteerId,
  updates
) {
  const volunteerRef = doc(
    db,
    "volunteers",
    volunteerId
  );

  await updateDoc(volunteerRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}


// ========================================
// APPROVE VOLUNTEER
// ========================================

export async function approveVolunteer(
  volunteerId
) {
  // First get the volunteer document
  // so we know which user owns it.
  const volunteer = await getVolunteer(
    volunteerId
  );

  if (!volunteer.userId) {
    throw new Error(
      "Volunteer does not have a userId."
    );
  }

  // Mark volunteer as approved.
  await updateVolunteer(
    volunteerId,
    {
      approved: true,
      available: false,
    }
  );

  // Change the user's role from citizen
  // to volunteer.
  const userRef = doc(
    db,
    "users",
    volunteer.userId
  );

  await updateDoc(userRef, {
    role: "volunteer",
  });
}


// ========================================
// REJECT VOLUNTEER
// ========================================

export async function rejectVolunteer(
  volunteerId
) {
  const volunteer = await getVolunteer(
    volunteerId
  );

  await updateVolunteer(
    volunteerId,
    {
      approved: false,
      available: false,
    }
  );

  // Keep the user's role as citizen.
  // We intentionally do not change it here.
  if (volunteer.userId) {
    const userRef = doc(
      db,
      "users",
      volunteer.userId
    );

    await updateDoc(userRef, {
      role: "citizen",
    });
  }
}


// ========================================
// SET VOLUNTEER AVAILABILITY
// ========================================

export async function setVolunteerAvailability(
  volunteerId,
  available
) {
  await updateVolunteer(
    volunteerId,
    {
      available,
    }
  );
}


// ========================================
// UPDATE VOLUNTEER LOCATION
// ========================================

export async function updateVolunteerLocation(
  volunteerId,
  location
) {
  await updateVolunteer(
    volunteerId,
    {
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    }
  );
}


// ========================================
// REALTIME VOLUNTEER LISTENER
// ========================================

export function subscribeToVolunteer(
  volunteerId,
  callback
) {
  const volunteerRef = doc(
    db,
    "volunteers",
    volunteerId
  );

  return onSnapshot(
    volunteerRef,
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
        "Volunteer listener error:",
        error
      );
    }
  );
}


// ========================================
// ASSIGN VOLUNTEER TO REQUEST
// ========================================

export async function assignVolunteer(
  requestId,
  volunteerId
) {
  const requestRef = doc(
    db,
    "requests",
    requestId
  );

  await updateDoc(requestRef, {
    assignedVolunteerId: volunteerId,
    status: "assigned",
    updatedAt: serverTimestamp(),
  });
}