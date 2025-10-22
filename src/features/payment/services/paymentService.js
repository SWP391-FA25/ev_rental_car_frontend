import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';

export const paymentService = {
  // Tạo payment link cho deposit
  async createDepositPayment(bookingId, amount, description) {
    try {
      console.log('PaymentService - Sending request:', {
        bookingId,
        amount,
        description: description || `Deposit ${bookingId.substring(0, 8)}`,
      });

      const response = await apiClient.post(endpoints.payment.createDeposit(), {
        bookingId,
        amount,
        description: description || `Deposit ${bookingId.substring(0, 8)}`,
      });

      console.log('PaymentService - Full response:', response);
      console.log('PaymentService - Response data:', response.data);
      console.log('PaymentService - Response data.data:', response.data.data);

      // Ensure we return the correct data structure
      const result = response.data.data || response.data;
      console.log('PaymentService - Returning result:', result);

      return result;
    } catch (error) {
      console.error('PaymentService - Error:', error);
      console.error('PaymentService - Error response:', error.response?.data);
      throw error;
    }
  },

  // Tạo payment link cho rental fee
  async createRentalFeePayment(bookingId, amount, description) {
    try {
      console.log('PaymentService - RentalFee - Sending request:', {
        bookingId,
        amount,
        description: description || `Rental Fee ${bookingId.substring(0, 8)}`,
      });

      const response = await apiClient.post(
        endpoints.payment.createRentalFee(),
        {
          bookingId,
          amount,
          description: description || `Rental Fee ${bookingId.substring(0, 8)}`,
        }
      );

      // Ensure we return the correct data structure
      const result = response.data.data || response.data;
      return result;
    } catch (error) {
      console.error('PaymentService - RentalFee - Error:', error);
      console.error(
        'PaymentService - RentalFee - Error response:',
        error.response?.data
      );
      throw error;
    }
  },

  // Lấy payment status
  async getPaymentStatus(paymentId) {
    const response = await apiClient.get(
      endpoints.payment.getStatus(paymentId)
    );
    return response.data;
  },

  // Tạo thanh toán tiền mặt cho rental fee
  async createCashPayment(bookingId, amount, description) {
    try {
      const response = await apiClient.post(endpoints.payment.createCashPayment(), {
        bookingId,
        amount,
        description: description || `Rental Fee ${bookingId.substring(0, 8)}`,
      });
      const result = response.data?.data || response.data;
      return result;
    } catch (error) {
      console.error('PaymentService - Cash - Error:', error);
      throw error;
    }
  },

  // Upload bằng chứng cho thanh toán tiền mặt (multipart/form-data với field 'evidence')
  async uploadCashPaymentEvidence(paymentId, evidenceFile) {
    try {
      const fd = new FormData();
      fd.append('paymentId', paymentId);
      fd.append('evidence', evidenceFile);
      const response = await apiClient.post(
        endpoints.payment.uploadCashEvidence(),
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const result = response.data?.data || response.data;
      return result;
    } catch (error) {
      console.error('PaymentService - CashEvidence - Error:', error);
      throw error;
    }
  },
};
