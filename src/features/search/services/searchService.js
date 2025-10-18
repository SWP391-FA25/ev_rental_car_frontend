import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export const searchService = {
  /**
   * Search vehicles available during a specific period at a station
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.stationId - Station ID
   * @param {Date} searchParams.pickupDate - Pickup date
   * @param {Date} searchParams.returnDate - Return date
   * @returns {Promise<Object>} Search results
   */
  async searchVehiclesAtStation(searchParams) {
    const { stationId, pickupDate, returnDate } = searchParams;

    // Validate required parameters
    if (!stationId || !pickupDate || !returnDate) {
      throw new Error('Station ID, pickup date, and return date are required');
    }

    // Convert dates to ISO strings
    const startTime = new Date(pickupDate).toISOString();
    const endTime = new Date(returnDate).toISOString();

    try {
      const response = await apiClient.post(
        endpoints.stations.getVehiclesDuringPeriod(),
        {
          stationId,
          startTime,
          endTime,
        }
      );

      return response;
    } catch (error) {
      console.error('Search service error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to search vehicles'
      );
    }
  },

  /**
   * Get nearby stations based on user location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers (default: 10)
   * @returns {Promise<Object>} Nearby stations
   */
  async getNearbyStations(lat, lng, radius = 30) {
    try {
      const response = await apiClient.get('/api/stations/nearby', {
        params: { lat, lng, radius },
      });

      return response.data;
    } catch (error) {
      console.error('Nearby stations error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get nearby stations'
      );
    }
  },

  /**
   * Get all active stations
   * @returns {Promise<Object>} All stations
   */
  async getAllStations() {
    try {
      const response = await apiClient.get('/api/stations');
      return response.data;
    } catch (error) {
      console.error('Get stations error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get stations'
      );
    }
  },
};
