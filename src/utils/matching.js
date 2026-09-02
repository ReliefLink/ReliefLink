// src/utils/matching.js

import { calculateDistance } from './distance.js';
import { findEnclosingRedZone } from './geofence.js';

// Search radii steps in kilometers
const SEARCH_RADII_KM = [2, 5, 10, 20];

/**
 * Maps incoming request types to volunteer skill types.
 */
export const REQUEST_TO_VOLUNTEER_TYPE_MAP = {
  medical: 'medical',
  rescue: 'rescue',
  transportation: 'rescue',
  food: 'resource',
  water: 'resource',
  shelter: 'resource',
  other: 'rescue',
};

/**
 * Determines the routing and assignment for an incoming assistance request.
 * 
 * @param {Object} request The incoming request object
 * @param {Array<Object>} activeRedZones Active Red Zones
 * @param {Array<Object>} availableVolunteers Approved & available volunteers
 * @param {Array<string>} [excludedVolunteerIds=[]] IDs to skip (e.g. if previously declined)
 * @returns {{
 *   isRedZone: boolean,
 *   redZoneId: string|null,
 *   assignedNdrfTeamId: string|null,
 *   assignedVolunteerId: string|null,
 *   status: string,
 *   matchedDistanceKm: number|null
 * }}
 */
export function routeAndMatchRequest(
  request,
  activeRedZones = [],
  availableVolunteers = [],
  excludedVolunteerIds = []
) {
  // Step 1: Check Red Zone enclosure
  const matchedRedZone = findEnclosingRedZone(request.location, activeRedZones);

  if (matchedRedZone) {
    return {
      isRedZone: true,
      redZoneId: matchedRedZone.id,
      assignedNdrfTeamId: matchedRedZone.assignedNdrfTeamId || null,
      assignedVolunteerId: null,
      status: matchedRedZone.assignedNdrfTeamId ? 'assigned' : 'pending',
      matchedDistanceKm: null,
    };
  }

  // Step 2: Outside Red Zone -> Match Volunteer by Category
  const requiredVolunteerType = REQUEST_TO_VOLUNTEER_TYPE_MAP[request.type] || 'rescue';

  // Filter eligible volunteers: approved, available, correct type, not previously declined
  const eligibleVolunteers = availableVolunteers.filter((vol) => {
    const isApproved = vol.approved === true;
    const isAvailable = vol.available === true;
    const isMatchingType = vol.type === requiredVolunteerType;
    const isNotExcluded = !excludedVolunteerIds.includes(vol.id) && !excludedVolunteerIds.includes(vol.userId);
    const hasLocation = vol.location && vol.location.lat != null && vol.location.lng != null;

    return isApproved && isAvailable && isMatchingType && isNotExcluded && hasLocation;
  });

  if (eligibleVolunteers.length === 0) {
    return {
      isRedZone: false,
      redZoneId: null,
      assignedNdrfTeamId: null,
      assignedVolunteerId: null,
      status: 'pending',
      matchedDistanceKm: null,
    };
  }

  // Step 3: Progressive radius search: 2km -> 5km -> 10km -> 20km
  let selectedVolunteer = null;
  let shortestDistance = Infinity;

  for (const radius of SEARCH_RADII_KM) {
    const candidatesInRadius = [];

    for (const vol of eligibleVolunteers) {
      const dist = calculateDistance(request.location, vol.location);
      if (dist <= radius) {
        candidatesInRadius.push({ volunteer: vol, distance: dist });
      }
    }

    if (candidatesInRadius.length > 0) {
      // Sort to find the nearest within this tier
      candidatesInRadius.sort((a, b) => a.distance - b.distance);
      selectedVolunteer = candidatesInRadius[0].volunteer;
      shortestDistance = candidatesInRadius[0].distance;
      break; // Found within the smallest possible radius tier!
    }
  }

  // If beyond 20km, fallback to closest eligible volunteer if any exists
  if (!selectedVolunteer) {
    const allWithDist = eligibleVolunteers.map((vol) => ({
      volunteer: vol,
      distance: calculateDistance(request.location, vol.location),
    })).sort((a, b) => a.distance - b.distance);

    selectedVolunteer = allWithDist[0].volunteer;
    shortestDistance = allWithDist[0].distance;
  }

  return {
    isRedZone: false,
    redZoneId: null,
    assignedNdrfTeamId: null,
    assignedVolunteerId: selectedVolunteer ? selectedVolunteer.id : null,
    status: selectedVolunteer ? 'assigned' : 'pending',
    matchedDistanceKm: shortestDistance !== Infinity ? shortestDistance : null,
  };
}