import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export function useStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.staffs.getAll());
      setStaff(response.data.staff || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async staffData => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(
        endpoints.staffs.create(),
        staffData
      );
      setStaff(prev => [response.data.staff, ...prev]);
      return response.data.staff;
    } catch (err) {
      setError(err.message || 'Failed to create staff');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async (id, staffData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(
        endpoints.staffs.update(id),
        staffData
      );
      setStaff(prev => prev.map(s => (s.id === id ? response.data.staff : s)));
      return response.data.staff;
    } catch (err) {
      setError(err.message || 'Failed to update staff');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const softDeleteStaff = async id => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.patch(endpoints.staffs.softDelete(id));
      setStaff(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, softDeleted: true, accountStatus: 'SUSPENDED' }
            : s
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to soft delete staff');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async id => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(endpoints.staffs.delete(id));
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete staff');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  };
}
