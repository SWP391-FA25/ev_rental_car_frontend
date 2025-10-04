import { useCallback, useEffect, useState } from 'react';
import { vehicleService } from '../services/vehicleService';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getAllVehicles();
      if (response.success) {
        setVehicles(response.data.vehicles || []);
        console.log(response.data.vehicles);
      } else {
        setError(response.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicleById = useCallback(async id => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getVehicleById(id);
      if (response.success) {
        return response.data.vehicle;
      } else {
        setError(response.message || 'Failed to fetch vehicle');
        return null;
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicleImages = useCallback(async vehicleId => {
    try {
      const response = await vehicleService.getVehicleImages(vehicleId);
      if (response.success) {
        return response.data.images || [];
      } else {
        setError(response.message || 'Failed to fetch vehicle images');
        return [];
      }
    } catch (err) {
      setError(
        err.message || 'An error occurred while fetching vehicle images'
      );
      return [];
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    getVehicleById,
    getVehicleImages,
  };
};
