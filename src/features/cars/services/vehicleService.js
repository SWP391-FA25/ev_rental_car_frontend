import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async () => {
    try {
      const response = await apiClient.get(endpoints.vehicles.getAll());
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async id => {
    try {
      const response = await apiClient.get(endpoints.vehicles.getById(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get vehicle images
  getVehicleImages: async vehicleId => {
    try {
      const response = await apiClient.get(
        endpoints.vehicles.getImages(vehicleId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create vehicle (Admin/Staff only)
  createVehicle: async vehicleData => {
    try {
      const response = await apiClient.post(
        endpoints.vehicles.create(),
        vehicleData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update vehicle (Admin/Staff only)
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await apiClient.put(
        endpoints.vehicles.update(id),
        vehicleData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Soft delete vehicle (Admin/Staff only)
  softDeleteVehicle: async id => {
    try {
      const response = await apiClient.delete(
        endpoints.vehicles.softDelete(id)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload vehicle image (Admin/Staff only)
  uploadVehicleImage: async (vehicleId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.post(
        endpoints.vehicles.uploadImage(vehicleId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete vehicle image (Admin/Staff only)
  deleteVehicleImage: async (vehicleId, imageId) => {
    try {
      const response = await apiClient.delete(
        endpoints.vehicles.deleteImage(vehicleId, imageId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
