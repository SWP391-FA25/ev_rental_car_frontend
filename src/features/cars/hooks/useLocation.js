import { useCallback, useState } from 'react';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    // Check permission state first
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(result => {
          if (result.state === 'denied') {
            setError(
              'Location access is permanently denied. Please enable it in browser settings.'
            );
            setLoading(false);
            return;
          }
        })
        .catch(() => {
          // Continue with getCurrentPosition anyway
        });
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          address: null, // Will be filled by geocoding if needed
        };
        setUserLocation(location);
        setError(null); // Clear any previous errors
        setLoading(false);
      },
      error => {
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            // Check if this is a real denial or browser quirk
            if (navigator.permissions) {
              navigator.permissions
                .query({ name: 'geolocation' })
                .then(result => {
                  if (result.state === 'granted') {
                    // Don't show error if permission is actually granted
                    setError(null);
                  } else {
                    errorMessage =
                      'Location access denied. Please allow location access in your browser settings.';
                    setError(errorMessage);
                  }
                });
            } else {
              errorMessage =
                'Location access denied. Please allow location access in your browser settings.';
              setError(errorMessage);
            }
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              'Location information is unavailable. Please check your GPS/network connection.';
            setError(errorMessage);
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            setError(errorMessage);
            break;
          default:
            errorMessage = `Location error: ${
              error.message || 'Unknown error occurred'
            }`;
            setError(errorMessage);
            break;
        }

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  const setLocation = useCallback(location => {
    if (location) {
      // Ensure consistent GeoJSON object structure
      const normalizedLocation = {
        type: 'Point',
        coordinates: location.coordinates || [location.lng, location.lat],
        accuracy: location.accuracy || null,
        timestamp: location.timestamp || Date.now(),
        address: location.address || null,
      };
      setUserLocation(normalizedLocation);
    } else {
      setUserLocation(null);
    }
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setError(null);
  }, []);

  return {
    userLocation,
    loading,
    error,
    getCurrentLocation,
    setLocation,
    clearLocation,
  };
};
