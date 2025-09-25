import Footer from '@/features/shared/components/homepage/Footer';
import Navbar from '@/features/shared/components/homepage/Navbar';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { Input } from '@/features/shared/components/ui/input';
import gsap from 'gsap';
import { ArrowLeft, Fuel, MapPin, Settings, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

const mockCars = {
  1: {
    id: 1,
    name: 'BMW X5',
    type: 'SUV',
    year: 2006,
    image:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80',
    price: 300,
    period: 'day',
    seats: 4,
    transmission: 'Semi-Automatic',
    fuelType: 'Hybrid',
    location: 'New York',
    description:
      'The BMW X5 is a mid-size luxury SUV produced by BMW. It combines performance, comfort, and advanced technology.',
    features: [
      'Leather Seats',
      'Panoramic Sunroof',
      '360 Camera',
      'Wireless Charging',
    ],
  },
  2: {
    id: 2,
    name: 'Toyota Corolla',
    type: 'Sedan',
    year: 2021,
    image:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1600&q=80',
    price: 130,
    period: 'day',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    location: 'Los Angeles',
    description: 'Reliable sedan with excellent fuel efficiency and comfort.',
    features: ['Cruise Control', 'Bluetooth', 'Rear Camera', 'ABS'],
  },
};

export default function CarDetailPage() {
  const { id } = useParams();
  const car = mockCars[id];
  const heroRef = useRef(null);
  const chipsRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
    if (chipsRef.current) {
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
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        opacity: 0,
        x: 16,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.15,
      });
    }
  }, []);

  if (!car) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <Navbar />
        <main className='container mx-auto px-4 py-24'>
          <p className='text-muted-foreground'>Car not found.</p>
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
                <Button className='w-full'>Book Now</Button>
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
