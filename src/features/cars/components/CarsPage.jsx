import Footer from '@/features/shared/components/homepage/Footer';
import Navbar from '@/features/shared/components/homepage/Navbar';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/features/shared/components/ui/card';
import { Input } from '@/features/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import gsap from 'gsap';
import { Fuel, MapPin, Settings, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const mockCars = [
  {
    id: 1,
    name: 'BMW X5',
    type: 'SUV',
    year: 2006,
    image:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
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
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
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
    name: 'Jeep Wrangler',
    type: 'SUV',
    year: 2023,
    image:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    price: 200,
    period: 'day',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    location: 'Los Angeles',
    available: true,
  },
  {
    id: 4,
    name: 'Ford Neo 6',
    type: 'Sedan',
    year: 2022,
    image:
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    price: 209,
    period: 'day',
    seats: 2,
    transmission: 'Semi-Automatic',
    fuelType: 'Diesel',
    location: 'Houston',
    available: true,
  },
  {
    id: 5,
    name: 'Audi A4',
    type: 'Sedan',
    year: 2020,
    image:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 180,
    period: 'day',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    location: 'Chicago',
    available: true,
  },
  {
    id: 6,
    name: 'Tesla Model 3',
    type: 'Sedan',
    year: 2022,
    image:
      'https://images.unsplash.com/photo-1606661001092-1d1b92aecd82?auto=format&fit=crop&w=1200&q=80',
    price: 240,
    period: 'day',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    location: 'San Francisco',
    available: true,
  },
];

export default function CarsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [fuel, setFuel] = useState('all');

  const toolbarRef = useRef(null);

  const filtered = useMemo(() => {
    return mockCars.filter(car => {
      const matchQuery = `${car.name} ${car.type} ${car.location}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchType = type === 'all' || car.type === type;
      const matchTransmission =
        transmission === 'all' || car.transmission === transmission;
      const matchFuel = fuel === 'all' || car.fuelType === fuel;
      return matchQuery && matchType && matchTransmission && matchFuel;
    });
  }, [query, type, transmission, fuel]);

  const resetFilters = () => {
    setQuery('');
    setType('all');
    setTransmission('all');
    setFuel('all');
  };

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
          <h1 className='text-3xl font-bold'>Available Cars</h1>
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
                <SelectItem value='Sedan'>Sedan</SelectItem>
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
                  <SelectItem value='Diesel'>Diesel</SelectItem>
                  <SelectItem value='Petrol'>Petrol</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>No cars match your filters.</p>
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
                    src={vehicle.image}
                    alt={vehicle.name}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-lg'>
                    <span className='text-lg font-bold'>${vehicle.price}</span>
                    <span className='text-sm'>/{vehicle.period}</span>
                  </div>
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
                      <span>{vehicle.location}</span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <Button size='sm' variant='default'>
                      Book now
                    </Button>
                    <Button size='sm' variant='outline'>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
