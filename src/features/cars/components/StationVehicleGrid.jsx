import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/features/shared/components/ui/card';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Car,
  Fuel,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Helper function to transform vehicle data for display
const transformVehicleData = vehicle => {
  return {
    id: vehicle.id,
    name: `${vehicle.brand} ${vehicle.model}`,
    type: vehicle.type,
    year: vehicle.year,
    image:
      vehicle.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    price: 200, // Default price - should come from backend
    period: 'day',
    seats: vehicle.seats,
    transmission: 'Automatic', // Default - should come from backend
    fuelType: vehicle.fuelType,
    available: vehicle.status === 'AVAILABLE',
    batteryLevel: vehicle.batteryLevel,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate,
  };
};

const StationVehicleGrid = ({
  station,
  onBackToStations,
  loading = false,
  error = null,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-6 w-48' />
        </div>
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className='overflow-hidden p-0'>
              <Skeleton className='h-48 w-full' />
              <CardContent className='p-4'>
                <div className='mb-3'>
                  <Skeleton className='h-6 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
                <div className='grid grid-cols-2 gap-3 mb-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                </div>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-8 w-20' />
                  <Skeleton className='h-8 w-16' />
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
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={onBackToStations}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Stations
          </Button>
          <h3 className='text-lg font-semibold'>Vehicles at {station.name}</h3>
        </div>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const vehicles = station.vehicles?.map(transformVehicleData) || [];

  if (vehicles.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={onBackToStations}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Stations
          </Button>
          <h3 className='text-lg font-semibold'>Vehicles at {station.name}</h3>
        </div>
        <div className='text-center py-12'>
          <Car className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground mb-4'>
            No vehicles available at this station
          </p>
          <Button variant='outline' onClick={onBackToStations}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Stations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={onBackToStations}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Stations
        </Button>
        <div>
          <h3 className='text-lg font-semibold'>Vehicles at {station.name}</h3>
          <p className='text-sm text-muted-foreground'>
            {vehicles.length} vehicles available • {station.distance}km away
          </p>
        </div>
      </div>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        {vehicles.map(vehicle => (
          <Card
            key={vehicle.id}
            className='overflow-hidden hover:shadow-lg transition-all duration-300 group p-0'
          >
            <Link
              to={`/cars/${vehicle.id}`}
              className='relative block h-48 overflow-hidden rounded-t-lg'
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className='w-full h-full object-cover'
              />
              <div className='absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-lg'>
                <span className='text-lg font-bold'>${vehicle.price}</span>
                <span className='text-sm'>/{vehicle.period}</span>
              </div>
              {!vehicle.available && (
                <div className='absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium'>
                  Unavailable
                </div>
              )}
            </Link>
            <CardContent className='p-4'>
              <div className='mb-3'>
                <CardTitle className='text-lg font-bold text-foreground'>
                  {vehicle.name}
                </CardTitle>
                <CardDescription className='text-sm text-muted-foreground'>
                  {vehicle.type} • {vehicle.year}
                </CardDescription>
              </div>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Users className='w-4 h-4' />
                  <span>{vehicle.seats} Seats</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Fuel className='w-4 h-4' />
                  <span>{vehicle.fuelType}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Settings className='w-4 h-4' />
                  <span>{vehicle.transmission}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <MapPin className='w-4 h-4' />
                  <span>{station.name}</span>
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <Button
                  size='sm'
                  variant='default'
                  disabled={!vehicle.available}
                  onClick={() => {
                    navigate(`/cars/${vehicle.id}`);
                  }}
                >
                  {vehicle.available ? 'Book now' : 'Unavailable'}
                </Button>
                <Button size='sm' variant='outline' asChild>
                  <Link to={`/cars/${vehicle.id}`}>Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StationVehicleGrid;
