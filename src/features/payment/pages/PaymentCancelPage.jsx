import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { AlertTriangle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');
  const paymentTypeParam = searchParams.get('paymentType');
  const [paymentType, setPaymentType] = useState(paymentTypeParam || null);

  // Determine payment type without backend changes: localStorage first, then API fallback
  useEffect(() => {
    let resolved = paymentTypeParam || null;
    if (!resolved) {
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
          resolved = lastType;
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }

    const fetchType = async () => {
      if (!resolved && paymentId) {
        try {
          const statusRes = await paymentService.getPaymentStatus(paymentId);
          resolved = statusRes?.data?.paymentType || null;
        } catch (err) {
          // ignore; will keep whatever we have
        }
      }
      setPaymentType(resolved);

      // Cleanup persisted context to avoid stale data
      try {
        localStorage.removeItem('lastPaymentType');
        localStorage.removeItem('lastBookingId');
        localStorage.removeItem('lastPaymentId');
      } catch {}
    };

    fetchType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, paymentId, paymentTypeParam]);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='container mx-auto px-4 py-24'>
        <div className='max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold mb-2'>Payment Cancelled</h1>
            {paymentType === 'RENTAL_FEE' ? (
              <p className='text-muted-foreground'>
                Your rental fee payment was cancelled. You can retry payment or
                return to staff dashboard.
              </p>
            ) : (
              <p className='text-muted-foreground'>
                Your payment was cancelled. Complete the deposit to confirm and
                reserve your booking.
              </p>
            )}
          </div>

          <Card className='p-6 mb-6'>
            <div className='space-y-4'>
              <div className='bg-yellow-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='h-4 w-4 text-yellow-600' />
                  <p className='text-sm font-medium text-yellow-800'>
                    {paymentType === 'RENTAL_FEE'
                      ? 'Rental Return'
                      : 'Booking Status'}
                  </p>
                </div>
                {paymentType === 'RENTAL_FEE' ? (
                  <p className='text-sm text-yellow-700'>
                    Payment for total rental amount was cancelled. You can retry
                    payment to finalize the return.
                  </p>
                ) : (
                  <p className='text-sm text-yellow-700'>
                    Your booking is in PENDING status. Complete the deposit
                    payment to confirm your booking and reserve the vehicle.
                  </p>
                )}
              </div>

              {bookingId && (
                <div className='text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Booking ID:</span>
                    <span className='font-mono'>{bookingId}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className='space-y-3'>
            {paymentType === 'RENTAL_FEE' ? (
              <>
                <Button
                  onClick={() =>
                    navigate(`/payment/total-amount?bookingId=${bookingId}`)
                  }
                  className='w-full'
                >
                  Retry Rental Fee Payment
                </Button>
                <Button
                  variant='outline'
                  onClick={() => navigate('/staff')}
                  className='w-full'
                >
                  Back to Staff Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() =>
                    navigate(`/payment/deposit?bookingId=${bookingId}`)
                  }
                  className='w-full'
                >
                  Complete Payment
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
