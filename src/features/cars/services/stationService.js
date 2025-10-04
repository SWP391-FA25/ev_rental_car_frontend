import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const stationService = {
  // Get all stations
  getAllStations: async () => {
    try {
      const response = await apiClient.get(endpoints.stations.getAll());
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get nearby stations based on user location
  getNearbyStations: async ({ lat, lng, radius = 10 }) => {
    try {
      const url = `${endpoints.stations.getNearby()}?lat=${lat}&lng=${lng}&radius=${radius}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get station by ID
  getStationById: async id => {
    try {
      const response = await apiClient.get(endpoints.stations.getById(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get vehicles at specific station
  getVehiclesAtStation: async stationId => {
    try {
      const response = await apiClient.get(
        endpoints.stations.getVehiclesAtStation(stationId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
