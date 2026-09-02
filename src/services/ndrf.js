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
// CREATE NDRF TEAM
// ========================================

export async function createNdrfTeam(data) {
  const ndrfTeamData = {
    userId: data.userId || null,

    name: data.name,

    assignedRedZoneIds:
      data.assignedRedZoneIds || [],

    status:
      data.status || "available",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ndrfTeamRef = await addDoc(
    collection(db, "ndrfTeams"),
    ndrfTeamData
  );

  // If a user is assigned to this NDRF team,
  // give that user the NDRF role.
  if (data.userId) {
    const userRef = doc(
      db,
      "users",
      data.userId
    );

    await updateDoc(userRef, {
      role: "ndrf",
    });
  }

  return ndrfTeamRef.id;
}


// ========================================
// GET ONE NDRF TEAM
// ========================================

export async function getNdrfTeam(
  ndrfTeamId
) {
  const ndrfTeamRef = doc(
    db,
    "ndrfTeams",
    ndrfTeamId
  );

  const ndrfTeamSnapshot = await getDoc(
    ndrfTeamRef
  );

  if (!ndrfTeamSnapshot.exists()) {
    throw new Error(
      "NDRF team not found."
    );
  }

  return {
    id: ndrfTeamSnapshot.id,
    ...ndrfTeamSnapshot.data(),
  };
}


// ========================================
// GET MY NDRF TEAM
// ========================================

export async function getMyNdrfTeam(
  userId
) {
  const teamsQuery = query(
    collection(db, "ndrfTeams"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(
    teamsQuery
  );

  if (snapshot.empty) {
    return null;
  }

  const teamDocument =
    snapshot.docs[0];

  return {
    id: teamDocument.id,
    ...teamDocument.data(),
  };
}


// ========================================
// REALTIME NDRF TEAM LISTENER
// ========================================

export function subscribeToNdrfTeam(
  ndrfTeamId,
  callback
) {
  const ndrfTeamRef = doc(
    db,
    "ndrfTeams",
    ndrfTeamId
  );

  return onSnapshot(
    ndrfTeamRef,
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
        "NDRF team listener error:",
        error
      );
    }
  );
}


// ========================================
// UPDATE NDRF TEAM
// ========================================

export async function updateNdrfTeam(
  ndrfTeamId,
  updates
) {
  const ndrfTeamRef = doc(
    db,
    "ndrfTeams",
    ndrfTeamId
  );

  await updateDoc(ndrfTeamRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}


// ========================================
// ASSIGN RED ZONE TO NDRF TEAM
// ========================================

export async function assignRedZoneToNdrfTeam(
  ndrfTeamId,
  redZoneId
) {
  const team = await getNdrfTeam(
    ndrfTeamId
  );

  const currentZones =
    team.assignedRedZoneIds || [];

  if (!currentZones.includes(redZoneId)) {
    currentZones.push(redZoneId);
  }

  await updateNdrfTeam(
    ndrfTeamId,
    {
      assignedRedZoneIds:
        currentZones,
    }
  );
}


// ========================================
// UPDATE NDRF TEAM STATUS
// ========================================

export async function updateNdrfTeamStatus(
  ndrfTeamId,
  status
) {
  await updateNdrfTeam(
    ndrfTeamId,
    {
      status,
    }
  );
}