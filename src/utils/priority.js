// src/utils/priority.js

/**
 * Calculates a numerical priority score based on urgency and number of people affected.
 * Higher score = higher priority.
 */
export function getPriorityScore(urgency = 'medium', peopleCount = 1) {
  const weights = {
    critical: 100,
    high: 50,
    medium: 25,
    low: 10,
  };
  const baseScore = weights[urgency?.toLowerCase()] || 25;
  return baseScore + (Number(peopleCount) || 1) * 2;
}

/**
 * Sorts an array of requests so critical and high-occupancy emergencies appear first.
 */
export function sortRequestsByPriority(requests = []) {
  return [...requests].sort((a, b) => {
    const scoreA = getPriorityScore(a.urgency, a.peopleCount);
    const scoreB = getPriorityScore(b.urgency, b.peopleCount);
    return scoreB - scoreA; // Descending order (highest priority first)
  });
}

/**
 * Helper to get badge color for UI rendering.
 */
export function getPriorityBadgeColor(urgency = 'medium') {
  switch (urgency?.toLowerCase()) {
    case 'critical':
      return '#dc2626'; // Red
    case 'high':
      return '#ea580c'; // Orange
    case 'medium':
      return '#d97706'; // Amber
    case 'low':
    default:
      return '#2563eb'; // Blue
  }
}
