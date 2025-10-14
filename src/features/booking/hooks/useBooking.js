import { useCallback, useState } from 'react';
import { toast } from 'sonner';
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
      const errorMessage =
        err.response?.data?.message || 'Failed to create booking';
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
      const errorMessage =
        err.response?.data?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
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

  return {
    loading,
    error,
    getAllBookings,
    createBooking,
    cancelBooking,
    getBookingById,
  };
};
