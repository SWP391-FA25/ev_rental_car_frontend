import { Calendar, Car, CreditCard, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  if (!booking) return null;

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: t('booking.status.pending') },
      CONFIRMED: { variant: 'default', label: t('booking.status.confirmed') },
      IN_PROGRESS: {
        variant: 'default',
        label: t('booking.status.inProgress'),
      },
      COMPLETED: { variant: 'default', label: t('booking.status.completed') },
      CANCELLED: {
        variant: 'destructive',
        label: t('booking.status.cancelled'),
      },
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
          <DialogTitle>{t('booking.details.title')}</DialogTitle>
          <DialogDescription>
            {t('booking.details.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Customer Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <User className='h-5 w-5' />
              {t('booking.details.customerInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.name')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.email')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.email}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.phone')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.phone || t('booking.details.na')}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Car className='h-5 w-5' />
              {t('booking.details.vehicleInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.vehicle')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.brand} {booking.vehicle.model}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.licensePlate')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.licensePlate || t('booking.details.na')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.type')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.type || t('booking.details.na')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.status')}</Label>
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
              {t('booking.details.bookingInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.bookingId')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center font-mono text-sm'>
                  {booking.id}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.status')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.startTime')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.startTime)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.endTime')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.endTime
                    ? formatDate(booking.endTime)
                    : t('booking.details.notSet')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.station')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.station.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.created')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Notes */}
          {booking.notes && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('booking.details.notes.title')}</h3>
              <div className='p-3 border rounded-md bg-muted/50'>
                {booking.notes}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              {t('booking.details.pricing.title')}
            </h3>

            <div className='space-y-2'>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.basePrice')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.basePrice)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.insurance')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.insuranceAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.tax')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.taxAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.discount')}:</span>
                <span className='font-medium text-green-600'>
                  -{formatPrice(booking.discountAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md bg-muted/50 font-bold'>
                <span>{t('booking.details.pricing.totalAmount')}:</span>
                <span>{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.deposit')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.depositAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('booking.details.paymentHistory')}</h3>
              <div className='space-y-2'>
                {booking.payments.map(payment => (
                  <div
                    key={payment.id}
                    className='flex justify-between items-center p-3 border rounded-md'
                  >
                    <div>
                      <p className='font-medium'>
                        {t('booking.details.payment')} #
                        {payment.id.substring(0, 8)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {t('booking.details.status')}: {payment.status}
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
            {t('booking.details.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
