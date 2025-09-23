import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';

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

// Mock data for users
const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    status: 'Active',
    joinDate: '2023-03-15',
    totalBookings: 28,
    membershipType: 'Premium',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0456',
    status: 'Active',
    joinDate: '2023-07-22',
    totalBookings: 15,
    membershipType: 'Standard',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1-555-0789',
    status: 'Suspended',
    joinDate: '2023-01-10',
    totalBookings: 5,
    membershipType: 'Basic',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '+1-555-0321',
    status: 'Active',
    joinDate: '2023-05-08',
    totalBookings: 42,
    membershipType: 'Premium',
  },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      user.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Suspended':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMembershipBadgeVariant = type => {
    switch (type) {
      case 'Premium':
        return 'default';
      case 'Standard':
        return 'secondary';
      case 'Basic':
        return 'outline';
      default:
        return 'outline';
    }
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
            <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
              Pending
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
              <TableHead>Membership</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getMembershipBadgeVariant(user.membershipType)}
                  >
                    {user.membershipType}
                  </Badge>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>{user.totalBookings}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreVerticalIcon className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className='text-red-600'>
                        Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{mockUsers.length}</div>
          <div className='text-sm text-muted-foreground'>Total Users</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockUsers.filter(u => u.status === 'Active').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active Users</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockUsers.filter(u => u.membershipType === 'Premium').length}
          </div>
          <div className='text-sm text-muted-foreground'>Premium Members</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockUsers.reduce((sum, u) => sum + u.totalBookings, 0)}
          </div>
          <div className='text-sm text-muted-foreground'>Total Bookings</div>
        </div>
      </div>
    </div>
  );
}
