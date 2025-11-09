import { useAuth } from '@/app/providers/AuthProvider';
import { bookingService } from '@/features/booking/services/bookingService';
import { calculateCompletePricing } from '@/features/booking/utils/pricingUtils';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../shared/lib/toast';

export const useStaffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    renterId: '',
    stationId: '',
    startDate: undefined,
    endDate: undefined,
    startTime: '09:00',
    endTime: '18:00',
    vehicleId: '',
    promotionId: '',
    notes: '',
  });

  // Data states
  const [renters, setRenters] = useState([]);
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Loading states
  const [loadingRenters, setLoadingRenters] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  // Initialize loadingAssignment to true for STAFF to prevent fetching stations before assignments are loaded
  const [loadingAssignment, setLoadingAssignment] = useState(
    user?.role === 'STAFF'
  );
  const [submitting, setSubmitting] = useState(false);

  // Assignment state
  const [assignedStationIds, setAssignedStationIds] = useState([]);

  // Error state
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErros] = useState([]);

  // Fetch renters
  const fetchRenters = useCallback(async () => {
    try {
      setLoadingRenters(true);
      const response = await bookingService.fetchRenters();

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

      setRenters(rentersArray);
    } catch (err) {
      console.error('Error fetching renters:', err);
      toast.error('Failed to load renters');
    } finally {
      setLoadingRenters(false);
    }
  }, []);

  // Fetch staff assignments
  const fetchStaffAssignments = useCallback(async () => {
    // Only fetch for STAFF role
    if (user?.role !== 'STAFF' || !user?.id) {
      setAssignedStationIds([]);
      setLoadingAssignment(false);
      return;
    }

    try {
      setLoadingAssignment(true);
      const response = await apiClient.get(
        endpoints.assignments.getByStaffId(user.id)
      );

      const payload = response?.data;
      // Support both list and single assignment response shapes
      let raw = [];
      if (Array.isArray(payload?.assignments)) {
        raw = payload.assignments;
      } else if (payload?.assignment && typeof payload.assignment === 'object') {
        raw = [payload.assignment];
      } else if (Array.isArray(payload)) {
        raw = payload;
      } else if (Array.isArray(payload?.items)) {
        raw = payload.items;
      }

      const ids = raw
        .map(a => a?.station?.id ?? a?.stationId)
        .filter(Boolean)
        .map(id => String(id));
      const uniqueIds = Array.from(new Set(ids));
      setAssignedStationIds(uniqueIds);

      if (!uniqueIds.length) {
        console.warn('Staff not assigned to any station');
      }
    } catch (err) {
      console.error('Error fetching staff assignments:', err);
      // If 404, staff has no assignment
      if (err.status === 404 || err.response?.status === 404) {
        setAssignedStationIds([]);
      } else {
        toast.error('Failed to load staff assignments');
      }
    } finally {
      setLoadingAssignment(false);
    }
  }, [user]);

  // Fetch active stations
  const fetchStations = useCallback(async () => {
    try {
      setLoadingStations(true);
      const response = await bookingService.fetchActiveStations();

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

      // Filter stations based on staff assignments
      // If user is STAFF and has assignments, only show assigned stations
      // If user is ADMIN or has no assignments, show all stations
      if (user?.role === 'STAFF' && assignedStationIds.length > 0) {
        stationsArray = stationsArray.filter(station =>
          assignedStationIds.includes(String(station.id))
        );
      } else if (user?.role === 'STAFF' && assignedStationIds.length === 0) {
        // Staff with no assignments should see empty list
        stationsArray = [];
      }

      setStations(stationsArray);
    } catch (err) {
      console.error('Error fetching stations:', err);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  }, [user, assignedStationIds]);

  // Fetch active promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setLoadingPromotions(true);
      const response = await apiClient.get(endpoints.promotions.getActive());
      setPromotions(response.data.promotions || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      // toast.error('Failed to load promotions');
    } finally {
      setLoadingPromotions(false);
    }
  }, []);

  // Fetch available vehicles based on station and time range
  const fetchVehicles = useCallback(
    async (stationId, startDateTime, endDateTime) => {
      if (!stationId || !startDateTime || !endDateTime) {
        setVehicles([]);
        return;
      }

      try {
        setLoadingVehicles(true);
        setError(null);
        const response = await bookingService.fetchAvailableVehicles(
          stationId,
          startDateTime,
          endDateTime
        );

        // Get available vehicles from response
        const availableVehicles = response.data?.availableVehicles || [];

        // Map vehicles to ensure consistent pricing field name
        const vehiclesWithPricing = availableVehicles.map(vehicle => {
          // Check for different possible pricing field names
          const pricing =
            vehicle.pricing ||
            vehicle.price ||
            vehicle.rates ||
            vehicle.vehiclePricing;

          return {
            ...vehicle,
            pricing: pricing,
          };
        });

        setVehicles(vehiclesWithPricing);

        if (availableVehicles.length === 0) {
          toast.info('No vehicles available for the selected time range');
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load available vehicles');
        toast.error('Failed to load available vehicles');
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    },
    []
  );

  // Fetch staff assignments first (for STAFF role)
  useEffect(() => {
    fetchStaffAssignments();
  }, [fetchStaffAssignments]);

  // Load initial data
  useEffect(() => {
    fetchRenters();
    fetchPromotions();
  }, [fetchRenters, fetchPromotions]);

  // Fetch stations after assignments are loaded (for STAFF) or immediately (for ADMIN)
  useEffect(() => {
    // For STAFF: wait until assignment is loaded
    // For ADMIN or other roles: fetch immediately
    if (user?.role !== 'STAFF' || !loadingAssignment) {
      fetchStations();
    }
  }, [fetchStations, user, loadingAssignment, assignedStationIds]);

  // Auto-fetch vehicles when station and time range are selected
  useEffect(() => {
    if (
      formData.stationId &&
      formData.startDate &&
      formData.endDate &&
      formData.startTime &&
      formData.endTime
    ) {
      // Construct datetime objects
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(
        parseInt(formData.startTime.split(':')[0]),
        parseInt(formData.startTime.split(':')[1])
      );

      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(
        parseInt(formData.endTime.split(':')[0]),
        parseInt(formData.endTime.split(':')[1])
      );

      // Validate dates
      if (endDateTime > startDateTime) {
        fetchVehicles(
          formData.stationId,
          startDateTime.toISOString(),
          endDateTime.toISOString()
        );
      } else {
        setVehicles([]);
        setFormData(prev => ({ ...prev, vehicleId: '' }));
      }
    } else {
      setVehicles([]);
      setFormData(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [
    formData.stationId,
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
    fetchVehicles,
  ]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation erros khi user thay đổi
    setValidationErros([]);

    // Clear vehicle selection if station or time changes
    if (
      ['stationId', 'startDate', 'endDate', 'startTime', 'endTime'].includes(
        field
      )
    ) {
      setFormData(prev => ({ ...prev, vehicleId: '' }));
    }
  }, []);

  // Calculate pricing breakdown
  const calculatePricing = useCallback(() => {
    if (
      !formData.vehicleId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      return null;
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

    if (!selectedVehicle) {
      return null;
    }

    if (!selectedVehicle.pricing) {
      return null;
    }

    // Calculate duration
    const startDateTime = new Date(formData.startDate);
    startDateTime.setHours(
      parseInt(formData.startTime.split(':')[0]),
      parseInt(formData.startTime.split(':')[1])
    );

    const endDateTime = new Date(formData.endDate);
    endDateTime.setHours(
      parseInt(formData.endTime.split(':')[0]),
      parseInt(formData.endTime.split(':')[1])
    );

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    if (durationHours <= 0) {
      return null;
    }

    // Get selected promotions
    const selectedPromotions = [];
    if (formData.promotionId && formData.promotionId !== 'none') {
      const promotion = promotions.find(p => p.id === formData.promotionId);
      if (promotion) {
        selectedPromotions.push(promotion);
      }
    }

    // Calculate complete pricing using existing utility
    const pricingBreakdown = calculateCompletePricing(
      selectedVehicle.pricing,
      durationHours,
      selectedPromotions
    );

    return {
      ...pricingBreakdown,
      durationHours,
      startDateTime,
      endDateTime,
    };
  }, [formData, vehicles, promotions]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.renterId) {
      errors.push('Please select a renter');
    }

    if (!formData.stationId) {
      errors.push('Please select a station');
    }

    if (!formData.startDate) {
      errors.push('Please select a start date');
    }

    if (!formData.endDate) {
      errors.push('Please select an end date');
    }

    if (!formData.vehicleId) {
      errors.push('Please select a vehicle');
    }

    // Validate time range
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startTime &&
      formData.endTime
    ) {
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(
        parseInt(formData.startTime.split(':')[0]),
        parseInt(formData.startTime.split(':')[1])
      );

      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(
        parseInt(formData.endTime.split(':')[0]),
        parseInt(formData.endTime.split(':')[1])
      );

      if (endDateTime <= startDateTime) {
        errors.push('End time must be after start time');
      }

      // Check if start time is in the past
      const now = new Date();
      if (startDateTime < now) {
        errors.push('Start time cannot be in the past');
      }
    }

    return errors;
  }, [formData]);

  // Submit booking
  const submitBooking = useCallback(async () => {
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErros(errors);
      return { success: false, errors };
    }

    setValidationErros([]);

    try {
      setSubmitting(true);
      setError(null);

      // Construct datetime strings
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(
        parseInt(formData.startTime.split(':')[0]),
        parseInt(formData.startTime.split(':')[1])
      );

      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(
        parseInt(formData.endTime.split(':')[0]),
        parseInt(formData.endTime.split(':')[1])
      );

      // Prepare booking data
      const bookingData = {
        renterId: formData.renterId,
        vehicleId: formData.vehicleId,
        stationId: formData.stationId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        promotions:
          formData.promotionId && formData.promotionId !== 'none'
            ? [formData.promotionId]
            : [],
        notes: formData.notes || undefined,
      };

      // Create booking using existing service
      const result = await bookingService.createBooking(bookingData);

      toast.success('Booking created successfully!');

      // Navigate to deposit payment page
      if (result?.booking?.id && result?.booking?.depositAmount) {
        navigate(
          `/payment/deposit?bookingId=${result.booking.id}&amount=${result.booking.depositAmount}`
        );
      }

      // Reset form
      setFormData({
        renterId: '',
        stationId: '',
        startDate: undefined,
        endDate: undefined,
        startTime: '09:00',
        endTime: '18:00',
        vehicleId: '',
        promotionId: '',
        notes: '',
      });
      setVehicles([]);

      return { success: true, data: result };
    } catch (err) {
      console.error('Error creating booking:', err);
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
      setSubmitting(false);
    }
  }, [formData, validateForm, navigate]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      renterId: '',
      stationId: '',
      startDate: undefined,
      endDate: undefined,
      startTime: '09:00',
      endTime: '18:00',
      vehicleId: '',
      promotionId: '',
      notes: '',
    });
    setVehicles([]);
    setError(null);
  }, []);

  return {
    // Form data
    formData,
    updateField,
    resetForm,

    // Data
    renters,
    stations,
    vehicles,
    promotions,

    // Loading states
    loadingRenters,
    loadingStations,
    loadingVehicles,
    loadingPromotions,
    submitting,

    // Functions
    calculatePricing,
    validateForm,
    submitBooking,
    refetchVehicles: fetchVehicles,

    // Error
    error,
    validationErrors,
  };
};
