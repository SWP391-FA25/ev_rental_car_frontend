import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/features/shared/components/ui/card';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import { AlertCircle, Car, MapPin, RefreshCw } from 'lucide-react';

const NearbyStationsList = ({
  stations,
  loading,
  error,
  onStationSelect,
  selectedStation,
  onRefetch,
}) => {
  if (loading) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Nearby Stations
        </h3>
        <div className='grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className='pb-3'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
                <Skeleton className='h-8 w-full mt-4' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Nearby Stations
        </h3>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>{error}</span>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefetch}
              className='ml-4'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Nearby Stations
        </h3>
        <div className='text-center py-8'>
          <MapPin className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground mb-4'>
            No stations found in your area
          </p>
          <Button variant='outline' onClick={onRefetch}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Nearby Stations ({stations.length} found)
        </h3>
        <Button variant='outline' size='sm' onClick={onRefetch}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {stations.map(station => {
          // Debug: Log station data
          console.log('Station data:', station);

          const isSelected = selectedStation?.id === station.id;
          const availableVehicles = station.vehicles?.length || 0;

          return (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onStationSelect(station)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardDescription className='text-black text-xl font-bold'>
                      {station.name}
                    </CardDescription>
                    <CardDescription className='text-sm'>
                      {station.address}
                    </CardDescription>
                  </div>
                  <Badge variant='secondary' className='ml-2'>
                    {station.distance}km
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className='space-y-3'>
                  {/* Station Info */}

                  {station.status && (
                    <div className='flex items-center justify-between gap-2 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Car className='h-4 w-4' />
                        <span>{availableVehicles} vehicles available</span>
                      </div>
                      <Badge
                        variant={
                          station.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                        className='text-xs'
                      >
                        {station.status}
                      </Badge>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className='w-full mt-3'
                    variant={isSelected ? 'default' : 'outline'}
                    size='sm'
                  >
                    {isSelected ? 'Selected' : 'Select Station'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyStationsList;
