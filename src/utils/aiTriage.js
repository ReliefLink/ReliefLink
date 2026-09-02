// src/utils/aiTriage.js

/**
 * High-speed offline keyword heuristics when API or network is unavailable.
 */
const CRITICAL_KEYWORDS = [
  'chest pain', 'heart attack', 'unconscious', 'breathing', 'oxygen', 'bleeding',
  'drowning', 'water rising', 'trapped on roof', 'collapse', 'infant', 'newborn',
  'pregnant in labor', 'severe injury', 'stroke', 'amputation', 'submerged'
];

const HIGH_KEYWORDS = [
  'elderly', 'diabetic', 'insulin', 'fracture', 'asthma', 'stranded',
  'high fever', 'wound', 'wheelchair', 'disabled', 'no food for days'
];

const RESCUE_KEYWORDS = ['boat', 'evacuate', 'stuck', 'rooftop', 'flooded', 'landslide', 'tree fell'];
const MEDICAL_KEYWORDS = ['doctor', 'nurse', 'medicine', 'hospital', 'tablet', 'bandage', 'fever', 'pain'];
const RESOURCE_KEYWORDS = ['food', 'water', 'ration', 'milk', 'baby food', 'blanket', 'clothes'];

/**
 * Offline NLP Rule-based fallback classifier
 */
function localRuleBasedTriage(description = '', peopleCount = 1) {
  const text = description.toLowerCase();
  let urgency = 'medium';
  let reasoning = 'Standard emergency priority based on description.';

  // Check Critical
  if (CRITICAL_KEYWORDS.some((kw) => text.includes(kw)) || Number(peopleCount) >= 5) {
    urgency = 'critical';
    reasoning = 'Identified immediate life threat, severe medical distress, or high casualty count.';
  } else if (HIGH_KEYWORDS.some((kw) => text.includes(kw))) {
    urgency = 'high';
    reasoning = 'Vulnerable individuals or urgent medical condition detected.';
  } else if (text.length < 10) {
    urgency = 'low';
    reasoning = 'Routine assistance or low severity request.';
  }

  // Auto-detect type if not specified
  let detectedType = 'rescue';
  if (MEDICAL_KEYWORDS.some((kw) => text.includes(kw))) detectedType = 'medical';
  else if (RESOURCE_KEYWORDS.some((kw) => text.includes(kw))) detectedType = 'food';

  return { urgency, detectedType, reasoning, source: 'Offline Rule Engine' };
}

/**
 * Main AI Classifier: Uses Gemini API if API key is provided, otherwise uses local NLP.
 * 
 * @param {string} description Citizen's description of emergency
 * @param {number} peopleCount Number of people trapped
 * @param {string} [apiKey] Optional Gemini API Key
 * @returns {Promise<{urgency: 'critical'|'high'|'medium'|'low', detectedType: string, reasoning: string, source: string}>}
 */
export async function classifyEmergencyAI(description, peopleCount = 1, apiKey = null) {
  if (!description || description.trim().length === 0) {
    return { urgency: 'medium', detectedType: 'other', reasoning: 'No description provided.', source: 'Default' };
  }

  // If no Gemini API key or device is offline, run instant local classifier
  if (!apiKey || !navigator.onLine) {
    return localRuleBasedTriage(description, peopleCount);
  }

  try {
    const prompt = `You are an emergency disaster triage AI for a rescue dispatch center.
Analyze the following citizen emergency report and classify its urgency level.

Input:
Description: "${description}"
People Count: ${peopleCount}

Respond ONLY with a JSON object in this exact schema (no markdown, no backticks):
{
  "urgency": "critical" | "high" | "medium" | "low",
  "detectedType": "medical" | "rescue" | "food" | "water" | "shelter" | "transportation" | "other",
  "reasoning": "1 short sentence explaining the triage decision."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return { ...parsed, source: 'Gemini 1.5 Flash' };
    }
  } catch (err) {
    console.warn('Gemini API call failed, falling back to local NLP triage:', err);
  }

  // Fallback if API fails
  return localRuleBasedTriage(description, peopleCount);
}
