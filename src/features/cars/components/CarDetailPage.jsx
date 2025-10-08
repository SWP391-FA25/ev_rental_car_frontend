import { useBooking } from '@/features/booking/hooks/useBooking';
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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  const navigate = useNavigate();
  const { getVehicleById, error } = useVehicles();
  const { createBooking, loading: bookingLoading } = useBooking();
  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
  });
  const [promotionCode, setPromotionCode] = useState('');
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

  // Calculate estimated price
  const calculateEstimatedPrice = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !car?.pricing)
      return null;

    const start = new Date(
      `${selectedDates.startDate}T${selectedDates.startTime}`
    );
    const end = new Date(`${selectedDates.endDate}T${selectedDates.endTime}`);
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));

    const basePrice = car.pricing.hourlyRate * durationHours;
    const insuranceAmount = basePrice * 0.1; // 10%
    const taxAmount = basePrice * 0.08; // 8%
    const subtotal = basePrice + insuranceAmount + taxAmount;

    return {
      basePrice,
      insuranceAmount,
      taxAmount,
      subtotal,
      depositAmount: car.pricing.depositAmount,
      totalPayable: subtotal + car.pricing.depositAmount,
      durationHours,
    };
  };

  const estimatedPrice = calculateEstimatedPrice();

  const handleBooking = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Please select pickup and return dates');
      return;
    }

    try {
      const startDateTime = new Date(
        `${selectedDates.startDate}T${selectedDates.startTime}`
      );
      const endDateTime = new Date(
        `${selectedDates.endDate}T${selectedDates.endTime}`
      );

      const bookingData = {
        vehicleId: car.id,
        stationId: car.stationId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        promotions: promotionCode ? [promotionCode] : [],
        // pickupLocation và dropoffLocation không cần vì station-based
      };

      const result = await createBooking(bookingData);
      console.log('Booking result:', result); // ✅ Debug log

      if (!result || !result.booking) {
        console.error('Invalid booking response:', result);
        toast.error('Invalid booking response from server');
        return;
      }

      const booking = result.booking;

      // Redirect đến payment cho deposit
      navigate(
        `/payment/deposit?bookingId=${booking.id}&amount=${booking.depositAmount}`
      );
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

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
              {/* Booking Form */}
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>
                      Pickup Date
                    </label>
                    <Input
                      type='date'
                      value={selectedDates.startDate}
                      onChange={e =>
                        setSelectedDates(prev => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>
                      Pickup Time
                    </label>
                    <Input
                      type='time'
                      value={selectedDates.startTime}
                      onChange={e =>
                        setSelectedDates(prev => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>
                      Return Date
                    </label>
                    <Input
                      type='date'
                      value={selectedDates.endDate}
                      onChange={e =>
                        setSelectedDates(prev => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      min={selectedDates.startDate}
                    />
                  </div>
                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>
                      Return Time
                    </label>
                    <Input
                      type='time'
                      value={selectedDates.endTime}
                      onChange={e =>
                        setSelectedDates(prev => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className='text-xs text-muted-foreground mb-1 block'>
                    Promotion Code (Optional)
                  </label>
                  <Input
                    placeholder='Enter promotion code'
                    value={promotionCode}
                    onChange={e => setPromotionCode(e.target.value)}
                  />
                </div>

                {/* Price Breakdown */}
                {estimatedPrice && (
                  <div className='border-t pt-4 space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Base Price ({estimatedPrice.durationHours}h)</span>
                      <span>${estimatedPrice.basePrice.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Insurance (10%)</span>
                      <span>${estimatedPrice.insuranceAmount.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Tax (8%)</span>
                      <span>${estimatedPrice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Deposit</span>
                      <span>${estimatedPrice.depositAmount}</span>
                    </div>
                    <div className='border-t pt-2 flex justify-between font-semibold'>
                      <span>Total Payable</span>
                      <span>${estimatedPrice.totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className='w-full'
                  disabled={!car.available || bookingLoading}
                  onClick={handleBooking}
                >
                  {bookingLoading ? 'Creating Booking...' : 'Book Now'}
                </Button>

                <div className='text-xs text-muted-foreground text-center'>
                  Pay deposit to secure your booking
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
