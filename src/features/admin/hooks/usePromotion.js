import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export function usePromotion() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.promotions.getAll());
      setPromotions(response.data.promotions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch promotions');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.promotions.getActive());
      return response.data.promotions || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch active promotions');
      console.error('Error fetching active promotions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPromotionById = async id => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.promotions.getById(id));
      return response.data.promotion;
    } catch (err) {
      setError(err.message || 'Failed to fetch promotion');
      console.error('Error fetching promotion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPromotionByCode = async code => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        endpoints.promotions.getByCode(code)
      );
      return response.data.promotion;
    } catch (err) {
      setError(err.message || 'Failed to fetch promotion by code');
      console.error('Error fetching promotion by code:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async promotionData => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(
        endpoints.promotions.create(),
        promotionData
      );
      setPromotions(prev => [response.data.promotion, ...prev]);
      return response.data.promotion;
    } catch (err) {
      setError(err.message || 'Failed to create promotion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePromotion = async (id, promotionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(
        endpoints.promotions.update(id),
        promotionData
      );
      setPromotions(prev =>
        prev.map(p => (p.id === id ? response.data.promotion : p))
      );
      return response.data.promotion;
    } catch (err) {
      setError(err.message || 'Failed to update promotion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePromotion = async id => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(endpoints.promotions.delete(id));
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete promotion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    fetchActivePromotions,
    getPromotionById,
    getPromotionByCode,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
}
