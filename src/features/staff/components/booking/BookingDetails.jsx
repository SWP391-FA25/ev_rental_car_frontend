import { Calendar, Car, CreditCard, User } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Label } from '../../../shared/components/ui/label';
import { formatCurrency, formatDate } from '../../../shared/lib/utils';

export function BookingDetails({ open, onOpenChange, booking }) {
  if (!booking) return null;

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      CONFIRMED: { variant: 'default', label: 'Confirmed' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        {config.label}
      </Badge>
    );
  };

  // Format currency
  const formatPrice = amount => {
    return formatCurrency(amount, 'VND');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Complete information about this booking
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Customer Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <User className='h-5 w-5' />
              Customer Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Email</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.email}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Phone</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Car className='h-5 w-5' />
              Vehicle Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Vehicle</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.brand} {booking.vehicle.model}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>License Plate</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.licensePlate}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Type</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.type}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Status</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  <Badge variant='outline'>{booking.vehicle.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Booking Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Booking ID</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center font-mono text-sm'>
                  {booking.id}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Status</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Start Time</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.startTime)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>End Time</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.endTime ? formatDate(booking.endTime) : 'Not set'}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Station</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.station.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Created</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Notes */}
          {booking.notes && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Notes</h3>
              <div className='p-3 border rounded-md bg-muted/50'>
                {booking.notes}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Pricing Breakdown
            </h3>

            <div className='space-y-2'>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>Base Price:</span>
                <span className='font-medium'>
                  {formatPrice(booking.basePrice)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>Insurance:</span>
                <span className='font-medium'>
                  {formatPrice(booking.insuranceAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>Tax:</span>
                <span className='font-medium'>
                  {formatPrice(booking.taxAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>Discount:</span>
                <span className='font-medium text-green-600'>
                  -{formatPrice(booking.discountAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md bg-muted/50 font-bold'>
                <span>Total Amount:</span>
                <span>{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>Deposit:</span>
                <span className='font-medium'>
                  {formatPrice(booking.depositAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Payment History</h3>
              <div className='space-y-2'>
                {booking.payments.map(payment => (
                  <div
                    key={payment.id}
                    className='flex justify-between items-center p-3 border rounded-md'
                  >
                    <div>
                      <p className='font-medium'>
                        Payment #{payment.id.substring(0, 8)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {payment.status}
                      </p>
                    </div>
                    <p className='font-medium'>{formatPrice(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end pt-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto'
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
