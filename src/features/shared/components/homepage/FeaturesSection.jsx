import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { AlertCircle, Car, Fuel, MapPin, Settings, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../../../cars/hooks/useVehicles';
import { vehicleService } from '../../../cars/services/vehicleService';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

// Helper function to transfrom API vehicle data to UI format
const transfromVehicleData = (vehicle, images = []) => {
  const firstImage =
    images.length > 0
      ? images[0].url
      : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80';
  return {
    id: vehicle.id,
    name: `${vehicle.brand} ${vehicle.model}`,
    type: vehicle.type,
    year: vehicle.year,
    image: firstImage,
    price: vehicle.pricing?.baseRate || 0,
    period: vehicle.pricing?.hourlyRate ? 'hour' : 'day',
    seats: vehicle.seats,
    transmission: vehicle.transmission || 'Automatic',
    fuelType: vehicle.fuelType,
    location: vehicle.station?.name || 'Unknown Location',
    batteryLevel: vehicle.batteryLevel,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate,
    available: vehicle.status === 'AVAILABLE',
  };
};

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vehicles: apiVehicles, loading, error } = useVehicles();
  const [vehiclesWithImages, setVehiclesWithImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

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
    const loadVehiclesWithImages = async () => {
      if (!apiVehicles || apiVehicles.length === 0) return;
      setIsLoadingImages(true);
      try {
        // Lấy 6 vehicles đầu tiên cho hompage
        const limitedVehicles = apiVehicles.slice(0, 6);
        // Fetch images cho mỗi vehicle
        const vehiclesData = await Promise.all(
          limitedVehicles.map(async vehicle => {
            try {
              const response = await vehicleService.getVehicleImages(
                vehicle.id
              );
              const images = response.success ? response.data.images || [] : [];
              return transfromVehicleData(vehicle, images);
            } catch (error) {
              console.error(
                `Failed to load images for vehicle ${vehicle.id}:`,
                error
              );
              return transfromVehicleData(vehicle, []);
            }
          })
        );
        setVehiclesWithImages(vehiclesData);
        setIsLoadingImages(false);
      } catch (error) {
        console.error('Failed to load vehicles with images:', error);
        const fallbackData = apiVehicles.slice(0, 6).map(transfromVehicleData);
        setVehiclesWithImages(fallbackData);
      } finally {
        setIsLoadingImages(false);
      }
    };
    loadVehiclesWithImages();
  }, [apiVehicles]);

  const handleExploreAllCars = () => {
    navigate('/cars');
  };

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
    <section ref={sectionRef} className='py-20 bg-muted/30 mt-15'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-foreground mb-4 font-orbitron'>
            {t('features.title')}
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            {t('features.description')}
          </p>
        </div>

        {/* Loading state */}
        {(loading || isLoadingImages) && (
          <div className='text-center py-12'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
            <p className='text-muted-foreground'>Loading vehicles...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className='text-center py-12'>
            <AlertCircle className='w-10 h-10 mx-auto text-red-500' />
            <p className='text-red-500'>{error}</p>
          </div>
        )}

        {/* Vehicles Display */}
        {!loading && !isLoadingImages && vehiclesWithImages.length > 0 && (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              containScroll: 'trimSnaps',
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-1'>
              {vehiclesWithImages.map(vehicle => (
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
                            <span>{vehicle.licensePlate}</span>
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
        )}

        {/* No Vehicles State */}
        {!loading && !isLoadingImages && vehiclesWithImages.length === 0 && (
          <div className='text-center py-12'>
            <Car className='w-10 h-10 mx-auto text-muted-foreground' />
            <p className='text-muted-foreground'>
              No vehicles available at the moment.
            </p>
          </div>
        )}

        {/* Explore All Cars Button */}
        <div className='text-center mt-12'>
          <Button
            onClick={handleExploreAllCars}
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
