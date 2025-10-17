import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const bookingService = {
  // Tạo booking mới
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post(
        endpoints.bookings.create(),
        bookingData
      );
      return response.data;
    } catch (error) {
      // Enhanced error handling with specific error codes
      const errorResponse = {
        message: error.response?.data?.message || 'Failed to create booking',
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        details: error.response?.data?.details || null,
        status: error.response?.status || 500,
      };

      // Attach the enhanced error info to the error object
      error.enhancedError = errorResponse;
      throw error;
    }
  },

  // Lấy booking theo ID
  async getBookingById(id) {
    const response = await apiClient.get(endpoints.bookings.getById(id));
    return response.data;
  },

  // Lấy bookings của user
  async getUserBookings(userId, params = {}) {
    const response = await apiClient.get(
      endpoints.bookings.getUserBookings(userId),
      { params }
    );
    return response.data;
  },

  // Cập nhật status booking
  async updateBookingStatus(id, status, notes) {
    const response = await apiClient.patch(
      endpoints.bookings.updateStatus(id),
      { status, notes }
    );
    return response.data;
  },

  // Hủy booking
  async cancelBooking(id, reason) {
    try {
      const response = await apiClient.patch(endpoints.bookings.cancel(id), {
        reason,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // Hoàn thành booking
  async completeBooking(id, completionData) {
    const response = await apiClient.post(
      endpoints.bookings.complete(id),
      completionData
    );
    return response.data;
  },

  // Check deposit status
  async checkDepositStatus(id) {
    const response = await apiClient.get(endpoints.bookings.checkDeposit(id));
    return response.data;
  },

  // Staff booking helper methods

  // Fetch all renters for staff booking form
  async fetchRenters() {
    try {
      const response = await apiClient.get(endpoints.renters.getAll());

      // Handle different response structures
      let rentersArray = [];
      if (response.data?.data?.renters) {
        // Backend format: { success: true, data: { renters } }
        rentersArray = response.data.data.renters;
      } else if (response.data?.renters) {
        // Direct format: { renters: [...] }
        rentersArray = response.data.renters;
      } else if (Array.isArray(response.data)) {
        // Array format: [...]
        rentersArray = response.data;
      }

      // Return in consistent format
      return {
        data: {
          renters: rentersArray,
        },
      };
    } catch (error) {
      console.error('Error fetching renters:', error);
      throw error;
    }
  },

  // Fetch active stations for staff booking form
  async fetchActiveStations() {
    try {
      const response = await apiClient.get(endpoints.stations.getAll());

      // Handle different response structures
      let stationsArray = [];
      if (response.data?.data?.stations) {
        // Backend format: { success: true, data: { stations } }
        stationsArray = response.data.data.stations;
      } else if (response.data?.stations) {
        // Direct format: { stations: [...] }
        stationsArray = response.data.stations;
      } else if (Array.isArray(response.data)) {
        // Array format: [...]
        stationsArray = response.data;
      }

      // Filter active stations on frontend since backend doesn't support status filter
      const activeStations = stationsArray.filter(
        station => station.status === 'ACTIVE'
      );

      // Return in consistent format
      return {
        data: {
          stations: activeStations,
        },
      };
    } catch (error) {
      console.error('Error fetching active stations:', error);
      throw error;
    }
  },

  // Fetch available vehicles for a station during a specific time period
  async fetchAvailableVehicles(stationId, startTime, endTime) {
    try {
      const response = await apiClient.post(
        endpoints.stations.getVehiclesDuringPeriod(),
        {
          stationId,
          startTime,
          endTime,
        }
      );

      // Handle different response structures
      let vehiclesArray = [];
      if (response.data?.data?.availableVehicles) {
        // Backend format: { success: true, data: { availableVehicles } }
        vehiclesArray = response.data.data.availableVehicles;
      } else if (response.data?.availableVehicles) {
        // Direct format: { availableVehicles: [...] }
        vehiclesArray = response.data.availableVehicles;
      } else if (Array.isArray(response.data)) {
        // Array format: [...]
        vehiclesArray = response.data;
      }

      // Return in consistent format
      return {
        data: {
          availableVehicles: vehiclesArray,
        },
      };
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      throw error;
    }
  },
};
