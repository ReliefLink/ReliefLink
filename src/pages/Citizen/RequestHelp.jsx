// Person 1 imports your LocationPicker and AI Triage
import LocationPicker from '../../maps/LocationPicker.jsx';
import { classifyEmergencyAI } from '../../utils/aiTriage.js';
import { openNativeSMS } from '../../utils/smsGateway.js';

// Inside their Citizen Request Form JSX:
<LocationPicker 
  value={formData.location} 
  onChange={(coords) => setFormData({ ...formData, location: coords })} 
  height="250px" 
/>
