import { Car, Check, Fuel, Users } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { cn, formatCurrency } from '../../../shared/lib/utils';

export const VehicleSelector = ({
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Available Vehicles</h3>
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className='p-4'>
                <Skeleton className='h-32 w-full mb-3' />
                <Skeleton className='h-6 w-3/4 mb-2' />
                <Skeleton className='h-4 w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Available Vehicles</h3>
        <Card>
          <CardContent className='p-8 text-center'>
            <Car className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>
              No vehicles available for the selected time range.
            </p>
            <p className='text-sm text-muted-foreground mt-2'>
              Please try selecting a different station or time period.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>
        Available Vehicles ({vehicles.length})
      </h3>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
        {vehicles.map(vehicle => {
          const isSelected = selectedVehicleId === vehicle.id;

          return (
            <Card
              key={vehicle.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md relative py-0',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <CardContent className='px-0'>
                {/* Selected indicator */}
                {isSelected && (
                  <div className='absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1'>
                    <Check className='h-4 w-4' />
                  </div>
                )}

                {/* Vehicle Image */}
                <div className='relative h-32 w-full rounded-t-md overflow-hidden bg-muted'>
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0].url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Car className='h-12 w-12 text-muted-foreground' />
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className='space-y-2 p-5'>
                  <div>
                    <h4 className='font-semibold text-base'>
                      {vehicle.brand} {vehicle.model}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {vehicle.type} • {vehicle.year}
                    </p>
                  </div>

                  {/* Vehicle Details */}
                  <div className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      <span>{vehicle.seats} seats</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Fuel className='h-4 w-4' />
                      <span>{vehicle.fuelType}</span>
                    </div>
                  </div>

                  {/* Battery Level */}
                  {vehicle.batteryLevel !== undefined && (
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        Battery:
                      </span>
                      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                        <div
                          className={cn(
                            'h-full transition-all',
                            vehicle.batteryLevel > 50
                              ? 'bg-green-500'
                              : vehicle.batteryLevel > 20
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${vehicle.batteryLevel}%` }}
                        />
                      </div>
                      <span className='text-xs font-medium'>
                        {vehicle.batteryLevel}%
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  {/* <div>
                    <Badge variant='outline' className='text-xs'>
                      {vehicle.status}
                    </Badge>
                  </div> */}

                  {/* Pricing */}
                  {vehicle.pricing && (
                    <div className='pt-2 border-t'>
                      <div className='flex justify-between items-baseline'>
                        <div>
                          <p className='text-lg font-semibold'>
                            {formatCurrency(
                              vehicle.pricing.hourlyRate || 0,
                              'VND'
                            )}
                            <span className='text-sm text-muted-foreground font-normal'>
                              /hour
                            </span>
                          </p>
                          {vehicle.pricing.baseRate && (
                            <p className='text-xs text-muted-foreground'>
                              {formatCurrency(vehicle.pricing.baseRate, 'VND')}
                              /day
                            </p>
                          )}
                        </div>
                        {vehicle.pricing.depositAmount && (
                          <p className='text-xs text-muted-foreground'>
                            Deposit:{' '}
                            {formatCurrency(
                              vehicle.pricing.depositAmount,
                              'VND'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
