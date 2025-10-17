import { bookingService } from '@/features/booking/services/bookingService';
import { calculateCompletePricing } from '@/features/booking/utils/pricingUtils';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const useStaffBooking = () => {
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
  const [submitting, setSubmitting] = useState(false);

  // Error state
  const [error, setError] = useState(null);

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

      setStations(stationsArray);
    } catch (err) {
      console.error('Error fetching stations:', err);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  }, []);

  // Fetch active promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setLoadingPromotions(true);
      const response = await apiClient.get(endpoints.promotions.getActive());
      setPromotions(response.data.promotions || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      toast.error('Failed to load promotions');
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

        console.log('🔍 VEHICLES API Response:', response);
        console.log('🔍 VEHICLES Data:', response.data);
        console.log('🔍 VEHICLES Array:', response.data?.availableVehicles);

        // Debug: Log first vehicle structure to see all fields
        if (response.data?.availableVehicles?.length > 0) {
          console.log(
            '🔍 FIRST VEHICLE STRUCTURE:',
            response.data.availableVehicles[0]
          );
          console.log(
            '🔍 FIRST VEHICLE KEYS:',
            Object.keys(response.data.availableVehicles[0])
          );
        }

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

          if (pricing) {
            console.log('🔍 VEHICLE HAS PRICING:', vehicle.id, pricing);
            return {
              ...vehicle,
              pricing: pricing,
            };
          } else {
            console.log('🔍 VEHICLE NO PRICING:', vehicle.id);
            return vehicle;
          }
        });

        console.log('🔍 VEHICLES WITH PRICING:', vehiclesWithPricing);
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

  // Load initial data
  useEffect(() => {
    fetchRenters();
    fetchStations();
    fetchPromotions();
  }, [fetchRenters, fetchStations, fetchPromotions]);

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
    console.log('🔍 CALCULATING PRICING - Form Data:', formData);
    console.log('🔍 CALCULATING PRICING - Vehicles:', vehicles);

    if (
      !formData.vehicleId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      console.log('🔍 CALCULATING PRICING - Missing required fields');
      return null;
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    console.log('🔍 CALCULATING PRICING - Selected Vehicle:', selectedVehicle);

    if (!selectedVehicle) {
      console.log('🔍 CALCULATING PRICING - Vehicle not found');
      return null;
    }

    if (!selectedVehicle.pricing) {
      console.log('🔍 CALCULATING PRICING - Vehicle has no pricing data');
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

    console.log('🔍 CALCULATING PRICING - Duration Hours:', durationHours);

    if (durationHours <= 0) {
      console.log('🔍 CALCULATING PRICING - Invalid duration');
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

    console.log(
      '🔍 CALCULATING PRICING - Selected Promotions:',
      selectedPromotions
    );

    // Calculate complete pricing using existing utility
    const pricingBreakdown = calculateCompletePricing(
      selectedVehicle.pricing,
      durationHours,
      selectedPromotions
    );

    console.log(
      '🔍 CALCULATING PRICING - Pricing Breakdown:',
      pricingBreakdown
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
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return { success: false, errors: validationErrors };
    }

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
      const errorMessage =
        err.response?.data?.message || 'Failed to create booking';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm]);

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
  };
};
