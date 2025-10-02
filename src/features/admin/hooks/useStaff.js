import { useEffect, useState } from 'react';
import { useApi } from '../../shared/hooks/useApi';
import { endpoints } from '../../shared/lib/endpoints';

export function useStaff() {
  const [staff, setStaff] = useState([]);
  const { get, post, put, del, loading } = useApi();

  const fetchStaff = async () => {
    try {
      const response = await get(endpoints.staffs.getAll());
      setStaff(response.data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const createStaff = async staffData => {
    try {
      const response = await post(endpoints.staffs.create(), staffData);
      setStaff(prev => [response.data.staff, ...prev]);
      return response.data.staff;
    } catch (err) {
      throw err;
    }
  };

  const updateStaff = async (id, staffData) => {
    try {
      const response = await put(endpoints.staffs.update(id), staffData);
      setStaff(prev => prev.map(s => (s.id === id ? response.data.staff : s)));
      return response.data.staff;
    } catch (err) {
      throw err;
    }
  };

  const softDeleteStaff = async id => {
    try {
      await put(endpoints.staffs.softDelete(id));
      setStaff(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, softDeleted: true, accountStatus: 'SUSPENDED' }
            : s
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const deleteStaff = async id => {
    try {
      await del(endpoints.staffs.delete(id));
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    fetchStaff,
    createStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  };
}
