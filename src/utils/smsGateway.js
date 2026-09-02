// src/utils/smsGateway.js

// Emergency Control Center Phone Number (Replace with actual demo hotline)
export const EMERGENCY_SMS_HOTLINE = '+919876543210';

// Short code mappings to minimize SMS character length (under 160 chars)
const TYPE_CODES = {
  medical: 'MED',
  rescue: 'RES',
  food: 'FOOD',
  water: 'WATR',
  shelter: 'SHEL',
  transportation: 'TRAN',
  other: 'OTHR',
};

const CODE_TO_TYPE = {
  MED: 'medical',
  RES: 'rescue',
  FOOD: 'food',
  WATR: 'water',
  SHEL: 'shelter',
  TRAN: 'transportation',
  OTHR: 'other',
};

/**
 * Compresses an emergency request into a short SMS string.
 * Format: RLINK*TYPE*URGENCY*PEOPLE*LAT*LNG*DESCRIPTION
 * Example: RLINK*MED*HIGH*3*11.2580*75.7920*Heart patient trapped
 */
export function encodeRequestToSMS(request) {
  const typeCode = TYPE_CODES[request.type] || 'OTHR';
  const urgency = (request.urgency || 'MED').toUpperCase().substring(0, 4);
  const people = request.peopleCount || 1;
  const lat = request.location?.lat ? request.location.lat.toFixed(4) : '0';
  const lng = request.location?.lng ? request.location.lng.toFixed(4) : '0';
  const desc = (request.description || '').replace(/[*#]/g, ' ').substring(0, 50);

  return `RLINK*${typeCode}*${urgency}*${people}*${lat}*${lng}*${desc}`;
}

/**
 * Decodes an incoming SMS payload back into a structured database object.
 * Used by Admin / Control Center to ingest offline SMS reports.
 */
export function decodeSMSToRequest(smsString) {
  const parts = smsString.trim().split('*');
  if (parts.length < 6 || parts[0] !== 'RLINK') {
    return null; // Invalid format
  }

  const [_, typeCode, urgency, people, lat, lng, ...descParts] = parts;

  return {
    type: CODE_TO_TYPE[typeCode] || 'other',
    urgency: urgency.toLowerCase(),
    peopleCount: parseInt(people, 10) || 1,
    location: {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    },
    description: descParts.join('*') || 'Sent via Offline SMS',
    viaSMS: true,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Triggers the device's native SMS application with prefilled message and number.
 * Works completely OFFLINE on iOS and Android.
 */
export function openNativeSMS(request, phoneNumber = EMERGENCY_SMS_HOTLINE) {
  const encodedBody = encodeURIComponent(encodeRequestToSMS(request));
  
  // iOS uses '&body=', Android uses '?body='
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const separator = isIOS ? '&' : '?';

  const smsUrl = `sms:${phoneNumber}${separator}body=${encodedBody}`;
  window.location.href = smsUrl;
}
