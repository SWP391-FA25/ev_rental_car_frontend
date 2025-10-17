import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllBookings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingService.getAllBookings(params);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async bookingData => {
    try {
      setLoading(true);
      setError(null);

      const result = await bookingService.createBooking(bookingData);

      toast.success('Booking created successfully!');
      return result;
    } catch (err) {
      // Xử lý lỗi validation với cấu trúc errors object
      let errorMessage = err.message;

      // Kiểm tra errors trực tiếp từ error object (từ apiClient interceptor)
      if (err.errors) {
        const errors = err.errors;
        const firstErrorKey = Object.keys(errors)[0];

        if (firstErrorKey && errors[firstErrorKey]?.msg) {
          errorMessage = errors[firstErrorKey].msg;
        }
      }
      // Fallback: kiểm tra enhancedError (từ bookingService)
      else if (err.enhancedError?.errors) {
        const errors = err.enhancedError.errors;
        const firstErrorKey = Object.keys(errors)[0];

        if (firstErrorKey && errors[firstErrorKey]?.msg) {
          errorMessage = errors[firstErrorKey].msg;
        }
      }
      // Fallback: kiểm tra response data trực tiếp
      else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];

        if (firstErrorKey && errors[firstErrorKey]?.msg) {
          errorMessage = errors[firstErrorKey].msg;
        }
      }
      // Fallback: sử dụng message từ enhancedError hoặc response
      else if (err.enhancedError?.message) {
        errorMessage = err.enhancedError.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id, reason) => {
    try {
      setLoading(true);
      const result = await bookingService.cancelBooking(id, reason);
      toast.success('Booking cancelled successfully!');
      return result;
    } catch (err) {
      console.log(err);

      toast(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingById = useCallback(async id => {
    try {
      setLoading(true);
      const result = await bookingService.getBookingById(id);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDepositStatus = useCallback(async id => {
    try {
      setLoading(true);
      const result = await bookingService.checkDepositStatus(id);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to check deposit status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllBookings,
    createBooking,
    cancelBooking,
    getBookingById,
    checkDepositStatus,
  };
};
