import { useCallback, useEffect, useMemo, useState } from 'react';
import { stationService } from '../services/stationService';

export const useNearbyStations = (userLocation, radius = 10) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(radius);

  // Memorize location to prevent unnecessary re-renders
  const memoizedLocation = useMemo(() => {
    if (
      !userLocation ||
      !userLocation.coordinates ||
      userLocation.coordinates.length < 2
    ) {
      return null;
    }
    return {
      lat: userLocation.coordinates[1], // GeoJSON: [lng, lat]
      lng: userLocation.coordinates[0],
    };
  }, [userLocation]);

  const fetchNearbyStations = useCallback(async () => {
    if (!memoizedLocation) {
      setStations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await stationService.getNearbyStations({
        lat: memoizedLocation.lat,
        lng: memoizedLocation.lng,
        radius: searchRadius,
      });

      if (response.success) {
        setStations(response.data.stations || []);
      } else {
        setError(response.message || 'Failed to fetch nearby stations');
      }
    } catch (err) {
      // Better error handling
      let errorMessage = 'An error occurred while fetching nearby stations';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 0) {
        errorMessage =
          'Cannot connect to server. Please check your internet connection.';
      } else if (err.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.status === 404) {
        errorMessage = 'API endpoint not found.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [memoizedLocation, searchRadius]);

  const updateRadius = useCallback(newRadius => {
    setSearchRadius(newRadius);
  }, []);

  const refetch = useCallback(() => {
    fetchNearbyStations();
  }, [fetchNearbyStations]);

  useEffect(() => {
    fetchNearbyStations();
  }, [fetchNearbyStations]);

  return {
    stations,
    loading,
    error,
    searchRadius,
    updateRadius,
    refetch,
  };
};
