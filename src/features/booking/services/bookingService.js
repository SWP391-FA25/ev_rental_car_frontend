import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const bookingService = {
  // Lấy tất cả bookings (với params lọc/phân trang)
  async getAllBookings(params = {}) {
    const response = await apiClient.get(endpoints.bookings.getAll(), {
      params,
    });
    return response.data;
  },
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
};
