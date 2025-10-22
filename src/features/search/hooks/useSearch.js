import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../shared/lib/toast';
import { searchService } from '../services/searchService';

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Perform vehicle search based on search parameters
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.stationId - Station ID
   * @param {Date} searchParams.pickupDate - Pickup date
   * @param {Date} searchParams.returnDate - Return date
   */
  const performSearch = useCallback(
    async searchParams => {
      try {
        setLoading(true);
        setError(null);

        // Validate required parameters
        if (
          !searchParams.stationId ||
          !searchParams.pickupDate ||
          !searchParams.returnDate
        ) {
          throw new Error(
            'Please select station, pickup date, and return date'
          );
        }

        // Validate date logic
        const pickupDate = new Date(searchParams.pickupDate);
        const returnDate = new Date(searchParams.returnDate);

        if (pickupDate >= returnDate) {
          throw new Error('Return date must be after pickup date');
        }

        if (pickupDate < new Date()) {
          throw new Error('Pickup date cannot be in the past');
        }

        // Call backend API
        const result = await searchService.searchVehiclesAtStation(
          searchParams
        );

        if (result.success) {
          // Navigate to search results page with data
          navigate('/search-results', {
            state: {
              searchParams,
              searchResults: result.data,
            },
          });

          // Show success message
          toast.success(
            `Found ${result.data.summary.availableDuringPeriod} available vehicles`
          );
        } else {
          throw new Error(result.message || 'Search failed');
        }
      } catch (err) {
        console.error('Search error:', err);
        const errorMessage = err.message || 'Search failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Clear search error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get nearby stations based on user location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers
   */
  const getNearbyStations = useCallback(async (lat, lng, radius = 30) => {
    try {
      setLoading(true);
      setError(null);

      const result = await searchService.getNearbyStations(lat, lng, radius);
      return result;
    } catch (err) {
      console.error('Nearby stations error:', err);
      setError(err.message || 'Failed to get nearby stations');
      toast.error(err.message || 'Failed to get nearby stations');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all stations
   */
  const getAllStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await searchService.getAllStations();
      return result;
    } catch (err) {
      console.error('Get stations error:', err);
      setError(err.message || 'Failed to get stations');
      toast.error(err.message || 'Failed to get stations');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    performSearch,
    getNearbyStations,
    getAllStations,
    loading,
    error,
    clearError,
  };
};
