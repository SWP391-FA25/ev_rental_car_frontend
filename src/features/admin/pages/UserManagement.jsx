import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import UserDetails from '../components/UserDetails';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      user.accountStatus?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = userId => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const handleUserUpdated = updatedUser => {
    setUsers(prev =>
      prev.map(user => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleSoftDelete = async userId => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    try {
      const response = await apiClient.put(
        endpoints.renters.softDelete(userId),
        { status: 'SUSPENDED' }
      );

      if (response?.success) {
        toast.success('User suspended successfully');
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(error?.message || 'Failed to suspend user');
    }
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'secondary';
      case 'BANNED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
          <p className='text-muted-foreground'>
            Manage user accounts and permissions
          </p>
        </div>
        <Button>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search users...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              Status: {filterStatus === 'all' ? 'All' : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
              Suspended
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
              Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Users Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center py-8 text-muted-foreground'
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>
                    {user.name || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.accountStatus)}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user.id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSoftDelete(user.id)}
                          className='text-orange-600'
                        >
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{users.length}</div>
          <div className='text-sm text-muted-foreground'>Total Users</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {users.filter(u => u.accountStatus === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active Users</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {users.filter(u => u.accountStatus === 'SUSPENDED').length}
          </div>
          <div className='text-sm text-muted-foreground'>Suspended Users</div>
        </div>
      </div>

      {/* User Details Dialog */}
      <UserDetails
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
