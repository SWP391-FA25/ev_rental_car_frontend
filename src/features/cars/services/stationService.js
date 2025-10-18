import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const stationService = {
  // Get all stations
  getAllStations: async () => {
    return apiClient.get(endpoints.stations.getAll());
  },

  // Get nearby stations based on user location
  getNearbyStations: async ({ lat, lng, radius = 30 }) => {
    const url = `${endpoints.stations.getNearby()}?lat=${lat}&lng=${lng}&radius=${radius}`;
    return apiClient.get(url);
  },

  // Get station by ID
  getStationById: async id => {
    return apiClient.get(endpoints.stations.getById(id));
  },

  // Get vehicles at specific station
  getVehiclesAtStation: async stationId => {
    return apiClient.get(endpoints.stations.getVehiclesAtStation(stationId));
  },
};
