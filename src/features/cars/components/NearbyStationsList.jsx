import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
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
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className='border-2'>
              <CardHeader className='pb-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-t-lg'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <Skeleton className='h-6 w-3/4 mb-2' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-2/3 mt-1' />
                  </div>
                  <div className='flex flex-col items-end gap-2 ml-3'>
                    <Skeleton className='h-6 w-12' />
                    <Skeleton className='h-5 w-16' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <div>
                        <Skeleton className='h-4 w-20 mb-1' />
                        <Skeleton className='h-3 w-16' />
                      </div>
                    </div>
                    <Skeleton className='h-6 w-8' />
                  </div>
                  <Skeleton className='h-10 w-full' />
                </div>
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
        <div className='text-center py-12'>
          <div className='mx-auto w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6'>
            <MapPin className='h-10 w-10 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            No Stations Found
          </h3>
          <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
            We couldn't find any stations within 30km of your location. Try
            refreshing or expanding your search area.
          </p>
          <Button
            variant='outline'
            onClick={onRefetch}
            className='bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <MapPin className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-foreground'>
              Nearby Stations
            </h3>
            <p className='text-sm text-muted-foreground'>
              {stations.length} stations found within 30km
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefetch}
          className='bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20'
        >
          <RefreshCw className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {stations.map(station => {
          // Debug: Log station data
          console.log('Station data:', station);

          const isSelected = selectedStation?.id === station.id;
          const availableVehicles = station.vehicles?.length || 0;

          return (
            <Card
              key={station.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 py-3 ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
              onClick={() => onStationSelect(station)}
            >
              {/* Header with gradient background */}
              <CardHeader className='pb-4 rounded-t-lg'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-bold text-foreground truncate mb-1'>
                      Station: {station.name}
                    </h3>
                    <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                      Address: {station.address}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-2 ml-3'>
                    <Badge
                      variant='secondary'
                      className='bg-primary/20 text-primary font-semibold px-2 py-1'
                    >
                      {station.distance}km
                    </Badge>
                    {station.status && (
                      <Badge
                        variant={
                          station.status === 'ACTIVE'
                            ? 'default'
                            : 'destructive'
                        }
                        className='text-xs px-2 py-1'
                      >
                        {station.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-4'>
                <div className='space-y-4'>
                  {/* Vehicle Availability */}
                  <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-primary/10 rounded-full'>
                        <Car className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {availableVehicles} vehicles
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Available now
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`text-lg font-bold ${
                          availableVehicles > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {availableVehicles}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 shadow-lg'
                        : 'bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg'
                    }`}
                    size='lg'
                  >
                    <div className='flex items-center gap-2'>
                      {isSelected ? (
                        <>
                          <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
                          <span>Selected Station</span>
                        </>
                      ) : (
                        <>
                          <MapPin className='h-4 w-4' />
                          <span>Select Station</span>
                        </>
                      )}
                    </div>
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
