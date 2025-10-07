import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const performSearch = useCallback(
    async searchParams => {
      setLoading(true);
      setError(null);

      try {
        // Validate search parameters
        const validation = searchService.validateSearchParams(searchParams);
        if (!validation.isValid) {
          setError(validation.errors.join(', '));
          return { success: false, error: validation.errors };
        }

        // Perform search
        const response = await searchService.searchVehicles(searchParams);

        if (response.success) {
          // Navigate to cars page with search results
          const searchQuery = new URLSearchParams();

          if (searchParams.stationId)
            searchQuery.append('station', searchParams.stationId);
          if (searchParams.pickupDate)
            searchQuery.append(
              'pickupDate',
              searchParams.pickupDate.toISOString()
            );
          if (searchParams.returnDate)
            searchQuery.append(
              'returnDate',
              searchParams.returnDate.toISOString()
            );
          if (searchParams.vehicleType && searchParams.vehicleType !== 'all') {
            searchQuery.append('type', searchParams.vehicleType);
          }
          if (searchParams.fuelType && searchParams.fuelType !== 'all') {
            searchQuery.append('fuel', searchParams.fuelType);
          }

          // Navigate to cars page with search parameters
          navigate(`/cars?${searchQuery.toString()}`);

          return { success: true, data: response.data };
        } else {
          setError(response.message || 'Search failed');
          return { success: false, error: response.message };
        }
      } catch (err) {
        const errorMessage = err.message || 'An error occurred during search';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    performSearch,
    loading,
    error,
    clearError,
  };
};
