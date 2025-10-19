import Footer from '@/features/shared/components/homepage/Footer';
import Navbar from '@/features/shared/components/homepage/Navbar';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/features/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/features/shared/lib/utils';
import gsap from 'gsap';
import {
  ArrowLeft,
  Calendar,
  Fuel,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults } = location.state || {};
  const toolbarRef = useRef(null);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Format date range
  const formatDateRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Scroll to top and GSAP animation
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    if (toolbarRef.current) {
      gsap.from(toolbarRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, []);

  // Loading state
  if (!searchResults) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <Navbar />
        <main className='container mx-auto px-4 py-24'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>No Search Results</h1>
            <p className='text-muted-foreground mb-6'>
              Please perform a search to see results
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Search
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { station, period, availableVehicles, unavailableVehicles } =
    searchResults;

  // Safe defaults to prevent undefined errors
  const safeAvailableVehicles = availableVehicles || [];
  const safeUnavailableVehicles = unavailableVehicles || [];
  const safeStation = station || { name: 'Unknown Station' };
  const safePeriod = period || { startTime: new Date(), endTime: new Date() };

  console.log('Available vehicles:', safeAvailableVehicles);
  console.log('Unavailable vehicles:', safeUnavailableVehicles);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <main className='container mx-auto px-4 py-24'>
        {/* Header Section */}
        <div
          ref={toolbarRef}
          className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
        >
          <div>
            <h1 className='text-3xl font-bold'>Search Results</h1>
            <div className='flex flex-wrap items-center gap-4 text-muted-foreground mt-2'>
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4' />
                <span>{safeStation.name}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                <span>
                  {formatDateRange(safePeriod.startTime, safePeriod.endTime)}
                </span>
              </div>
            </div>
          </div>
          <Button variant='outline' onClick={handleBack}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Search
          </Button>
        </div>

        {/* Available Vehicles */}
        {safeAvailableVehicles.length > 0 ? (
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold mb-6'>
              Available Vehicles ({safeAvailableVehicles.length})
            </h2>
            <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              {safeAvailableVehicles.map(vehicle => (
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
                      src={vehicle.images?.[0]?.url || '/placeholder-car.jpg'}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className='w-full h-full object-cover'
                    />
                  </Link>
                  <CardContent className='px-4 pb-4'>
                    <div className='mb-3'>
                      <CardDescription className='text-lg font-bold text-foreground'>
                        {vehicle.brand} {vehicle.model}
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
                        <span>Automatic</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <MapPin className='w-4 h-4' />
                        <span>{safeStation.name}</span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-lg font-semibold'>
                          {formatCurrency(
                            vehicle.pricing?.hourlyRate || 0,
                            'VND'
                          )}
                          <span className='text-sm text-muted-foreground'>
                            /hour
                          </span>
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          +
                          {formatCurrency(
                            vehicle.pricing?.depositAmount || 0,
                            'VND'
                          )}{' '}
                          deposit
                        </div>
                      </div>
                      <Button
                        size='sm'
                        variant='default'
                        onClick={() => {
                          navigate(`/cars/${vehicle.id}`);
                        }}
                      >
                        Book now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className='mb-8'>
            <Card className='p-8 text-center'>
              <h2 className='text-xl font-semibold mb-2'>
                No Available Vehicles
              </h2>
              <p className='text-muted-foreground mb-4'>
                Sorry, no vehicles are available during the selected time
                period.
              </p>
              <Button variant='outline' onClick={handleBack}>
                Try Different Dates
              </Button>
            </Card>
          </div>
        )}

        {/* Unavailable Vehicles */}
        {safeUnavailableVehicles.length > 0 && (
          <div>
            <h2 className='text-2xl font-semibold mb-6'>
              Unavailable Vehicles ({safeUnavailableVehicles.length})
            </h2>
            <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              {safeUnavailableVehicles.map(vehicle => (
                <Card
                  key={vehicle.id}
                  className='overflow-hidden opacity-75 p-0'
                >
                  <Link
                    to={`/cars/${vehicle.id}`}
                    className='relative block h-48 overflow-hidden rounded-t-lg'
                  >
                    <img
                      src={vehicle.images?.[0]?.url || '/placeholder-car.jpg'}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className='w-full h-full object-cover'
                    />
                  </Link>
                  {/* <div className='relative block h-48 overflow-hidden rounded-t-lg bg-muted'>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center text-muted-foreground'>
                        <div className='text-sm font-medium'>Unavailable</div>
                        <div className='text-xs'>
                          {new Date(
                            vehicle.nextAvailableTime
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <CardContent className='px-4 pb-4'>
                    <div className='mb-3'>
                      <CardDescription className='text-lg font-bold text-foreground'>
                        {vehicle.brand} {vehicle.model}
                      </CardDescription>
                      <CardDescription className='text-sm text-muted-foreground'>
                        {vehicle.licensePlate}
                      </CardDescription>
                    </div>
                    <div className='text-sm text-orange-600 mb-4'>
                      <div className='font-medium'>Next available:</div>
                      <div>
                        {new Date(vehicle.nextAvailableTime).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled
                      className='w-full'
                    >
                      Unavailable
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
