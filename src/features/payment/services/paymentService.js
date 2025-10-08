import { apiClient } from '@/features/shared/lib/apiClient';

export const paymentService = {
  // Tạo payment link cho deposit
  async createDepositPayment(bookingId, amount, description) {
    const response = await apiClient.post('/api/payos/create', {
      bookingId,
      amount,
      description: description || `Deposit ${bookingId.substring(0, 8)}`,
    });
    return response.data;
  },

  // Lấy payment status
  async getPaymentStatus(paymentId) {
    const response = await apiClient.get(`/api/payos/status/${paymentId}`);
    return response.data;
  },
};
