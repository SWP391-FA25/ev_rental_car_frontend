import { Badge } from '@/features/shared/components/ui/badge';
import { Card } from '@/features/shared/components/ui/card';
import gsap from 'gsap';
import { CalendarDays, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

const mockBookings = [
  {
    id: 'BK-1001',
    status: 'confirmed',
    car: {
      name: 'BMW M4 COMPETITION',
      year: 2022,
      type: 'SUV',
      image:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    },
    period: '4/10/2025 - 4/15/2025',
    pickup: 'Airport Terminal 1',
    return: 'Downtown Office',
    bookedOn: '4/1/2025',
    total: 475,
  },
  {
    id: 'BK-1002',
    status: 'confirmed',
    car: {
      name: 'BMW M4 COMPETITION',
      year: 2022,
      type: 'SUV',
      image:
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    period: '4/10/2025 - 4/15/2025',
    pickup: 'Airport Terminal 1',
    return: 'Downtown Office',
    bookedOn: '4/1/2025',
    total: 475,
  },
  {
    id: 'BK-1003',
    status: 'confirmed',
    car: {
      name: 'BMW M4 COMPETITION',
      year: 2022,
      type: 'SUV',
      image:
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
    },
    period: '4/10/2025 - 4/15/2025',
    pickup: 'Airport Terminal 1',
    return: 'Downtown Office',
    bookedOn: '4/1/2025',
    total: 475,
  },
];

export default function BookingsContent() {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-booking-card]');
    gsap.from(rows, {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Chuyến của tôi
        </h1>
        <p className='text-sm text-muted-foreground'>
          Xem và quản lý các chuyến thuê xe của bạn
        </p>
      </div>

      {/* Bookings List */}
      <div ref={listRef} className='space-y-6'>
        {mockBookings.map(b => (
          <Card key={b.id} className='p-4 md:p-6' data-booking-card>
            <div className='grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-4 md:gap-6 items-center'>
              {/* Image */}
              <div className='w-full h-40 md:h-32 rounded-lg overflow-hidden'>
                <img
                  src={b.car.image}
                  alt={b.car.name}
                  className='w-full h-full object-cover'
                />
              </div>

              {/* Details */}
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <Badge variant='outline' className='text-xs'>
                    Booking #{b.id}
                  </Badge>
                  <Badge className='bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-xs'>
                    {b.status}
                  </Badge>
                </div>
                <div>
                  <div className='font-semibold text-card-foreground'>
                    {b.car.name}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {b.car.year} • {b.car.type}
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                  <div className='flex items-start gap-2'>
                    <CalendarDays className='w-4 h-4 mt-0.5 text-muted-foreground' />
                    <div>
                      <div className='text-muted-foreground'>
                        Thời gian thuê
                      </div>
                      <div className='font-medium text-card-foreground'>
                        {b.period}
                      </div>
                    </div>
                  </div>
                  <div />
                  <div className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 mt-0.5 text-primary' />
                    <div>
                      <div className='text-muted-foreground'>Điểm nhận xe</div>
                      <div className='font-medium text-card-foreground'>
                        {b.pickup}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 mt-0.5 text-muted-foreground' />
                    <div>
                      <div className='text-muted-foreground'>Điểm trả xe</div>
                      <div className='font-medium text-card-foreground'>
                        {b.return}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className='justify-self-start md:justify-self-end text-right'>
                <div className='text-xs text-muted-foreground mb-1'>
                  Tổng tiền
                </div>
                <div className='text-xl font-bold text-primary'>${b.total}</div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Đặt ngày {b.bookedOn}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
