import { useAuth } from '@/app/providers/AuthProvider';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog';
import { Label } from '@/features/shared/components/ui/label';

import { ConfirmDialog } from '@/features/shared/components/ui/confirm-dialog';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import { env } from '@/features/shared/lib/env';
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
} from '@/features/shared/lib/utils';
import gsap from 'gsap';
import { CalendarDays, CreditCard, MapPin, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../shared/lib/toast';

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
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'IN_PROGRESS':
      return 'In progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function BookingsContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cancelBooking } = useBooking();
  const listRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingBookingId, setCancelingBookingId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  // Inspection modal state
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionError, setInspectionError] = useState('');
  const [inspectionItems, setInspectionItems] = useState([]);
  const [selectedBookingForInspection, setSelectedBookingForInspection] = useState(null);

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

  const handleResumePayment = bookingId => {
    navigate(`/payment/deposit?bookingId=${bookingId}`);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelingBookingId(bookingToCancel.id);
      await cancelBooking(bookingToCancel.id, 'User cancelled booking');
      // Refresh bookings list
      await fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      // Error toast already shown by useBooking hook
    } finally {
      setCancelingBookingId(null);
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const openCancelDialog = booking => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const openInspectionDialog = async booking => {
    if (!booking?.id) return;
    setSelectedBookingForInspection(booking);
    setIsInspectionOpen(true);
    // fetch renter-side inspections
    try {
      setInspectionLoading(true);
      setInspectionError('');
      const res = await apiClient.get(
        endpoints.inspections.getByBookingRenter(booking.id)
      );
      const payload = res?.data;
      const list = Array.isArray(payload?.data?.inspections)
        ? payload.data.inspections
        : Array.isArray(payload?.inspections)
          ? payload.inspections
          : Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.items)
              ? payload.items
              : [];
      const sorted = [...list].sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
      const latest = sorted[0] || null;
      setInspectionItems(latest ? [latest] : []);
    } catch (err) {
      setInspectionError(err?.message || 'Failed to load inspection report');
    } finally {
      setInspectionLoading(false);
    }
  };

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
      <div className='max-w-full mx-auto'>
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
      <div className='max-w-full mx-auto'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-foreground mb-2'>
            My Trips
          </h1>
          <p className='text-sm text-muted-foreground'>
            View and manage your car rentals
          </p>
        </div>
        <div className='text-center py-12'>
          <div className='text-red-500 mb-4'>
            <RefreshCw className='h-12 w-12 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>Failed to load data</h3>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <button
            onClick={fetchBookings}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
          >
            Retry
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
            My Trips
          </h1>
          <p className='text-sm text-muted-foreground'>
            View and manage your car rentals
          </p>
        </div>
        <div className='text-center py-12'>
          <div className='text-muted-foreground mb-4'>
            <CalendarDays className='h-12 w-12 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>
            No rentals yet
          </h3>
          <p className='text-muted-foreground'>
            You don’t have any rentals yet. Start booking now!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-full mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          My Trips
        </h1>
        <p className='text-sm text-muted-foreground'>
          View and manage your car rentals
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
                          Rental period
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
                          Pickup location
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
                          Return location
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
                      Total
                    </p>
                    <p className='text-2xl font-bold text-primary'>
                      {formatCurrency(booking.totalAmount, 'VND')}
                    </p>
                  </div>

                  <div className='pt-2 border-t border-border'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Booked on
                    </p>
                    <p className='text-sm font-medium text-foreground'>
                      {formatDateOnly(booking.createdAt)}
                    </p>
                  </div>

                  {booking.depositAmount > 0 && (
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Deposit</p>
                      <p className='text-sm font-medium text-foreground'>
                        {formatCurrency(booking.depositAmount, 'VND')}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='pt-2 border-t border-border space-y-2'>
                    {booking.status === 'PENDING' && (
                      <Button
                        size='sm'
                        onClick={() => handleResumePayment(booking.id)}
                        className='w-full'
                      >
                        <CreditCard className='h-3 w-3 mr-1' />
                        Resume Payment
                      </Button>
                    )}

                    {booking.status === 'PENDING' && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => openCancelDialog(booking)}
                        disabled={cancelingBookingId === booking.id}
                        className='w-full'
                      >
                        {cancelingBookingId === booking.id ? (
                          <>
                            <RefreshCw className='h-3 w-3 mr-1 animate-spin' />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className='h-3 w-3 mr-1' />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}

                    {/* View Inspection button for renter */}
                    <Button
                      size='sm'
                      variant='outline'
                      className='w-full'
                      onClick={() => openInspectionDialog(booking)}
                    >
                      View inspection
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title='Cancel Booking'
        description='Are you sure you want to cancel this booking? This action cannot be undone.'
        confirmText='Yes, Cancel'
        cancelText='Keep Booking'
        onConfirm={handleCancelBooking}
        loading={cancelingBookingId === bookingToCancel?.id}
      />

      {/* Inspection Dialog */}
      <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Inspection Report</DialogTitle>
          </DialogHeader>

          {!selectedBookingForInspection ? (
            <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
              Please select a trip to view inspection.
            </div>
          ) : inspectionLoading ? (
            <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
              Loading inspection report...
            </div>
          ) : inspectionError ? (
            <div className='p-2 border rounded-md bg-red-50 text-red-600 min-h-[40px] flex items-center'>
              {inspectionError}
            </div>
          ) : inspectionItems.length === 0 ? (
            <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
              No inspection report available.
            </div>
          ) : (
            <div className='space-y-3'>
              {inspectionItems.map(item => {
                const type = item?.inspectionType || item?.type || '';
                const statusText = item?.isCompleted ? 'Completed' : 'Processing';
                const stationName =
                  item?.station?.name || item?.stationName || selectedBookingForInspection?.station?.name || '';
                const staffName = item?.staff?.name || item?.staffName || '';
                const time = item?.createdAt || item?.time || item?.updatedAt || '';
                const damageNotes =
                  item?.damageNotes || item?.incidentNotes || item?.notes || '';

                const makeAbsoluteUrl = (url) => {
                  if (!url) return null;
                  const s = String(url).trim();
                  if (!s) return null;
                  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
                  const path = s.startsWith('/') ? s : (s.startsWith('uploads') ? `/${s}` : null);
                  if (!path) return null;
                  const base = env.apiBaseUrl.replace(/\/+$/, '');
                  return `${base}${path}`;
                };

                const allImageCandidates = [];
                const rawImages = item?.images;
                if (Array.isArray(rawImages)) {
                  rawImages.forEach(img => {
                    let candidate = null;
                    if (typeof img === 'string') {
                      candidate = img;
                    } else if (img && typeof img === 'object') {
                      candidate = img.url || img.data?.url || img.path || img.filePath || img.imageUrl || null;
                      if (!candidate) {
                        candidate = img.thumbnailUrl || img.data?.thumbnailUrl || null;
                      }
                    }
                    if (candidate) allImageCandidates.push(candidate);
                  });
                }
                if (item?.imageUrl) {
                  allImageCandidates.push(item.imageUrl);
                } else if (item?.thumbnailUrl) {
                  allImageCandidates.push(item.thumbnailUrl);
                }

                const imageUrls = Array.from(new Set(allImageCandidates.map(c => makeAbsoluteUrl(c)).filter(Boolean)));

                return (
                  <div key={item?.id || `${type}-${time}`} className='p-3 border rounded-md bg-muted/30'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label>Inspection type</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          {type === 'CHECK_OUT' ? 'Check-out' : type === 'CHECK_IN' ? 'Check-in' : (type || 'N/A')}
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label>Status</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          {statusText}
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label>Station</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          {stationName || 'N/A'}
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label>Staff</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          {staffName || 'N/A'}
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label>Time</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          {time ? formatDate(time) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2 mt-3'>
                      <Label>Notes</Label>
                      <div className='p-2 border rounded-md bg-muted/50 min-h-[36px]'>
                        {damageNotes ? damageNotes : (imageUrls.length === 0 ? 'No incidents/damages' : 'N/A')}
                      </div>
                    </div>

                    <div className='space-y-2 mt-3'>
                      <Label>Inspection images</Label>
                      {imageUrls.length > 0 ? (
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                          {imageUrls.map((url, idx) => (
                            <div key={`${item?.id || 'img'}-${idx}`} className='rounded-md overflow-hidden border bg-muted/40'>
                              <img
                                src={url}
                                alt={`inspection-${idx + 1}`}
                                className='w-full h-24 object-cover'
                                loading='lazy'
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                          N/A
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
