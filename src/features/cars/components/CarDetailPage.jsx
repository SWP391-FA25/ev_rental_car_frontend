import Footer from '@/features/shared/components/homepage/Footer';
import Navbar from '@/features/shared/components/homepage/Navbar';
import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { Input } from '@/features/shared/components/ui/input';
import { Skeleton } from '@/features/shared/components/ui/skeleton';
import gsap from 'gsap';
import {
  AlertCircle,
  ArrowLeft,
  Fuel,
  MapPin,
  RefreshCw,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

// Helper function to transform vehicle data for display
const transformVehicleData = vehicle => {
  return {
    id: vehicle.id,
    name: `${vehicle.brand} ${vehicle.model}`,
    type: vehicle.type,
    year: vehicle.year,
    image:
      vehicle.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80',
    price: 200, // Default price - should come from backend
    period: 'day',
    seats: vehicle.seats,
    transmission: 'Automatic', // Default - should come from backend
    fuelType: vehicle.fuelType,
    location: vehicle.station?.name || 'Unknown Location',
    available: vehicle.status === 'AVAILABLE',
    batteryLevel: vehicle.batteryLevel,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate,
    description: `The ${vehicle.brand} ${vehicle.model} is a ${vehicle.type} with excellent performance and modern features.`,
    features: [
      'Air Conditioning',
      'Bluetooth Connectivity',
      'Backup Camera',
      'Keyless Entry',
    ],
  };
};

export default function CarDetailPage() {
  const { id } = useParams();
  const { getVehicleById, error } = useVehicles();
  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const heroRef = useRef(null);
  const chipsRef = useRef(null);
  const sidebarRef = useRef(null);

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      if (id) {
        setLoadingCar(true);
        const vehicleData = await getVehicleById(id);
        if (vehicleData) {
          setCar(transformVehicleData(vehicleData));
        }
        setLoadingCar(false);
      }
    };
    fetchVehicle();
  }, [id, getVehicleById]);

  useEffect(() => {
    if (car && heroRef.current) {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
    if (car && chipsRef.current) {
      const items = chipsRef.current.children;
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.1,
      });
    }
    if (car && sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        opacity: 0,
        x: 16,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.15,
      });
    }
  }, [car]);

  // Loading state
  if (loadingCar) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <Navbar />
        <main className='container mx-auto px-4 py-24'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2'>
              <Skeleton className='h-[420px] w-full rounded-xl mb-4' />
              <Skeleton className='h-8 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/2 mb-6' />
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-8'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
              <Skeleton className='h-20 w-full mb-4' />
              <Skeleton className='h-16 w-full' />
            </div>
            <div className='lg:col-span-1'>
              <Card className='p-5'>
                <Skeleton className='h-8 w-24 mb-4' />
                <div className='space-y-3'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <Navbar />
        <main className='container mx-auto px-4 py-24'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between'>
              <span>{error}</span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.location.reload()}
                className='ml-4'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!car) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <Navbar />
        <main className='container mx-auto px-4 py-24'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Vehicle not found</h1>
            <p className='text-muted-foreground mb-6'>
              The vehicle you're looking for doesn't exist or has been removed.
            </p>
            <Link to='/cars'>
              <Button>Back to Cars</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <main className='container mx-auto px-4 py-24'>
        <Link
          to='/cars'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4'
        >
          <ArrowLeft className='w-4 h-4' /> Back to all cars
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <div ref={heroRef} className='rounded-xl overflow-hidden mb-4'>
              <img
                src={car.image}
                alt={car.name}
                className='w-full h-[320px] md:h-[420px] object-cover'
              />
            </div>
            <h1 className='text-2xl md:text-3xl font-bold'>{car.name}</h1>
            <div className='text-sm text-muted-foreground mt-1'>
              {car.year} • {car.type}
            </div>

            <div
              ref={chipsRef}
              className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-6'
            >
              <div className='border rounded-lg px-4 py-3 flex items-center justify-center gap-2'>
                <Users className='w-4 h-4' />
                <span className='text-sm'>{car.seats} Seats</span>
              </div>
              <div className='border rounded-lg px-4 py-3 flex items-center justify-center gap-2'>
                <Fuel className='w-4 h-4' />
                <span className='text-sm'>{car.fuelType}</span>
              </div>
              <div className='border rounded-lg px-4 py-3 flex items-center justify-center gap-2'>
                <Settings className='w-4 h-4' />
                <span className='text-sm'>{car.transmission}</span>
              </div>
              <div className='border rounded-lg px-4 py-3 flex items-center justify-center gap-2'>
                <MapPin className='w-4 h-4' />
                <span className='text-sm'>{car.location}</span>
              </div>
            </div>

            <section className='mt-8'>
              <h2 className='text-lg font-semibold mb-2'>Description</h2>
              <p className='text-muted-foreground'>{car.description}</p>
            </section>

            <section className='mt-8'>
              <h2 className='text-lg font-semibold mb-3'>Features</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                {car.features.map(feature => (
                  <div key={feature} className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className='lg:col-span-1'>
            <Card ref={sidebarRef} className='p-5 sticky top-24'>
              <div className='flex items-baseline justify-between'>
                <div className='text-2xl font-bold'>${car.price}</div>
                <div className='text-xs text-muted-foreground'>
                  per {car.period}
                </div>
              </div>
              <div className='mt-4 space-y-3'>
                <div>
                  <div className='text-xs text-muted-foreground mb-1'>
                    Pickup Date
                  </div>
                  <Input type='date' />
                </div>
                <div>
                  <div className='text-xs text-muted-foreground mb-1'>
                    Return Date
                  </div>
                  <Input type='date' />
                </div>
                <Button className='w-full' disabled={!car.available}>
                  {car.available ? 'Book Now' : 'Unavailable'}
                </Button>
                <div className='text-xs text-muted-foreground text-center'>
                  No credit card required to reserve
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
