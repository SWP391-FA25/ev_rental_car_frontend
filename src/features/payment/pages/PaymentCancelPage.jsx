import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { XCircle, AlertTriangle } from 'lucide-react';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your payment was cancelled. Your booking is still pending.
            </p>
          </div>
          
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">Booking Status</p>
                </div>
                <p className="text-sm text-yellow-700">
                  Your booking is still active but requires payment to be confirmed.
                  You can complete the payment anytime before your pickup date.
                </p>
              </div>
              
              {bookingId && (
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-mono">{bookingId}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button onClick={() => navigate(`/payment/deposit?bookingId=${bookingId}`)} className="w-full">
              Complete Payment
            </Button>
            <Button variant="outline" onClick={() => navigate('/bookings')} className="w-full">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/cars')} className="w-full">
              Book Another Vehicle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
