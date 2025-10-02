import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { endpoints } from '../../shared/lib/endpoints';
import { useApi } from '../../shared/hooks/useApi';

export function usePromotion() {
  const [promotions, setPromotions] = useState([]);
  const { get, post, put, del, loading } = useApi();

  const fetchPromotions = async () => {
    try {
      const response = await get(endpoints.promotions.getAll());
      setPromotions(response.data.promotions || []);
    } catch (err) {
      // Error already handled by useApi
      console.error('Failed to fetch promotions:', err.message);
    }
  };

  const fetchActivePromotions = async () => {
    try {
      const response = await get(endpoints.promotions.getActive());
      return response.data.promotions || [];
    } catch (err) {
      console.error('Failed to fetch active promotions:', err.message);
      return [];
    }
  };

  const getPromotionById = async id => {
    try {
      const response = await get(endpoints.promotions.getById(id));
      return response.data.promotion;
    } catch (err) {
      console.error('Failed to fetch promotion:', err.message);
      throw err;
    }
  };

  const getPromotionByCode = async code => {
    try {
      const response = await get(endpoints.promotions.getByCode(code));
      return response.data.promotion;
    } catch (err) {
      console.error('Failed to fetch promotion by code:', err.message);
      return null;
    }
  };

  const createPromotion = async promotionData => {
    try {
      const response = await post(
        endpoints.promotions.create(),
        promotionData
      );
      
      if (response.success) {
        toast.success('Promotion created successfully');
        setPromotions(prev => [response.data.promotion, ...prev]);
        return response.data.promotion;
      }
    } catch (err) {
      // Error already handled by useApi
      throw err;
    }
  };

  const updatePromotion = async (id, promotionData) => {
    try {
      const response = await put(
        endpoints.promotions.update(id),
        promotionData
      );
      
      if (response.success) {
        toast.success('Promotion updated successfully');
        setPromotions(prev =>
          prev.map(p => (p.id === id ? response.data.promotion : p))
        );
        return response.data.promotion;
      }
    } catch (err) {
      // Error already handled by useApi
      throw err;
    }
  };

  const deletePromotion = async id => {
    try {
      await del(endpoints.promotions.delete(id));
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast.success('Promotion deleted successfully');
    } catch (err) {
      // Error already handled by useApi
      throw err;
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    fetchPromotions,
    fetchActivePromotions,
    getPromotionById,
    getPromotionByCode,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
}
