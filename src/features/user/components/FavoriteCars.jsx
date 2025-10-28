import { Fuel, Heart, MapPin, Star, Users } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';

export default function FavoriteCars() {
  // Mock data - replace with real data from API
  const favoriteCars = [
    {
      id: 1,
      name: 'Toyota Camry 2023',
      image: '/api/placeholder/300/200',
      price: 500000,
      rating: 4.8,
      location: 'Station A - District 1',
      fuel: 'Petrol',
      seats: 5,
      transmission: 'Automatic',
      features: ['Air conditioning', 'Bluetooth', 'Rear camera'],
    },
    {
      id: 2,
      name: 'Honda Civic 2022',
      image: '/api/placeholder/300/200',
      price: 450000,
      rating: 4.6,
      location: 'Station B - District 3',
      fuel: 'Petrol',
      seats: 5,
      transmission: 'Automatic',
      features: ['Air conditioning', 'Bluetooth', 'GPS'],
    },
  ];

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Favorite Cars
        </h1>
        <p className='text-muted-foreground'>List of cars you liked</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {favoriteCars.length === 0 ? (
          <div className='col-span-full'>
            <Card>
              <CardContent className='text-center py-12'>
                <Heart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium text-card-foreground mb-2'>
                  No favorite cars yet
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Explore and add cars to your favorites!
                </p>
                <Button>Explore cars</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          favoriteCars.map(car => (
            <Card
              key={car.id}
              className='group hover:shadow-lg transition-all duration-300'
            >
              <CardHeader className='p-0'>
                <div className='relative'>
                  <img
                    src={car.image}
                    alt={car.name}
                    className='w-full h-48 object-cover rounded-t-lg'
                  />
                  <Button
                    size='sm'
                    className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white'
                  >
                    <Heart className='h-4 w-4 fill-current' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <CardTitle className='text-lg'>{car.name}</CardTitle>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 text-yellow-400 fill-current' />
                    <span className='text-sm font-medium'>{car.rating}</span>
                  </div>
                </div>

                <div className='space-y-2 text-sm text-muted-foreground mb-4'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    {car.location}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Fuel className='h-4 w-4' />
                    {car.fuel} • {car.transmission}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    {car.seats} seats
                  </div>
                </div>

                <div className='flex flex-wrap gap-1 mb-4'>
                  {car.features.map((feature, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <span className='text-2xl font-bold text-primary'>
                      {car.price.toLocaleString('vi-VN')}
                    </span>
                    <span className='text-sm text-muted-foreground'> VND/day</span>
                  </div>
                  <Button size='sm'>Rent now</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
