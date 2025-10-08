import { useBooking } from '@/features/booking/hooks/useBooking';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { formatCurrency } from '@/features/shared/lib/utils';
import { ArrowLeft, Calendar, CreditCard, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { paymentService } from '../services/paymentService';

export default function DepositPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');

  const { getBookingById, loading: bookingLoading } = useBooking();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const result = await getBookingById(bookingId);
      setBooking(result.booking);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking details');
    }
  };

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      const result = await paymentService.createDepositPayment(
        bookingId,
        parseFloat(amount),
        `Deposit ${bookingId.substring(0, 8)}`
      );

      console.log('Payment result:', result); // ✅ Debug log
      console.log('PaymentUrl:', result?.paymentUrl); // ✅ Debug paymentUrl

      if (!result?.paymentUrl) {
        console.error('Invalid payment response:', result);
        toast.error('Invalid payment response from server');
        return;
      }

      // Redirect to PayOS
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Failed to create payment:', error);
      console.error('Error details:', error.response?.data); // ✅ Debug error details
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
          <Button onClick={() => navigate('/cars')}>Back to Cars</Button>
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
              onClick={() => navigate(-1)}
              className='mb-4'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>

            <div className='text-center'>
              <h1 className='text-2xl font-bold mb-2'>Complete Your Booking</h1>
              <p className='text-muted-foreground'>
                Pay deposit to secure your booking
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

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Total Amount:
                </span>
                <span className='font-semibold'>
                  {formatCurrency(booking.totalAmount, 'VND')}
                </span>
              </div>

              <div className='border-t pt-4'>
                <div className='flex justify-between items-center text-lg font-bold'>
                  <span>Deposit Amount:</span>
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
                disabled={loading || booking.status !== 'PENDING'}
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
                    Pay Deposit {formatCurrency(booking.depositAmount, 'VND')}
                  </>
                )}
              </Button>

              <Button
                variant='outline'
                onClick={() => navigate('/cars')}
                className='w-full'
              >
                Cancel Booking
              </Button>
            </div>

            <div className='mt-6 text-xs text-muted-foreground space-y-1'>
              <p>• Deposit will be refunded after successful return</p>
              <p>• Remaining amount will be charged upon pickup</p>
              <p>• Booking will be confirmed after payment</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
