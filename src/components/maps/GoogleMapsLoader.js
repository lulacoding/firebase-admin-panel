import { useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';

const GoogleMapsLoader = () => {
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!GOOGLE_MAPS_API_KEY) {
        console.error('Google Maps API key is not defined');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
      };

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
      };

      document.head.appendChild(script);
    };

    if (!window.google && GOOGLE_MAPS_API_KEY) {
      loadGoogleMapsScript();
    }

    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null;
};

export default GoogleMapsLoader; 