import { apiClient } from '../lib/apiClient';
import { endpoints } from '../lib/endpoints';

export const searchService = {
  // Search vehicles with filters
  searchVehicles: async searchParams => {
    try {
      const {
        stationId,
        pickupDate,
        returnDate,
        vehicleType,
        fuelType,
        minPrice,
        maxPrice,
        seats,
        page = 1,
        limit = 20,
      } = searchParams;

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (stationId) queryParams.append('stationId', stationId);
      if (pickupDate)
        queryParams.append('pickupDate', pickupDate.toISOString());
      if (returnDate)
        queryParams.append('returnDate', returnDate.toISOString());
      if (vehicleType && vehicleType !== 'all')
        queryParams.append('type', vehicleType);
      if (fuelType && fuelType !== 'all')
        queryParams.append('fuelType', fuelType);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (seats) queryParams.append('seats', seats);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const url = `${endpoints.vehicles.getAll()}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get available vehicles at a specific station for date range
  getAvailableVehiclesAtStation: async (stationId, pickupDate, returnDate) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('stationId', stationId);
      if (pickupDate)
        queryParams.append('pickupDate', pickupDate.toISOString());
      if (returnDate)
        queryParams.append('returnDate', returnDate.toISOString());
      queryParams.append('status', 'AVAILABLE');

      const url = `${endpoints.vehicles.getAll()}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get search suggestions based on query
  getSearchSuggestions: async query => {
    try {
      if (!query || query.length < 2)
        return { success: true, data: { suggestions: [] } };

      const response = await apiClient.get(
        `${endpoints.vehicles.getAll()}?search=${encodeURIComponent(
          query
        )}&limit=5`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Validate search parameters
  validateSearchParams: params => {
    const errors = [];

    if (!params.stationId) {
      errors.push('Please select a pickup station');
    }

    if (!params.pickupDate) {
      errors.push('Please select a pickup date');
    }

    if (!params.returnDate) {
      errors.push('Please select a return date');
    }

    if (params.pickupDate && params.returnDate) {
      if (params.returnDate <= params.pickupDate) {
        errors.push('Return date must be after pickup date');
      }

      // Check if pickup date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (params.pickupDate < today) {
        errors.push('Pickup date cannot be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
