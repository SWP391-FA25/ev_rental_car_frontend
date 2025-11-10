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

// Mock data for bookings
const mockBookings = [
  {
    id: '1',
    customer: 'Alice Johnson',
    car: 'Tesla Model 3 (EV-123-ABC)',
    pickupLocation: 'Downtown Station',
    dropoffLocation: 'Airport Station',
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-22T18:00:00Z',
    status: 'Confirmed',
    totalAmount: 245.5,
    paymentMethod: 'Credit Card',
  },
  {
    id: '2',
    customer: 'Bob Wilson',
    car: 'Nissan Leaf (EV-456-DEF)',
    pickupLocation: 'Airport Station',
    dropoffLocation: 'Mall Station',
    startTime: '2024-01-21T14:30:00Z',
    endTime: '2024-01-23T12:00:00Z',
    status: 'Pending',
    totalAmount: 120.75,
    paymentMethod: 'Debit Card',
  },
  {
    id: '3',
    customer: 'Carol Davis',
    car: 'BMW i3 (EV-789-GHI)',
    pickupLocation: 'Mall Station',
    dropoffLocation: 'Downtown Station',
    startTime: '2024-01-19T16:45:00Z',
    endTime: '2024-01-21T10:00:00Z',
    status: 'Cancelled',
    totalAmount: 89.99,
    paymentMethod: 'Digital Wallet',
  },
  {
    id: '4',
    customer: 'David Brown',
    car: 'Tesla Model Y (EV-321-JKL)',
    pickupLocation: 'Downtown Station',
    dropoffLocation: 'Airport Station',
    startTime: '2024-01-18T08:00:00Z',
    endTime: '2024-01-20T17:00:00Z',
    status: 'Completed',
    totalAmount: 320.0,
    paymentMethod: 'Credit Card',
  },
];

export default function BookingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch =
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      booking.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Completed':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Booking Management
          </h1>
          <p className='text-muted-foreground'>
            Manage customer bookings and reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search bookings...'
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
            <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('confirmed')}>
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bookings Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Pickup Location</TableHead>
              <TableHead>Dropoff Location</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell className='font-medium'>#{booking.id}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.car}</TableCell>
                <TableCell>{booking.pickupLocation}</TableCell>
                <TableCell>{booking.dropoffLocation}</TableCell>
                <TableCell>{formatDate(booking.startTime)}</TableCell>
                <TableCell>{formatDate(booking.endTime)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>${booking.totalAmount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreVerticalIcon className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                      <DropdownMenuItem>Process Payment</DropdownMenuItem>
                      <DropdownMenuItem className='text-red-600'>
                        Cancel Booking
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
          <div className='text-2xl font-bold'>{mockBookings.length}</div>
          <div className='text-sm text-muted-foreground'>Total Bookings</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockBookings.filter(b => b.status === 'Confirmed').length}
          </div>
          <div className='text-sm text-muted-foreground'>Confirmed</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockBookings.filter(b => b.status === 'Completed').length}
          </div>
          <div className='text-sm text-muted-foreground'>Completed</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            $
            {mockBookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
          </div>
          <div className='text-sm text-muted-foreground'>Total Revenue</div>
        </div>
      </div>
    </div>
  );
}
