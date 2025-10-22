import { useAuth } from '@/app/providers/AuthProvider';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { formatCurrency } from '@/features/shared/lib/utils';
import { ArrowLeft, Calendar, CreditCard, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../shared/lib/toast';
import { paymentService } from '../services/paymentService';

export default function TotalAmountPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookingId = searchParams.get('bookingId');
  const amountParam = searchParams.get('amount');

  const { getBookingById, loading: bookingLoading } = useBooking();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const result = await getBookingById(bookingId);
      const booking = result.data?.booking || result.booking;
      if (!booking) {
        throw new Error('Booking data not found in response');
      }
      setBooking(booking);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking details');
    }
  }, [bookingId, getBookingById]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingDetails]);

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      const totalAmount = amountParam
        ? parseFloat(amountParam)
        : booking.totalAmount;

      console.log('Creating rental fee payment with:', {
        bookingId,
        totalAmount,
      });

      const result = await paymentService.createRentalFeePayment(
        bookingId,
        totalAmount,
        `Rental Fee ${bookingId.substring(0, 8)}`
      );

      if (!result?.paymentUrl) {
        console.error('Invalid payment response:', result);
        toast.error('Invalid payment response from server');
        return;
      }

      // Persist payment context for cancel/success pages
      try {
        localStorage.setItem('lastPaymentType', 'RENTAL_FEE');
        localStorage.setItem('lastBookingId', String(bookingId));
        const pid = result?.paymentId || result?.data?.paymentId;
        if (pid) localStorage.setItem('lastPaymentId', String(pid));
      } catch (e) {
        console.warn('localStorage unavailable:', e);
      }

      // Redirect to PayOS
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Failed to create rental fee payment:', error);
      toast.error('Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  if (bookingLoading) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>Booking not found</p>
          <Button
            onClick={() => {
              if (user?.role === 'STAFF') {
                navigate('/staff');
              } else if (user?.role === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/cars');
              }
            }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='container mx-auto px-4 py-24'>
        <div className='max-w-md mx-auto'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => {
                if (user?.role === 'STAFF') {
                  navigate('/staff');
                } else if (user?.role === 'ADMIN') {
                  navigate('/admin');
                } else {
                  navigate(-1);
                }
              }}
              className='mb-4'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>

            <div className='text-center'>
              <h1 className='text-2xl font-bold mb-2'>Pay Total Amount</h1>
              <p className='text-muted-foreground'>
                Complete payment for your rental return
              </p>
            </div>
          </div>

          <Card className='p-6'>
            <div className='space-y-4 mb-6'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Vehicle:</span>
                <span className='font-semibold'>
                  {booking.vehicle.brand} {booking.vehicle.model}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  License Plate:
                </span>
                <span className='font-mono text-sm'>
                  {booking.vehicle.licensePlate}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='flex-1'>
                  <div className='text-sm'>
                    {new Date(booking.startTime).toLocaleDateString()} -{' '}
                    {new Date(booking.endTime).toLocaleDateString()}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(booking.startTime).toLocaleTimeString()} -{' '}
                    {new Date(booking.endTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{booking.station.name}</span>
              </div>

              {/* Price Breakdown */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Base Price:
                  </span>
                  <span className='text-sm'>
                    {formatCurrency(booking.basePrice || 0, 'VND')}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Insurance:
                  </span>
                  <span className='text-sm'>
                    {formatCurrency(booking.insuranceAmount || 0, 'VND')}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Tax:</span>
                  <span className='text-sm'>
                    {formatCurrency(booking.taxAmount || 0, 'VND')}
                  </span>
                </div>

                {booking.discountAmount > 0 && (
                  <div className='flex justify-between items-center text-green-600'>
                    <span className='text-sm'>
                      Discount (
                      {booking.promotionBookings?.[0]?.promotion?.code ||
                        'Applied'}
                      ):
                    </span>
                    <span className='text-sm'>
                      -{formatCurrency(booking.discountAmount, 'VND')}
                    </span>
                  </div>
                )}

                <div className='border-t pt-2 flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Total Amount Due:
                  </span>
                  <span className='font-semibold'>
                    {formatCurrency(booking.totalAmount, 'VND')}
                  </span>
                </div>
              </div>

              <div className='border-t pt-4'>
                <div className='flex justify-between items-center text-lg font-bold'>
                  <span>Deposit Paid:</span>
                  <span className='text-primary'>
                    {formatCurrency(booking.depositAmount, 'VND')}
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Status:</span>
                <Badge variant='secondary'>{booking.status}</Badge>
              </div>
            </div>

            <div className='space-y-3'>
              <Button
                onClick={handleCreatePayment}
                disabled={loading}
                className='w-full'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Pay Total {formatCurrency(booking.totalAmount, 'VND')}
                  </>
                )}
              </Button>
            </div>

            <div className='mt-6 text-xs text-muted-foreground space-y-1'>
              <p>• You will be redirected to PayOS to complete the payment</p>
              <p>
                • Total amount includes base price, insurance, tax and any
                overtime
              </p>
              <p>• Deposit refund is handled upon successful completion</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
