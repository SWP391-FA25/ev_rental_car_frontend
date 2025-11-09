import {
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Filter,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '../../shared/lib/toast';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AuthProvider';
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
import { CreateBookingDialog } from './booking/CreateBookingDialog';

const BookingManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [staffStationIds, setStaffStationIds] = useState([]);
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
  const searchTimeoutRef = useRef(null);

  // Fetch staff assignment
  useEffect(() => {
    const fetchStaffAssignment = async () => {
      // Only fetch assignment for STAFF role
      if (user?.role !== 'STAFF' || !user?.id) {
        setStaffStationIds([]);
        setLoadingAssignment(false);
        return;
      }

      try {
        setLoadingAssignment(true);
        const response = await apiClient.get(
          endpoints.assignments.getByStaffId(user.id)
        );

        if (response.success) {
          const payload = response?.data;
          // Support both list and single assignment response shapes
          let raw = [];
          if (Array.isArray(payload?.assignments)) {
            raw = payload.assignments;
          } else if (
            payload?.assignment &&
            typeof payload.assignment === 'object'
          ) {
            raw = [payload.assignment];
          } else if (Array.isArray(payload)) {
            raw = payload;
          } else if (Array.isArray(payload?.items)) {
            raw = payload.items;
          }

          const ids = raw
            .map(a => a?.station?.id ?? a?.stationId)
            .filter(Boolean)
            .map(id => String(id));
          const uniqueIds = Array.from(new Set(ids));
          setStaffStationIds(uniqueIds);

          if (uniqueIds.length === 0) {
            console.warn('⚠️ Staff not assigned to any station');
            toast.error(
              'You are not assigned to any station. Please contact admin.'
            );
          } else {
            console.log(
              '✅ Staff assigned to stations:',
              uniqueIds.length,
              uniqueIds
            );
          }
        }
      } catch (error) {
        console.error('Error fetching staff assignment:', error);
        // If 404, staff has no assignment
        if (error.status === 404 || error.response?.status === 404) {
          setStaffStationIds([]);
          toast.error(
            'You are not assigned to any station. Please contact admin.'
          );
        } else {
          toast.error('Failed to load station assignment');
        }
      } finally {
        setLoadingAssignment(false);
      }
    };

    fetchStaffAssignment();
  }, [user]);

  // Fetch bookings
  const fetchBookings = useCallback(
    async (page = 1, search = '', status = 'ALL') => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });

        // Add stationIds filter for STAFF only
        if (user?.role === 'STAFF' && staffStationIds.length > 0) {
          // Pass stationIds as comma-separated string
          params.append('stationIds', staffStationIds.join(','));
        }

        if (status && status !== 'ALL') params.append('status', status);
        if (search && search.trim()) params.append('search', search.trim());

        const response = await apiClient.get(
          endpoints.bookings.getAll() + `?${params.toString()}`
        );

        if (response.success) {
          setBookings(response.data.bookings);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error(t('booking.messages.loadFailed'));
      } finally {
        setLoading(false);
      }
    },
    [t, user, staffStationIds]
  );

  // Fetch booking details
  const fetchBookingDetails = useCallback(
    async bookingId => {
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
        toast.error(t('booking.messages.detailsFailed'));
      }
    },
    [t]
  );

  // Complete booking
  const completeBooking = async formData => {
    if (!selectedBooking) return;

    try {
      const response = await apiClient.post(
        endpoints.bookings.complete(selectedBooking.id),
        formData
      );

      if (response.success) {
        toast.success(t('booking.messages.completeSuccess'));
        setIsCompleteDialogOpen(false);
        fetchBookings(pagination.currentPage, searchTerm, statusFilter);
        if (isDetailsOpen) {
          fetchBookingDetails(selectedBooking.id);
        }
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error(t('booking.messages.completeFailed'));
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
        toast.success(t('booking.messages.cancelSuccess'));
        fetchBookings(pagination.currentPage, searchTerm, statusFilter);
        if (isDetailsOpen) {
          setIsDetailsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(t('booking.messages.cancelFailed'));
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = value => {
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchBookings(1, value, statusFilter);
    }, 500); // 500ms debounce
  };

  // Handle search on Enter key
  const handleSearchKeyPress = e => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchBookings(1, searchTerm, statusFilter);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = value => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchBookings(1, searchTerm, value);
  };

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      PENDING: {
        variant: 'secondary',
        icon: Clock,
        label: t('booking.status.pending'),
      },
      CONFIRMED: {
        variant: 'default',
        icon: CheckCircle,
        label: t('booking.status.confirmed'),
      },
      IN_PROGRESS: {
        variant: 'default',
        icon: Car,
        label: t('booking.status.inProgress'),
        color: 'text-white bg-amber-700 border-amber-700',
      },
      COMPLETED: {
        variant: 'default',
        icon: CheckCircle,
        label: t('booking.status.completed'),
      },
      CANCELLED: {
        variant: 'destructive',
        icon: XCircle,
        label: t('booking.status.cancelled'),
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.color || ''}`}
      >
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  // Get deposit status badge
  const getDepositBadge = depositStatus => {
    const depositConfig = {
      PENDING: {
        variant: 'outline',
        icon: Clock,
        label: t('booking.depositStatus.pending'),
        color: 'text-orange-700 border-orange-300 bg-orange-50',
      },
      PAID: {
        variant: 'outline',
        icon: CheckCircle,
        label: t('booking.depositStatus.paid'),
        color: 'text-white bg-emerald-600 border-emerald-600',
      },
      FAILED: {
        variant: 'outline',
        icon: XCircle,
        label: t('booking.depositStatus.failed'),
        color: 'text-white bg-rose-600 border-rose-600',
      },
      REFUNDED: {
        variant: 'outline',
        icon: CreditCard,
        label: t('booking.depositStatus.refunded'),
        color: 'text-white bg-blue-600 border-blue-600',
      },
    };

    const config = depositConfig[depositStatus] || depositConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 rounded-full px-3 py-1 ${config.color}`}
      >
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  // Format currency
  const formatPrice = amount => {
    return formatCurrency(amount, 'VND');
  };

  // Initial load - wait for assignment if STAFF
  useEffect(() => {
    // For STAFF: wait until assignment is loaded (or failed to load)
    // For ADMIN: fetch immediately
    if (user?.role === 'ADMIN') {
      fetchBookings(1, searchTerm, statusFilter);
    } else if (user?.role === 'STAFF') {
      // Only fetch bookings after assignment is loaded
      if (!loadingAssignment) {
        // If staff has no assignment, still try to fetch (will show empty state)
        fetchBookings(1, searchTerm, statusFilter);
      }
    } else {
      // Default: fetch bookings
      fetchBookings(1, searchTerm, statusFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffStationIds, loadingAssignment, user?.role]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state while fetching assignment (for STAFF) or bookings
  if (loading || (user?.role === 'STAFF' && loadingAssignment)) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>{t('booking.messages.loading')}</div>
      </div>
    );
  }

  // Show message if STAFF has no assignment
  if (
    user?.role === 'STAFF' &&
    !loadingAssignment &&
    staffStationIds.length === 0 &&
    !loading
  ) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {t('booking.title')}
            </h1>
            <p className='text-muted-foreground'>{t('booking.subtitle')}</p>
          </div>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <p className='text-lg text-muted-foreground mb-2'>
              You are not assigned to any station.
            </p>
            <p className='text-sm text-muted-foreground'>
              Please contact administrator to get assigned to a station.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('booking.title')}
          </h1>
          <p className='text-muted-foreground'>{t('booking.subtitle')}</p>
        </div>
        <div className='flex items-center gap-3'>
          <CreateBookingDialog
            onBookingCreated={() => {
              // Refresh bookings list after creating new booking
              fetchBookings(pagination.currentPage, searchTerm, statusFilter);
            }}
          />
          <Button
            onClick={() =>
              fetchBookings(pagination.currentPage, searchTerm, statusFilter)
            }
            variant='outline'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('booking.filters.searchPlaceholder')}
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              {t('booking.filters.status')}:{' '}
              {statusFilter === 'ALL'
                ? t('booking.filters.statusAll')
                : t(
                  `booking.status.${{
                    PENDING: 'pending',
                    CONFIRMED: 'confirmed',
                    IN_PROGRESS: 'inProgress',
                    COMPLETED: 'completed',
                    CANCELLED: 'cancelled',
                  }[statusFilter]
                  }`
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusFilterChange('ALL')}>
              {t('booking.filters.statusAll')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('PENDING')}
            >
              {t('booking.status.pending')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('CONFIRMED')}
            >
              {t('booking.status.confirmed')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('IN_PROGRESS')}
            >
              {t('booking.status.inProgress')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('COMPLETED')}
            >
              {t('booking.status.completed')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusFilterChange('CANCELLED')}
            >
              {t('booking.status.cancelled')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-foreground'>
            {bookings.length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.bookingAmount')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-orange-600'>
            {
              bookings.filter(b => (b.depositStatus || 'PENDING') === 'PENDING')
                .length
            }
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.pendingDeposits')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-green-600'>
            {
              bookings.filter(b => (b.depositStatus || 'PENDING') === 'PAID')
                .length
            }
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.paidDeposits')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-orange-600'>
            {bookings.filter(b => b.status === 'IN_PROGRESS').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.inProgress')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-green-600'>
            {bookings.filter(b => b.status === 'COMPLETED').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.completed')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-blue-600'>
            {
              bookings.filter(
                b => (b.depositStatus || 'PENDING') === 'REFUNDED'
              ).length
            }
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('booking.stats.refunded')}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('booking.table.customer')}</TableHead>
              <TableHead>{t('booking.table.vehicle')}</TableHead>
              <TableHead>{t('booking.table.station')}</TableHead>
              <TableHead>{t('booking.table.dateTime')}</TableHead>
              <TableHead>{t('booking.table.status')}</TableHead>
              <TableHead>{t('booking.table.depositStatus')}</TableHead>
              <TableHead className='w-[70px]'>
                {t('booking.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8'>
                  <p className='text-muted-foreground'>
                    {t('booking.table.noBookings')}
                  </p>
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
                          : t('booking.table.noEndTime')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className='space-y-1 flex flex-col items-center'>
                      {getDepositBadge(booking.depositStatus || 'PENDING')}
                      <p className='text-xs text-muted-foreground font-bold'>
                        {formatPrice(booking.depositAmount)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => fetchBookingDetails(booking.id)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('booking.pagination.page', {
              current: pagination.currentPage,
              total: pagination.totalPages,
            })}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                fetchBookings(
                  pagination.currentPage - 1,
                  searchTerm,
                  statusFilter
                )
              }
              disabled={pagination.currentPage <= 1}
            >
              {t('booking.pagination.previous')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                fetchBookings(
                  pagination.currentPage + 1,
                  searchTerm,
                  statusFilter
                )
              }
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              {t('booking.pagination.next')}
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
            <DialogTitle>{t('booking.dialogs.complete.title')}</DialogTitle>
            <DialogDescription>
              {t('booking.dialogs.complete.description')}
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
        title={t('booking.dialogs.cancel.title')}
        description={t('booking.dialogs.cancel.description')}
        onConfirm={() => {
          if (bookingToCancel) {
            cancelBooking(bookingToCancel, 'Cancelled by staff');
            setBookingToCancel(null);
          }
        }}
        confirmText={t('booking.dialogs.cancel.confirm')}
        cancelText={t('booking.dialogs.cancel.keep')}
        confirmVariant='destructive'
      />
    </div>
  );
};

export default BookingManagement;
