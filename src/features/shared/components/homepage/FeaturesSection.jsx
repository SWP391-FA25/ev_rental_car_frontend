import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { Fuel, MapPin, Settings, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const { t } = useTranslation();
  const vehicles = [
    {
      id: 1,
      name: 'BMW X5',
      type: 'SUV',
      year: 2006,
      image:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 300,
      period: 'day',
      seats: 4,
      transmission: 'Semi-Automatic',
      fuelType: 'Hybrid',
      location: 'New York',
      available: true,
    },
    {
      id: 2,
      name: 'Toyota Corolla',
      type: 'Sedan',
      year: 2021,
      image:
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 130,
      period: 'day',
      seats: 4,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      location: 'Los Angeles',
      available: true,
    },
    {
      id: 3,
      name: 'BMW X5',
      type: 'SUV',
      year: 2006,
      image:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 300,
      period: 'day',
      seats: 4,
      transmission: 'Semi-Automatic',
      fuelType: 'Hybrid',
      location: 'New York',
      available: true,
    },
    {
      id: 4,
      name: 'Jeep Wrangler',
      type: 'SUV',
      year: 2023,
      image:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 200,
      period: 'day',
      seats: 4,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      location: 'Los Angeles',
      available: true,
    },
    {
      id: 5,
      name: 'Toyota Corolla',
      type: 'Sedan',
      year: 2021,
      image:
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 130,
      period: 'day',
      seats: 4,
      transmission: 'Manual',
      fuelType: 'Diesel',
      location: 'Chicago',
      available: true,
    },
    {
      id: 6,
      name: 'Ford Neo 6',
      type: 'Sedan',
      year: 2022,
      image:
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 209,
      period: 'day',
      seats: 2,
      transmission: 'Semi-Automatic',
      fuelType: 'Diesel',
      location: 'Houston',
      available: true,
    },
  ];
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current,
      {
        opacity: 0,
        y: 100,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-foreground mb-4'>
            {t('features.title')}
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            {t('features.description')}
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
            containScroll: 'trimSnaps',
          }}
          className='w-full'
        >
          <CarouselContent className='-ml-1'>
            {vehicles.map(vehicle => (
              <CarouselItem
                key={vehicle.id}
                className='pl-1 basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <div className='p-1'>
                  <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 group p-0'>
                    {/* Vehicle Image */}
                    <div className='relative h-48 overflow-hidden rounded-t-lg'>
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className='w-full h-full object-cover'
                      />
                      <div className='absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-lg'>
                        <span className='text-lg font-bold'>
                          ${vehicle.price}
                        </span>
                        <span className='text-sm'>/{vehicle.period}</span>
                      </div>
                    </div>

                    <CardContent className='p-4'>
                      {/* Vehicle Name and Type */}
                      <div className='mb-3'>
                        <CardTitle className='text-lg font-bold text-foreground'>
                          {vehicle.name}
                        </CardTitle>
                        <CardDescription className='text-sm text-muted-foreground'>
                          {vehicle.type} • {vehicle.year}
                        </CardDescription>
                      </div>

                      {/* Vehicle Specifications */}
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
                          <span>{vehicle.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Explore All Cars Button */}
        <div className='text-center mt-12'>
          <Button
            variant='outline'
            size='lg'
            className='px-8 py-3 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors'
          >
            {t('features.exploreAllCars')} →
          </Button>
        </div>
      </div>
    </section>
  );
}
