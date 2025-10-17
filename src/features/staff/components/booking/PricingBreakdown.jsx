import { CreditCard, Info } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
import { Separator } from '../../../shared/components/ui/separator';
import { formatCurrency } from '../../../shared/lib/utils';

export const PricingBreakdown = ({ pricing }) => {
  if (!pricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <CreditCard className='h-5 w-5' />
            Pricing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Info className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p>Select a vehicle to see pricing details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    basePrice,
    insuranceAmount,
    taxAmount,
    discountAmount,
    subtotal,
    totalAmount,
    depositAmount,
    totalPayable,
    durationHours,
    pricingType,
    pricingDetails,
  } = pricing;

  // Format duration display
  const formatDuration = () => {
    const days = Math.floor(durationHours / 24);
    const hours = durationHours % 24;

    if (days > 0 && hours > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${
        hours > 1 ? 's' : ''
      }`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <CreditCard className='h-5 w-5' />
          Pricing Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Duration Info */}
        <div className='flex justify-between items-center p-3 bg-muted rounded-md'>
          <span className='text-sm font-medium'>Rental Duration</span>
          <div className='text-right'>
            <p className='font-semibold'>{formatDuration()}</p>
            <Badge variant='outline' className='text-xs mt-1'>
              {pricingType} rate
            </Badge>
          </div>
        </div>

        {/* Pricing Details */}
        {pricingDetails && (
          <div className='text-xs text-muted-foreground p-3 bg-muted/50 rounded-md space-y-1'>
            <p className='font-medium mb-1'>Rate Breakdown:</p>
            {pricingType === 'weekly' && (
              <>
                {pricingDetails.weeklyQuantity > 0 && (
                  <p>
                    • {pricingDetails.weeklyQuantity} week(s) ×{' '}
                    {formatCurrency(pricingDetails.weeklyRate, 'VND')} ={' '}
                    {formatCurrency(pricingDetails.weeklyCost, 'VND')}
                  </p>
                )}
                {pricingDetails.dailyQuantity > 0 && (
                  <p>
                    • {pricingDetails.dailyQuantity} day(s) ×{' '}
                    {formatCurrency(pricingDetails.dailyRate, 'VND')} ={' '}
                    {formatCurrency(pricingDetails.dailyCost, 'VND')}
                  </p>
                )}
              </>
            )}
            {pricingType === 'daily' && (
              <>
                {pricingDetails.dailyQuantity > 0 && (
                  <p>
                    • {pricingDetails.dailyQuantity} day(s) ×{' '}
                    {formatCurrency(pricingDetails.dailyRate, 'VND')} ={' '}
                    {formatCurrency(pricingDetails.dailyCost, 'VND')}
                  </p>
                )}
                {pricingDetails.hourlyQuantity > 0 && (
                  <p>
                    • {pricingDetails.hourlyQuantity} hour(s) ×{' '}
                    {formatCurrency(pricingDetails.hourlyRate, 'VND')} ={' '}
                    {formatCurrency(pricingDetails.hourlyCost, 'VND')}
                  </p>
                )}
              </>
            )}
            {(pricingType === 'hourly' || pricingType === 'monthly') &&
              pricingDetails.rate && (
                <p>
                  • {pricingDetails.quantity} {pricingDetails.unit} ×{' '}
                  {formatCurrency(pricingDetails.rate, 'VND')} ={' '}
                  {formatCurrency(basePrice, 'VND')}
                </p>
              )}
          </div>
        )}

        <Separator />

        {/* Price Items */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Base Price</span>
            <span className='font-medium'>
              {formatCurrency(basePrice, 'VND')}
            </span>
          </div>

          <div className='flex justify-between text-sm'>
            <span>Insurance (10%)</span>
            <span className='font-medium'>
              {formatCurrency(insuranceAmount, 'VND')}
            </span>
          </div>

          <div className='flex justify-between text-sm'>
            <span>Tax (8%)</span>
            <span className='font-medium'>
              {formatCurrency(taxAmount, 'VND')}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className='flex justify-between text-sm text-green-600'>
              <span>Discount</span>
              <span className='font-medium'>
                -{formatCurrency(discountAmount, 'VND')}
              </span>
            </div>
          )}

          <Separator />

          <div className='flex justify-between text-sm'>
            <span className='font-medium'>Subtotal</span>
            <span className='font-semibold'>
              {formatCurrency(subtotal, 'VND')}
            </span>
          </div>

          <div className='flex justify-between'>
            <span className='font-semibold'>Rental Amount</span>
            <span className='text-lg font-bold'>
              {formatCurrency(totalAmount, 'VND')}
            </span>
          </div>
        </div>

        <Separator />

        {/* Deposit */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Security Deposit</span>
            <span className='font-medium'>
              {formatCurrency(depositAmount, 'VND')}
            </span>
          </div>

          {/* Total Payable */}
          <div className='flex justify-between items-center p-3 bg-primary/10 rounded-md'>
            <span className='font-semibold'>Total Payable</span>
            <span className='text-xl font-bold text-primary'>
              {formatCurrency(totalPayable, 'VND')}
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className='text-xs text-muted-foreground bg-muted/50 p-3 rounded-md'>
          <p className='flex items-start gap-2'>
            <Info className='h-3 w-3 mt-0.5 shrink-0' />
            <span>
              The deposit will be refunded after the vehicle is returned in good
              condition.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
