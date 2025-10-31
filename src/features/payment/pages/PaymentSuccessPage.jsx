import { useBooking } from '@/features/booking/hooks/useBooking';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { formatCurrency } from '@/features/shared/lib/utils';
import { Calendar, Car, CheckCircle, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../shared/lib/toast';
import { paymentService } from '../services/paymentService';

import { useTranslation } from 'react-i18next';
import { bookingService } from '../../booking/services/bookingService';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');
  const paymentTypeParam = searchParams.get('paymentType');

  const { getBookingById, checkDepositStatus, loading } = useBooking();
  const [booking, setBooking] = useState(null);
  const [depositStatus, setDepositStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [paymentType, setPaymentType] = useState(paymentTypeParam || null);
  const { t } = useTranslation();
  const [completionTriggered, setCompletionTriggered] = useState(false);

  const checkDepositAndFetchBooking = async () => {
    try {
      setIsChecking(true);

      // First check deposit status
      const depositResult = await checkDepositStatus(bookingId);
      setDepositStatus(depositResult);

      // Then fetch updated booking details
      const bookingResult = await getBookingById(bookingId);
      // Handle both possible response structures
      const booking = bookingResult.data?.booking || bookingResult.booking;
      if (booking) {
        setBooking(booking);
      }

      // If paymentId is available, also check payment status
      let resolvedType = paymentTypeParam || null;
      if (!resolvedType) {
        // Try localStorage context first (frontend-only classification)
        try {
          const lastType = localStorage.getItem('lastPaymentType');
          const lastBooking = localStorage.getItem('lastBookingId');
          const lastPid = localStorage.getItem('lastPaymentId');
          if (
            lastType &&
            lastBooking &&
            String(lastBooking) === String(bookingId) &&
            (!paymentId || String(lastPid) === String(paymentId))
          ) {
            resolvedType = lastType;
          }
        } catch {}
      }

      if (paymentId && !resolvedType) {
        try {
          const statusRes = await paymentService.getPaymentStatus(paymentId);
          resolvedType = statusRes?.data?.paymentType || null;
        } catch (paymentError) {
          console.error('Failed to check payment status:', paymentError);
        }
      }

      setPaymentType(resolvedType || paymentTypeParam || null);
      // Cleanup persisted context to avoid stale data
      try {
        localStorage.removeItem('lastPaymentType');
        localStorage.removeItem('lastBookingId');
        localStorage.removeItem('lastPaymentId');
      } catch {}
    } catch (error) {
      console.error('Failed to check deposit status:', error);

      // Only show error if we can't fetch booking details either
      try {
        const bookingResult = await getBookingById(bookingId);
        // Handle both possible response structures
        const booking = bookingResult.data?.booking || bookingResult.booking;
        if (booking) {
          setBooking(booking);
          // If booking is confirmed, don't show error toast
          if (booking.status === 'CONFIRMED') {
            console.log('Booking confirmed, not showing error toast');
            return;
          }
        }
      } catch (bookingError) {
        console.error('Failed to fetch booking:', bookingError);
        toast.error('Failed to load booking details');
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Trigger fetching booking and payment status
  useEffect(() => {
    if (!bookingId) {
      setIsChecking(false);
      return;
    }
    checkDepositAndFetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, paymentId, paymentTypeParam]);

  // Auto-complete booking after successful RENTAL_FEE payment (staff return flow)
  useEffect(() => {
    const shouldAttempt = paymentType === 'RENTAL_FEE' && !!booking && !completionTriggered;
    if (!shouldAttempt) return;

    let payload = null;
    let storedBookingId = null;
    let flag = null;
    try {
      flag = localStorage.getItem('completeAfterPay');
      storedBookingId = localStorage.getItem('completionBookingId');
      const raw = localStorage.getItem('completionPayload');
      payload = raw ? JSON.parse(raw) : null;
    } catch (e) {
      // Ignore localStorage errors
    }

    if (flag !== '1' || !storedBookingId || storedBookingId !== bookingId || !payload) {
      return;
    }

    const doComplete = async () => {
      try {
        setCompletionTriggered(true);
        const res = await bookingService.completeBooking(bookingId, payload);
        const updated = res?.booking || null;
        if (updated) {
          setBooking(updated);
          toast.success(t('staffReturnCar.toast.completeSuccess'));
        } else {
          toast.success(t('staffReturnCar.toast.completeSuccess'));
        }
      } catch (err) {
        console.error('Auto complete after payment failed:', err);
        // Optional: show a mild warning; staff can complete from dashboard
        toast.error(t('staffReturnCar.toast.completeFail'));
      } finally {
        try {
          localStorage.removeItem('completeAfterPay');
          localStorage.removeItem('completionBookingId');
          localStorage.removeItem('completionPayload');
        } catch {}
      }
    };

    doComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType, booking, bookingId, completionTriggered]);

  // Remove confirm complete handler
  // const handleConfirmComplete = async () => { /* removed */ };

  if (isChecking) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>{t('payment.success.loading')}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            {t('payment.success.notFound')}
          </p>
          <Button onClick={() => navigate('/bookings')}>
            {t('payment.success.viewBookings')}
          </Button>
        </div>
      </div>
    );
  }

  const isDepositConfirmed =
    depositStatus?.data?.booking?.depositStatus === 'PAID' ||
    booking.depositStatus === 'PAID';
  const isBookingConfirmed = booking.status === 'CONFIRMED';
  const isRentalFee = paymentType === 'RENTAL_FEE';

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='container mx-auto px-4 py-24'>
        <div className='max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold mb-2'>
              {t('payment.success.title')}
            </h1>
            <p className='text-muted-foreground'>
              {isRentalFee
                ? t('payment.success.rentalFeeSubtitle')
                : t('payment.success.depositSubtitle')}
            </p>
          </div>

          <Card className='p-6 mb-6'>
            <div className='space-y-4'>
              {isRentalFee ? (
                <div className='bg-blue-50 p-4 rounded-lg text-left'>
                  <p className='text-sm text-blue-800 font-medium mb-2'>
                    ✅ {t('payment.success.rentalFeeBannerTitle')}
                  </p>
                  <p className='text-sm text-blue-700'>
                    {t('payment.success.rentalFeeBannerDesc')}
                  </p>
                </div>
              ) : isDepositConfirmed && isBookingConfirmed ? (
                <div className='bg-green-50 p-4 rounded-lg'>
                  <p className='text-sm text-green-800 font-medium mb-2'>
                    ✅ {t('payment.success.depositConfirmedTitle')}
                  </p>
                  <p className='text-sm text-green-700'>
                    {t('payment.success.depositConfirmedDesc')}
                  </p>
                </div>
              ) : (
                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <p className='text-sm text-yellow-800'>
                    {t('payment.success.depositPending')}
                  </p>
                </div>
              )}

              {/* Booking Details */}
              <div className='space-y-3 text-sm text-left'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>
                    {t('payment.success.bookingIdLabel')}
                  </span>
                  <span className='font-mono'>{booking.id}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>
                    {t('payment.success.statusLabel')}
                  </span>
                  <Badge variant={isBookingConfirmed ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>

                {!isRentalFee && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>
                      {t('payment.success.depositStatusLabel')}
                    </span>
                    <Badge
                      variant={isDepositConfirmed ? 'default' : 'secondary'}
                    >
                      {booking.depositStatus || 'PENDING'}
                    </Badge>
                  </div>
                )}

                {/* Vehicle Info */}
                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Car className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {t('payment.success.vehicleDetails')}
                    </span>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {t('payment.success.vehicleLabel')}
                      </span>
                      <span>
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {t('payment.success.licenseLabel')}
                      </span>
                      <span className='font-mono'>
                        {booking.vehicle?.licensePlate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Location */}
                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {t('payment.success.rentalPeriod')}
                    </span>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {t('payment.success.startLabel')}
                      </span>
                      <span>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        {t('payment.success.endLabel')}
                      </span>
                      <span>
                        {new Date(booking.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {t('payment.success.pickupLocation')}
                    </span>
                  </div>
                  <div className='text-xs'>
                    <span>{booking.station?.name}</span>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='font-medium'>
                      {t('payment.success.paymentSummary')}
                    </span>
                  </div>
                  <div className='text-xs space-y-1'>
                    {isRentalFee ? (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          {t('payment.success.totalPaid')}
                        </span>
                        <span className='text-green-600 font-medium'>
                          {formatCurrency(booking.totalAmount, 'VND')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            {t('payment.success.depositPaid')}
                          </span>
                          <span className='text-green-600 font-medium'>
                            {formatCurrency(booking.depositAmount, 'VND')}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            {t('payment.success.remainingAmount')}
                          </span>
                          <span>
                            {formatCurrency(booking.totalAmount, 'VND')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {isRentalFee ? (
            <div className='space-y-3'>
              {/* Removed Confirm Complete Return button as requested */}
              <Button
                variant='outline'
                onClick={() => navigate('/staff')}
                className='w-full'
              >
                {t('payment.success.backToStaff')}
              </Button>
            </div>
          ) : (
            <>
              <Card className='p-4 mb-6'>
                <div className='flex items-center gap-3 text-sm'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div className='text-left'>
                    <p className='font-medium'>
                      {t('payment.success.whatsNextTitle')}
                    </p>
                    <p className='text-muted-foreground'>
                      {isBookingConfirmed
                        ? t('payment.success.whatsNextReserved')
                        : t('payment.success.whatsNextProcessing')}
                    </p>
                  </div>
                </div>
              </Card>

              <div className='space-y-3'>
                <Button
                  onClick={() => navigate('/user/profile?tab=trips')}
                  className='w-full'
                >
                  {t('payment.success.viewBookings')}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => navigate('/cars')}
                  className='w-full'
                >
                  {t('payment.success.bookAnother')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
