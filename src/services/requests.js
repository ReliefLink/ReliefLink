import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

// ========================================
// CREATE REQUEST
// ========================================

export async function createRequest(data) {
  const requestData = {
    disasterId: data.disasterId,
    reporterId: data.reporterId,

    type: data.type,
    description: data.description,
    peopleCount: data.peopleCount,

    location: {
      lat: data.location.lat,
      lng: data.location.lng,
    },

    urgency: data.urgency,

    status: "pending",

    isRedZone: false,
    redZoneId: null,

    assignedVolunteerId: null,
    assignedNdrfTeamId: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
  };

  const requestRef = await addDoc(
    collection(db, "requests"),
    requestData
  );

  return requestRef.id;
}


// ========================================
// GET ONE REQUEST
// ========================================

export async function getRequest(requestId) {
  const requestRef = doc(db, "requests", requestId);

  const requestSnapshot = await getDoc(requestRef);

  if (!requestSnapshot.exists()) {
    throw new Error("Request not found.");
  }

  return {
    id: requestSnapshot.id,
    ...requestSnapshot.data(),
  };
}


// ========================================
// GET MY REQUESTS
// ========================================

export async function getMyRequests(userId) {
  const requestsQuery = query(
    collection(db, "requests"),
    where("reporterId", "==", userId)
  );

  const snapshot = await getDocs(requestsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}


// ========================================
// GET VOLUNTEER'S ASSIGNED TASKS
// ========================================

export async function getVolunteerTasks(volunteerId) {
  const tasksQuery = query(
    collection(db, "requests"),
    where(
      "assignedVolunteerId",
      "==",
      volunteerId
    )
  );

  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}


// ========================================
// REALTIME VOLUNTEER TASK LISTENER
// ========================================

export function subscribeToVolunteerTasks(
  volunteerId,
  callback
) {
  const tasksQuery = query(
    collection(db, "requests"),
    where(
      "assignedVolunteerId",
      "==",
      volunteerId
    )
  );

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

      callback(tasks);
    },
    (error) => {
      console.error(
        "Volunteer task listener error:",
        error
      );
    }
  );
}


// ========================================
// GET NDRF REQUESTS
// ========================================

export async function getNdrfRequests(teamId) {
  if (!teamId) {
    return [];
  }

  const requestsQuery = query(
    collection(db, "requests"),
    where(
      "assignedNdrfTeamId",
      "==",
      teamId
    )
  );

  const snapshot = await getDocs(requestsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}


// ========================================
// REALTIME NDRF REQUEST LISTENER
// ========================================

export function subscribeToNdrfRequests(
  teamId,
  callback
) {
  if (!teamId) {
    callback([]);
    return () => {};
  }

  const requestsQuery = query(
    collection(db, "requests"),
    where(
      "assignedNdrfTeamId",
      "==",
      teamId
    )
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

      callback(requests);
    },
    (error) => {
      console.error(
        "NDRF request listener error:",
        error
      );
    }
  );
}


// ========================================
// REALTIME SINGLE REQUEST LISTENER
// ========================================

export function subscribeToRequest(
  requestId,
  callback
) {
  const requestRef = doc(
    db,
    "requests",
    requestId
  );

  return onSnapshot(
    requestRef,
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
        "Request listener error:",
        error
      );
    }
  );
}


// ========================================
// UPDATE REQUEST
// ========================================

export async function updateRequest(
  requestId,
  updates
) {
  const requestRef = doc(
    db,
    "requests",
    requestId
  );

  await updateDoc(requestRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}


// ========================================
// UPDATE REQUEST STATUS
// ========================================

export async function updateRequestStatus(
  requestId,
  status
) {
  const updates = {
    status,
  };

  if (status === "resolved") {
    updates.resolvedAt =
      serverTimestamp();
  }

  await updateRequest(
    requestId,
    updates
  );
}


// ========================================
// ASSIGN VOLUNTEER
// ========================================

export async function assignVolunteer(
  requestId,
  volunteerId
) {
  await updateRequest(
    requestId,
    {
      assignedVolunteerId:
        volunteerId,

      status: "assigned",
    }
  );
}


// ========================================
// ASSIGN NDRF TEAM
// ========================================

export async function assignNdrfTeam(
  requestId,
  teamId
) {
  await updateRequest(
    requestId,
    {
      assignedNdrfTeamId:
        teamId,

      status: "assigned",
    }
  );
}


// ========================================
// UPDATE REQUEST ROUTING
// ========================================

export async function updateRequestRouting(
  requestId,
  data
) {
  await updateRequest(
    requestId,
    {
      isRedZone:
        data.isRedZone,

      redZoneId:
        data.redZoneId || null,

      assignedNdrfTeamId:
        data.assignedNdrfTeamId || null,

      assignedVolunteerId:
        data.assignedVolunteerId || null,

      status:
        data.status || "pending",
    }
  );
}


// ========================================
// ACCEPT TASK
// ========================================

export async function acceptTask(
  requestId
) {
  await updateRequestStatus(
    requestId,
    "accepted"
  );
}


// ========================================
// START TASK
// ========================================

export async function startTask(
  requestId
) {
  await updateRequestStatus(
    requestId,
    "in_progress"
  );
}


// ========================================
// COMPLETE TASK
// ========================================

export async function completeTask(
  requestId
) {
  await updateRequestStatus(
    requestId,
    "resolved"
  );
}


// ========================================
// CANCEL REQUEST
// ========================================

export async function cancelRequest(
  requestId
) {
  await updateRequestStatus(
    requestId,
    "cancelled"
  );
}


// ========================================
// RESET REQUEST FOR REASSIGNMENT
// ========================================

export async function resetRequestForReassignment(
  requestId
) {
  await updateRequest(
    requestId,
    {
      assignedVolunteerId: null,
      status: "pending",
    }
  );
}