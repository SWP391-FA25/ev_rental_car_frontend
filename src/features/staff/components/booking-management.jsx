import {
  Ban,
  Car,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  MoreVertical,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
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
import { formatCurrency, formatDate } from '../../shared/lib/utils';
import { BookingCompleteForm } from './booking/BookingCompleteForm';
import { BookingDetails } from './booking/BookingDetails';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Fetch bookings
  const fetchBookings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });

        if (statusFilter && statusFilter !== 'ALL')
          params.append('status', statusFilter);
        if (searchTerm) params.append('search', searchTerm);

        const response = await apiClient.get(
          endpoints.bookings.getAll() + `?${params.toString()}`
        );

        if (response.success) {
          setBookings(response.data.bookings);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchTerm]
  );

  // Fetch booking details
  const fetchBookingDetails = useCallback(async bookingId => {
    try {
      const response = await apiClient.get(
        endpoints.bookings.getById(bookingId)
      );
      if (response.success) {
        setSelectedBooking(response.data.booking);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    }
  }, []);

  // Smart status progression actions
  const confirmBooking = async bookingId => {
    try {
      const response = await apiClient.patch(
        endpoints.bookings.updateStatus(bookingId),
        { status: 'CONFIRMED', notes: 'Booking confirmed by staff' }
      );

      if (response.success) {
        toast.success('Booking confirmed successfully');
        fetchBookings(pagination.currentPage);
        if (isDetailsOpen) {
          fetchBookingDetails(selectedBooking.id);
        }
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    }
  };

  const startRental = async bookingId => {
    try {
      const response = await apiClient.patch(
        endpoints.bookings.updateStatus(bookingId),
        { status: 'IN_PROGRESS', notes: 'Rental started by staff' }
      );

      if (response.success) {
        toast.success('Rental started successfully');
        fetchBookings(pagination.currentPage);
        if (isDetailsOpen) {
          fetchBookingDetails(selectedBooking.id);
        }
      }
    } catch (error) {
      console.error('Error starting rental:', error);
      toast.error('Failed to start rental');
    }
  };

  // Complete booking
  const completeBooking = async formData => {
    if (!selectedBooking) return;

    try {
      const response = await apiClient.post(
        endpoints.bookings.complete(selectedBooking.id),
        formData
      );

      if (response.success) {
        toast.success('Booking completed successfully');
        setIsCompleteDialogOpen(false);
        fetchBookings(pagination.currentPage);
        if (isDetailsOpen) {
          fetchBookingDetails(selectedBooking.id);
        }
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Failed to complete booking');
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId, reason = '') => {
    try {
      const response = await apiClient.patch(
        endpoints.bookings.cancel(bookingId),
        { reason }
      );

      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(pagination.currentPage);
        if (isDetailsOpen) {
          setIsDetailsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // Handle search
  const handleSearch = useCallback(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // Handle status filter change
  const handleStatusFilterChange = value => {
    setStatusFilter(value);
    fetchBookings(1);
  };

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      PENDING: { variant: 'secondary', icon: Clock, label: 'Pending' },
      CONFIRMED: { variant: 'default', icon: CheckCircle, label: 'Confirmed' },
      IN_PROGRESS: { variant: 'default', icon: Car, label: 'In Progress' },
      COMPLETED: { variant: 'default', icon: CheckCircle, label: 'Completed' },
      CANCELLED: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  // Format currency
  const formatPrice = amount => {
    return formatCurrency(amount, 'VND');
  };

  // Effects
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Booking Management
          </h1>
          <p className='text-muted-foreground'>
            Manage and track all vehicle bookings
          </p>
        </div>
        <Button
          onClick={() => fetchBookings(pagination.currentPage)}
          variant='outline'
        >
          <RefreshCw className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by customer name, vehicle model, or booking ID...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Status: {statusFilter === 'ALL' ? 'All Status' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusFilterChange('ALL')}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('PENDING')}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('CONFIRMED')}
            >
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('IN_PROGRESS')}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('COMPLETED')}
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('CANCELLED')}
            >
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
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8'>
                  <p className='text-muted-foreground'>No bookings found</p>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div>
                        <p className='font-medium'>{booking.user.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {booking.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='font-medium'>
                        {booking.vehicle.brand} {booking.vehicle.model}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {booking.vehicle.licensePlate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='font-medium'>{booking.station.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {booking.station.address}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className='font-medium'>
                        {formatDate(booking.startTime)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {booking.endTime
                          ? formatDate(booking.endTime)
                          : 'No end time'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className='font-medium'>
                        {formatPrice(booking.totalAmount)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Deposit: {formatPrice(booking.depositAmount)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => fetchBookingDetails(booking.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        {booking.status === 'PENDING' && (
                          <DropdownMenuItem
                            onClick={() => confirmBooking(booking.id)}
                            className='text-green-600'
                          >
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Confirm Booking
                          </DropdownMenuItem>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <DropdownMenuItem
                            onClick={() => startRental(booking.id)}
                            className='text-blue-600'
                          >
                            <Car className='mr-2 h-4 w-4' />
                            Start Rental
                          </DropdownMenuItem>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsCompleteDialogOpen(true);
                            }}
                            className='text-green-600'
                          >
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Complete Rental
                          </DropdownMenuItem>
                        )}
                        {!['COMPLETED', 'CANCELLED'].includes(
                          booking.status
                        ) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setBookingToCancel(booking.id);
                              setCancelDialogOpen(true);
                            }}
                            className='text-red-600'
                          >
                            <Ban className='mr-2 h-4 w-4' />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
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
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{pagination.totalItems}</div>
          <div className='text-sm text-muted-foreground'>Total Bookings</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {bookings.filter(b => b.status === 'PENDING').length}
          </div>
          <div className='text-sm text-muted-foreground'>Pending</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {bookings.filter(b => b.status === 'IN_PROGRESS').length}
          </div>
          <div className='text-sm text-muted-foreground'>In Progress</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {bookings.filter(b => b.status === 'COMPLETED').length}
          </div>
          <div className='text-sm text-muted-foreground'>Completed</div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchBookings(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchBookings(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Booking Details Dialog */}
      <BookingDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        booking={selectedBooking}
      />

      {/* Complete Booking Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Complete Booking</DialogTitle>
            <DialogDescription>
              Complete this rental and update vehicle status
            </DialogDescription>
          </DialogHeader>
          <BookingCompleteForm
            booking={selectedBooking}
            onSubmit={completeBooking}
            onCancel={() => setIsCompleteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title='Cancel Booking'
        description='Are you sure you want to cancel this booking? This action cannot be undone.'
        onConfirm={() => {
          if (bookingToCancel) {
            cancelBooking(bookingToCancel);
            setBookingToCancel(null);
          }
        }}
        confirmText='Cancel Booking'
        cancelText='Keep Booking'
        confirmVariant='destructive'
      />
    </div>
  );
};

export default BookingManagement;
