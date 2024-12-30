import { GOOGLE_MAPS_API_KEY } from './keys';

// Debug logging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MAPS_KEY_DEFINED: !!GOOGLE_MAPS_API_KEY,
  MAPS_KEY_PREVIEW: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.slice(0, 8)}...` : 'undefined'
});

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not defined');
}

export { GOOGLE_MAPS_API_KEY }; 