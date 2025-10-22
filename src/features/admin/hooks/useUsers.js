import { useEffect, useState } from 'react';
import { toast } from '../../shared/lib/toast';

import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(endpoints.renters.getAll());
      if (response?.success && response?.data?.renters) {
        setUsers(response.data.renters);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);

      // More detailed error handling
      if (
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network Error')
      ) {
        toast.error(
          'Cannot connect to server. Please check if backend is running.'
        );
      } else if (error.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.status === 403) {
        toast.error('Access denied. You do not have permission to view users.');
      } else {
        toast.error(error?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async userData => {
    try {
      const response = await apiClient.post(
        endpoints.renters.create(),
        userData
      );

      if (response?.success) {
        toast.success('User created successfully');
        // Add new user to the list
        setUsers(prev => [response.data.renter, ...prev]);
        return response.data.renter;
      } else {
        toast.error(response?.message || 'Failed to create user');
        throw new Error(response?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);

      if (error.status === 409) {
        toast.error('Email already exists. Please use a different email.');
      } else if (error.status === 400) {
        toast.error('Invalid data provided. Please check your inputs.');
      } else {
        toast.error(error?.message || 'Failed to create user');
      }
      throw error;
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const response = await apiClient.put(
        endpoints.renters.update(userId),
        userData
      );

      if (response?.success) {
        toast.success('User updated successfully');
        // Update user in the list
        setUsers(prev =>
          prev.map(user => (user.id === userId ? response.data.renter : user))
        );
        return response.data.renter;
      } else {
        toast.error(response?.message || 'Failed to update user');
        throw new Error(response?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error?.message || 'Failed to update user');
      throw error;
    }
  };

  // Soft delete user (suspend)
  const suspendUser = async userId => {
    try {
      const response = await apiClient.put(
        endpoints.renters.softDelete(userId),
        { status: 'SUSPENDED' }
      );

      if (response?.success) {
        toast.success('User suspended successfully');
        // Refresh the list to get updated data
        await fetchUsers();
        return response.data;
      } else {
        toast.error(response?.message || 'Failed to suspend user');
        throw new Error(response?.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(error?.message || 'Failed to suspend user');
      throw error;
    }
  };

  // Delete user permanently
  const deleteUser = async userId => {
    try {
      const response = await apiClient.delete(endpoints.renters.delete(userId));

      if (response?.success) {
        toast.success('User deleted successfully');
        // Remove user from the list
        setUsers(prev => prev.filter(user => user.id !== userId));
        return response.data;
      } else {
        toast.error(response?.message || 'Failed to delete user');
        throw new Error(response?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error?.message || 'Failed to delete user');
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async userId => {
    try {
      const response = await apiClient.get(endpoints.renters.getById(userId));

      if (response?.success) {
        return response.data;
      } else {
        toast.error(response?.message || 'Failed to fetch user details');
        throw new Error(response?.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(error?.message || 'Failed to fetch user details');
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
