import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

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
              <div className='bg-green-50 p-4 rounded-lg'>
                <p className='text-sm text-green-800'>
                  Your booking is now pending confirmation from our staff. You
                  will receive an email notification once your booking is
                  confirmed.
                </p>
              </div>

              <div className='space-y-3 text-sm'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Booking ID:</span>
                  <span className='font-mono'>{bookingId}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Status:</span>
                  <Badge variant='secondary'>Pending Confirmation</Badge>
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
                  Our staff will review and confirm your booking within 24
                  hours.
                </p>
              </div>
            </div>
          </Card>

          <div className='space-y-3'>
            <Button onClick={() => navigate('/bookings')} className='w-full'>
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
