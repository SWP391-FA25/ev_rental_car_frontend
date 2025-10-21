import Footer from '@/features/shared/components/homepage/Footer';
import Navbar from '@/features/shared/components/homepage/Navbar';
import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/features/shared/components/ui/card';
import { Input } from '@/features/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import gsap from 'gsap';
import {
  AlertCircle,
  Fuel,
  MapPin,
  RefreshCw,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../shared/lib/utils';
import { useLocation } from '../hooks/useLocation';
import { useNearbyStations } from '../hooks/useNearbyStations';
import { useVehicles } from '../hooks/useVehicles';
import LocationInputSection from './LocationInputSection';
import NearbyStationsList from './NearbyStationsList';
import StationVehicleGrid from './StationVehicleGrid';

// Helper function to transform vehicle data for display
const transformVehicleData = vehicle => {
  return {
    id: vehicle.id,
    name: `${vehicle.brand} ${vehicle.model}`,
    type: vehicle.type,
    year: vehicle.year,
    images:
      vehicle.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      hourlyRate: vehicle.pricing?.hourlyRate || 15,
      baseRate: vehicle.pricing?.baseRate || 200,
      depositAmount: vehicle.pricing?.depositAmount || 500,
    },
    seats: vehicle.seats,
    transmission: 'Automatic', // Default - should come from backend
    fuelType: vehicle.fuelType,
    location: vehicle.station?.name || 'Unknown Location',
    available: vehicle.status === 'AVAILABLE',
    batteryLevel: vehicle.batteryLevel,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate,
    stationId: vehicle.stationId,
  };
};

export default function CarsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [fuel, setFuel] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'location'
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const toolbarRef = useRef(null);
  const { vehicles, loading, error, fetchVehicles } = useVehicles();
  const {
    userLocation,
    getCurrentLocation,
    setLocation,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const {
    stations,
    loading: stationsLoading,
    error: stationsError,
    refetch: refetchStations,
  } = useNearbyStations(userLocation);

  // Transform vehicles data for display
  const transformedVehicles = useMemo(() => {
    return vehicles.map(transformVehicleData);
  }, [vehicles]);

  const filtered = useMemo(() => {
    return transformedVehicles.filter(car => {
      const matchQuery = `${car.name} ${car.type} ${car.location}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchType = type === 'all' || car.type === type;
      const matchTransmission =
        transmission === 'all' || car.transmission === transmission;
      const matchFuel = fuel === 'all' || car.fuelType === fuel;
      return matchQuery && matchType && matchTransmission && matchFuel;
    });
  }, [transformedVehicles, query, type, transmission, fuel]);

  const resetFilters = () => {
    setQuery('');
    setType('all');
    setTransmission('all');
    setFuel('all');
    setSelectedStation(null);
    setViewMode('all');
  };

  const handleStationSelect = station => {
    setSelectedStation(station);
  };

  const handleBackToStations = () => {
    setSelectedStation(null);
  };

  const handleLocationSelect = location => {
    setLocation(location);
    setViewMode('location');
  };

  // Handle URL search parameters
  useEffect(() => {
    const stationId = searchParams.get('station');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');
    const vehicleType = searchParams.get('type');
    const fuelType = searchParams.get('fuel');

    if (stationId) {
      // Find and set the selected station
      const station = stations.find(s => s.id === stationId);
      if (station) {
        setSelectedStation(station);
        setViewMode('location');
      }
    }

    if (vehicleType && vehicleType !== 'all') {
      setType(vehicleType);
    }

    if (fuelType && fuelType !== 'all') {
      setFuel(fuelType);
    }

    // Clear URL parameters after processing
    if (stationId || pickupDate || returnDate || vehicleType || fuelType) {
      setSearchParams({});
    }
  }, [searchParams, stations, setSearchParams]);

  useEffect(() => {
    if (toolbarRef.current) {
      gsap.from(toolbarRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <main className='container mx-auto px-4 py-24'>
        <div
          ref={toolbarRef}
          className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
        >
          <div>
            <h1 className='text-3xl font-bold'>Available Cars</h1>
            <div className='flex gap-2 mt-2'>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('all')}
              >
                All Vehicles
              </Button>
              <Button
                variant={viewMode === 'location' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('location')}
              >
                Find Near Me
              </Button>
            </div>
          </div>
          {viewMode === 'all' && (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <Input
                placeholder='Search by name, type, location...'
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder='Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='SUV'>SUV</SelectItem>
                  <SelectItem value='SEDAN'>Sedan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger>
                  <SelectValue placeholder='Transmission' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Transmissions</SelectItem>
                  <SelectItem value='Automatic'>Automatic</SelectItem>
                  <SelectItem value='Semi-Automatic'>Semi-Automatic</SelectItem>
                  <SelectItem value='Manual'>Manual</SelectItem>
                </SelectContent>
              </Select>
              <div className='flex gap-2'>
                <Select value={fuel} onValueChange={setFuel}>
                  <SelectTrigger>
                    <SelectValue placeholder='Fuel' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Fuels</SelectItem>
                    <SelectItem value='Electric'>Electric</SelectItem>
                    <SelectItem value='Hybrid'>Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant='outline' onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Location-based View */}
        {viewMode === 'location' && (
          <div className='space-y-6'>
            <LocationInputSection
              userLocation={userLocation}
              onLocationSelect={handleLocationSelect}
              onGetCurrentLocation={getCurrentLocation}
              loading={locationLoading}
              error={locationError}
            />

            {userLocation && !selectedStation && (
              <NearbyStationsList
                stations={stations}
                loading={stationsLoading}
                error={stationsError}
                onStationSelect={handleStationSelect}
                selectedStation={selectedStation}
                onRefetch={refetchStations}
              />
            )}

            {selectedStation && (
              <StationVehicleGrid
                station={selectedStation}
                onBackToStations={handleBackToStations}
              />
            )}
          </div>
        )}

        {/* All Vehicles View */}
        {viewMode === 'all' && (
          <>
            {/* Error State */}
            {error && (
              <Alert variant='destructive' className='mb-6'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='flex items-center justify-between'>
                  <span>{error}</span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={fetchVehicles}
                    className='ml-4'
                  >
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
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
            ) : filtered.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-muted-foreground mb-4'>
                  {transformedVehicles.length === 0
                    ? 'No vehicles available at the moment.'
                    : 'No cars match your filters.'}
                </p>
                {transformedVehicles.length === 0 && (
                  <Button variant='outline' onClick={fetchVehicles}>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Refresh
                  </Button>
                )}
              </div>
            ) : (
              <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                {filtered.map(vehicle => (
                  <Card
                    key={vehicle.id}
                    className='overflow-hidden hover:shadow-lg transition-all duration-300 group p-0'
                    data-car-card
                  >
                    <Link
                      to={`/cars/${vehicle.id}`}
                      className='relative block h-48 overflow-hidden rounded-t-lg'
                    >
                      <img
                        src={vehicle.images}
                        alt={vehicle.name}
                        className='w-full h-full object-cover'
                      />

                      {!vehicle.available && (
                        <div className='absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium'>
                          Unavailable
                        </div>
                      )}
                    </Link>
                    <CardContent className='px-4 pb-4'>
                      <div className='mb-3'>
                        <CardDescription className='text-lg font-bold text-foreground'>
                          {vehicle.name}
                        </CardDescription>
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
                          <span>{vehicle.licensePlate}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <MapPin className='w-4 h-4' />
                          <span>{vehicle.location}</span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div>
                          <div className='text-lg font-semibold'>
                            {formatCurrency(`${vehicle.pricing.hourlyRate}`)}
                            <span className='text-sm text-muted-foreground'>
                              /hour
                            </span>
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            +{formatCurrency(vehicle.pricing.depositAmount)}{' '}
                            deposit
                          </div>
                        </div>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
