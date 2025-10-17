import { useBooking } from '@/features/booking/hooks/useBooking';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { formatCurrency } from '@/features/shared/lib/utils';
import { Calendar, Car, CheckCircle, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');

  const { getBookingById, checkDepositStatus, loading } = useBooking();
  const [booking, setBooking] = useState(null);
  const [depositStatus, setDepositStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (bookingId) {
      checkDepositAndFetchBooking();

      // Poll for status updates every 5 seconds if booking is not confirmed yet
      const pollInterval = setInterval(async () => {
        try {
          const bookingResult = await getBookingById(bookingId);
          const booking = bookingResult.data?.booking || bookingResult.booking;
          if (booking && booking.status === 'CONFIRMED') {
            setBooking(booking);
            clearInterval(pollInterval); // Stop polling when confirmed
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000);

      // Cleanup interval on unmount
      return () => clearInterval(pollInterval);
    }
  }, [bookingId]);

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
      if (paymentId) {
        try {
          const { paymentService } = await import('../services/paymentService');
          const paymentStatus = await paymentService.getPaymentStatus(
            paymentId
          );
          console.log('Payment status:', paymentStatus);
        } catch (paymentError) {
          console.error('Failed to check payment status:', paymentError);
        }
      }
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

  if (isChecking) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Verifying payment status...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>Booking not found</p>
          <Button onClick={() => navigate('/bookings')}>
            View My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const isDepositConfirmed =
    depositStatus?.data?.booking?.depositStatus === 'PAID' ||
    booking.depositStatus === 'PAID';
  const isBookingConfirmed = booking.status === 'CONFIRMED';

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='container mx-auto px-4 py-24'>
        <div className='max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold mb-2'>Payment Successful!</h1>
            <p className='text-muted-foreground'>
              Your deposit has been paid successfully.
            </p>
          </div>

          <Card className='p-6 mb-6'>
            <div className='space-y-4'>
              {isDepositConfirmed && isBookingConfirmed ? (
                <div className='bg-green-50 p-4 rounded-lg'>
                  <p className='text-sm text-green-800 font-medium mb-2'>
                    ✅ Booking Confirmed - Vehicle Reserved
                  </p>
                  <p className='text-sm text-green-700'>
                    Your booking has been automatically confirmed and the
                    vehicle is now reserved for you. No further action needed
                    from staff.
                  </p>
                </div>
              ) : (
                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <p className='text-sm text-yellow-800'>
                    Payment received. Booking confirmation in progress...
                  </p>
                </div>
              )}

              {/* Booking Details */}
              <div className='space-y-3 text-sm text-left'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Booking ID:</span>
                  <span className='font-mono'>{booking.id}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Status:</span>
                  <Badge variant={isBookingConfirmed ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Deposit Status:</span>
                  <Badge variant={isDepositConfirmed ? 'default' : 'secondary'}>
                    {booking.depositStatus || 'PENDING'}
                  </Badge>
                </div>

                {/* Vehicle Info */}
                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Car className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Vehicle Details</span>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Vehicle:</span>
                      <span>
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>License:</span>
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
                    <span className='font-medium'>Rental Period</span>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Start:</span>
                      <span>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>End:</span>
                      <span>
                        {new Date(booking.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Pickup Location</span>
                  </div>
                  <div className='text-xs'>
                    <span>{booking.station?.name}</span>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className='border-t pt-3 mt-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='font-medium'>Payment Summary</span>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Deposit Paid:
                      </span>
                      <span className='text-green-600 font-medium'>
                        {formatCurrency(booking.depositAmount, 'VND')}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Remaining Amount:
                      </span>
                      <span>{formatCurrency(booking.totalAmount, 'VND')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className='p-4 mb-6'>
            <div className='flex items-center gap-3 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <div className='text-left'>
                <p className='font-medium'>What's next?</p>
                <p className='text-muted-foreground'>
                  {isBookingConfirmed
                    ? 'Your vehicle is reserved. Arrive at the pickup location on your scheduled date.'
                    : 'We are processing your booking confirmation. You will receive an email notification shortly.'}
                </p>
              </div>
            </div>
          </Card>

          <div className='space-y-3'>
            <Button
              onClick={() => navigate('/user/profile?tab=trips')}
              className='w-full'
            >
              View My Bookings
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate('/cars')}
              className='w-full'
            >
              Book Another Vehicle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
