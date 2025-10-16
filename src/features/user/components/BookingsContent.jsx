import { useAuth } from '@/app/providers/AuthProvider';
import { Badge } from '@/features/shared/components/ui/badge';
import { Card } from '@/features/shared/components/ui/card';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
} from '@/features/shared/lib/utils';
import gsap from 'gsap';
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

// Helper function to get status badge variant
const getStatusBadgeVariant = status => {
  switch (status) {
    case 'PENDING':
      return 'outline';
    case 'CONFIRMED':
      return 'default';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Helper function to get status label
const getStatusLabel = status => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'IN_PROGRESS':
      return 'Đang thuê';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

export default function BookingsContent() {
  const { user } = useAuth();
  const listRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        endpoints.bookings.getUserBookings(user.id)
      );

      if (response.success) {
        // API returns { data: { bookings: [...], pagination: {...} } }
        const bookingsData = response.data?.bookings;
        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
        } else {
          console.warn('Bookings data is not an array:', bookingsData);
          setBookings([]);
        }
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (!listRef.current || loading || bookings.length === 0) return;

    const rows = listRef.current.querySelectorAll('[data-booking-card]');
    if (rows.length > 0) {
      gsap.from(rows, {
        x: -20,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.out',
      });
    }
  }, [bookings, loading]);

  // Loading state
  if (loading) {
    return (
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='space-y-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className='p-4 md:p-6'>
              <div className='grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-4 md:gap-6 items-center'>
                <Skeleton className='w-full h-40 md:h-32 rounded-lg' />
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-5 w-20' />
                    <Skeleton className='h-5 w-16' />
                  </div>
                  <Skeleton className='h-6 w-48' />
                  <Skeleton className='h-4 w-32' />
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <Skeleton className='h-16 w-full' />
                    <Skeleton className='h-16 w-full' />
                  </div>
                </div>
                <div className='text-right'>
                  <Skeleton className='h-4 w-16 mb-1' />
                  <Skeleton className='h-6 w-24 mb-1' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-foreground mb-2'>
            Chuyến của tôi
          </h1>
          <p className='text-sm text-muted-foreground'>
            Xem và quản lý các chuyến thuê xe của bạn
          </p>
        </div>
        <div className='text-center py-12'>
          <div className='text-red-500 mb-4'>
            <RefreshCw className='h-12 w-12 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>Không thể tải dữ liệu</h3>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <button
            onClick={fetchBookings}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-foreground mb-2'>
            Chuyến của tôi
          </h1>
          <p className='text-sm text-muted-foreground'>
            Xem và quản lý các chuyến thuê xe của bạn
          </p>
        </div>
        <div className='text-center py-12'>
          <div className='text-muted-foreground mb-4'>
            <CalendarDays className='h-12 w-12 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>
            Chưa có chuyến thuê nào
          </h3>
          <p className='text-muted-foreground'>
            Bạn chưa có chuyến thuê xe nào. Hãy bắt đầu đặt xe ngay!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Chuyến của tôi
        </h1>
        <p className='text-sm text-muted-foreground'>
          Xem và quản lý các chuyến thuê xe của bạn
        </p>
      </div>

      {/* Bookings List */}
      <div ref={listRef} className='space-y-6'>
        {Array.isArray(bookings) &&
          bookings.map(booking => (
            <Card
              key={booking.id}
              className='p-2 md:p-4 hover:shadow-md transition-shadow'
              data-booking-card
            >
              <div className='grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-4 md:gap-6 items-center'>
                {/* Image */}
                <div className='w-full h-40 md:h-32 rounded-lg overflow-hidden bg-muted'>
                  <img
                    src={
                      booking.vehicle?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={`${booking.vehicle?.brand} ${booking.vehicle?.model}`}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Details */}
                <div className='space-y-2'>
                  {/* Vehicle info */}
                  <div className='flex gap-3'>
                    <div>
                      <h3 className='font-semibold text-lg text-foreground'>
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {booking.vehicle?.year} • {booking.vehicle?.type}
                      </p>
                    </div>
                    <div>
                      {/* <Badge
                        variant='outline'
                        className='text-xs block font-mono'
                      >
                        Booking #{booking.id.substring(0, 8)}
                      </Badge */}
                      <Badge
                        variant={getStatusBadgeVariant(booking.status)}
                        className='text-xs font-medium'
                      >
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Booking details grid */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    {/* Rental period */}
                    <div className='flex items-start  gap-3'>
                      <CalendarDays className='w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-xs mb-1'>
                          Thời gian thuê
                        </p>
                        <p className='font-medium text-foreground'>
                          {formatDate(booking.startTime)} -{' '}
                          {formatDate(booking.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* Pickup location */}
                    <div className='flex items-start gap-3'>
                      <MapPin className='w-4 h-4 mt-0.5 text-primary flex-shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-xs mb-1'>
                          Điểm nhận xe
                        </p>
                        <p className='font-medium text-foreground'>
                          {booking.station?.name || 'N/A'}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {booking.station?.address || ''}
                        </p>
                      </div>
                    </div>

                    {/* Return location */}
                    <div className='flex items-start gap-3 sm:col-span-2'>
                      <MapPin className='w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-xs mb-1'>
                          Điểm trả xe
                        </p>
                        <p className='font-medium text-foreground'>
                          {booking.station?.name || 'N/A'}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {booking.station?.address || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price section */}
                <div className='text-right space-y-2'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Tổng tiền
                    </p>
                    <p className='text-2xl font-bold text-primary'>
                      {formatCurrency(booking.totalAmount, 'VND')}
                    </p>
                  </div>

                  <div className='pt-2 border-t border-border'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Đặt ngày
                    </p>
                    <p className='text-sm font-medium text-foreground'>
                      {formatDateOnly(booking.createdAt)}
                    </p>
                  </div>

                  {booking.depositAmount > 0 && (
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Cọc</p>
                      <p className='text-sm font-medium text-foreground'>
                        {formatCurrency(booking.depositAmount, 'VND')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
