import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { endpoints } from '../../shared/lib/endpoints';
import { useApi } from '../../shared/hooks/useApi';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const { get, post, put, del, loading } = useApi();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await get(endpoints.renters.getAll());
      if (response?.success && response?.data?.renters) {
        setUsers(response.data.renters);
      }
    } catch (error) {
      // Error already handled by useApi
      console.error('Failed to fetch users:', error.message);
    }
  };

  // Create new user
  const createUser = async userData => {
    try {
      const response = await post(endpoints.renters.create(), userData);

      if (response?.success) {
        toast.success('User created successfully');
        // Add new user to the list
        setUsers(prev => [response.data.renter, ...prev]);
        return response.data.renter;
      }
    } catch (error) {
      // Error already handled by useApi
      throw error;
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const response = await put(endpoints.renters.update(userId), userData);

      if (response?.success) {
        toast.success('User updated successfully');
        // Update user in the list
        setUsers(prev =>
          prev.map(user => (user.id === userId ? response.data.renter : user))
        );
        return response.data.renter;
      }
    } catch (error) {
      // Error already handled by useApi
      throw error;
    }
  };

  // Soft delete user (suspend)
  const suspendUser = async userId => {
    try {
      const response = await put(endpoints.renters.softDelete(userId), {
        status: 'SUSPENDED',
      });

      if (response?.success) {
        toast.success('User suspended successfully');
        // Refresh the list to get updated data
        await fetchUsers();
        return response.data;
      }
    } catch (error) {
      // Error already handled by useApi
      throw error;
    }
  };

  // Delete user permanently
  const deleteUser = async userId => {
    try {
      const response = await del(endpoints.renters.delete(userId));

      if (response?.success) {
        toast.success('User deleted successfully');
        // Remove user from the list
        setUsers(prev => prev.filter(user => user.id !== userId));
        return response.data;
      }
    } catch (error) {
      // Error already handled by useApi
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async userId => {
    try {
      const response = await get(endpoints.renters.getById(userId));

      if (response?.success) {
        return response.data;
      }
    } catch (error) {
      // Error already handled by useApi
      throw error;
    }
  };

  // Filter users by search term and status
  const getFilteredUsers = (searchTerm, filterStatus) => {
    return users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        user.accountStatus?.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  };

  // Get user statistics
  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.accountStatus === 'ACTIVE').length,
      suspended: users.filter(u => u.accountStatus === 'SUSPENDED').length,
      banned: users.filter(u => u.accountStatus === 'BANNED').length,
    };
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    // State
    users,
    loading,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    suspendUser,
    deleteUser,
    getUserById,

    // Utilities
    getFilteredUsers,
    getUserStats,
  };
}
