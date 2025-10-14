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
    const response = await apiClient.post(
      endpoints.bookings.create(),
      bookingData
    );
    return response.data;
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
    const response = await apiClient.patch(endpoints.bookings.cancel(id), {
      reason,
    });
    return response.data;
  },

  // Hoàn thành booking
  async completeBooking(id, completionData) {
    const response = await apiClient.post(
      endpoints.bookings.complete(id),
      completionData
    );
    return response.data;
  },
};
