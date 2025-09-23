import {
  Battery,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  RefreshCw,
  User,
  Wrench,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/components/ui/tabs';
import { Textarea } from '../../shared/components/ui/textarea';

const mockBookings = [
  {
    id: 'BOOK001',
    car: {
      model: 'Tesla Model 3',
      licensePlate: 'EV-123-ABC',
      batteryLevel: 85,
    },
    customer: {
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1-555-0123',
    },
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-22T18:00:00Z',
    pickupLocation: 'Downtown Station',
    dropoffLocation: 'Airport Station',
    status: 'Active',
    totalAmount: 245.5,
  },
  {
    id: 'BOOK002',
    car: {
      model: 'Nissan Leaf',
      licensePlate: 'EV-456-DEF',
      batteryLevel: 62,
    },
    customer: {
      name: 'Bob Wilson',
      email: 'bob.wilson@email.com',
      phone: '+1-555-0456',
    },
    startTime: '2024-01-21T14:00:00Z',
    endTime: '2024-01-23T12:00:00Z',
    pickupLocation: 'Mall Station',
    dropoffLocation: 'Downtown Station',
    status: 'Upcoming',
    totalAmount: 180.75,
  },
  {
    id: 'BOOK003',
    car: {
      model: 'BMW i3',
      licensePlate: 'EV-789-GHI',
      batteryLevel: 45,
    },
    customer: {
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      phone: '+1-555-0789',
    },
    startTime: '2024-01-19T10:00:00Z',
    endTime: '2024-01-21T16:00:00Z',
    pickupLocation: 'Airport Station',
    dropoffLocation: 'Mall Station',
    status: 'Completed',
    totalAmount: 320.25,
  },
];

const mockCars = [
  {
    id: 'CAR001',
    model: 'Tesla Model 3',
    licensePlate: 'EV-123-ABC',
    station: 'Downtown Station',
    status: 'Available',
    batteryLevel: 85,
    mileage: 25430,
    lastService: '2024-01-15',
    nextService: '2024-04-15',
    location: 'Parking Spot A-12',
  },
  {
    id: 'CAR002',
    model: 'Nissan Leaf',
    licensePlate: 'EV-456-DEF',
    station: 'Airport Station',
    status: 'Rented',
    batteryLevel: 62,
    mileage: 18750,
    lastService: '2024-01-10',
    nextService: '2024-04-10',
    location: 'On Route',
  },
  {
    id: 'CAR003',
    model: 'BMW i3',
    licensePlate: 'EV-789-GHI',
    station: 'Mall Station',
    status: 'Maintenance',
    batteryLevel: 0,
    mileage: 32100,
    lastService: '2024-01-18',
    nextService: '2024-02-01',
    location: 'Service Bay 2',
  },
  {
    id: 'CAR004',
    model: 'Hyundai Kona Electric',
    licensePlate: 'EV-321-XYZ',
    station: 'Downtown Station',
    status: 'Charging',
    batteryLevel: 45,
    mileage: 15200,
    lastService: '2023-12-20',
    nextService: '2024-03-20',
    location: 'Charging Port 5',
  },
];

function BookingStatusBadge({ status }) {
  const variants = {
    Active: 'default',
    Upcoming: 'secondary',
    Completed: 'outline',
    Cancelled: 'destructive',
  };

  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
}

function CarStatusBadge({ status }) {
  const config = {
    Available: {
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    Rented: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
    Maintenance: {
      variant: 'destructive',
      icon: Wrench,
      color: 'text-orange-600',
    },
    Charging: { variant: 'outline', icon: Battery, color: 'text-yellow-600' },
  };

  const { variant, icon: Icon, color } = config[status] || config['Available'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function ViewBookings() {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBookings = mockBookings.filter(booking => {
    const matchesStatus =
      statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <Input
            placeholder='Search bookings...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='max-w-sm'
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Bookings</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='upcoming'>Upcoming</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell className='font-medium'>{booking.id}</TableCell>
                <TableCell>
                  <div>
                    <div className='font-medium'>{booking.customer.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {booking.customer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className='font-medium'>{booking.car.model}</div>
                    <div className='text-sm text-muted-foreground'>
                      {booking.car.licensePlate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    <div>
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    <div className='text-muted-foreground'>
                      {new Date(booking.startTime).toLocaleTimeString()} -{' '}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell>${booking.totalAmount}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='z-50'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className='mr-2 h-4 w-4' />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className='mr-2 h-4 w-4' />
                        Contact Customer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className='mr-2 h-4 w-4' />
                        Modify Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CarDropoff() {
  const [selectedBooking, setSelectedBooking] = React.useState('');
  const [inspectionNotes, setInspectionNotes] = React.useState('');
  const [fuelLevel, setFuelLevel] = React.useState('');
  const [mileage, setMileage] = React.useState('');
  const [damages, setDamages] = React.useState('');

  const activeBookings = mockBookings.filter(
    booking => booking.status === 'Active'
  );

  const handleDropoff = () => {
    // Handle dropoff logic
    console.log('Processing dropoff for booking:', selectedBooking);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Drop-off</CardTitle>
          <CardDescription>
            Process vehicle returns and complete rental inspections
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='booking-select'>Select Active Booking</Label>
              <Select
                value={selectedBooking}
                onValueChange={setSelectedBooking}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a booking to process' />
                </SelectTrigger>
                <SelectContent>
                  {activeBookings.map(booking => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.id} - {booking.car.model} (
                      {booking.customer.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='mileage'>Final Mileage</Label>
              <Input
                id='mileage'
                type='number'
                placeholder='Enter current mileage'
                value={mileage}
                onChange={e => setMileage(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='fuel-level'>Battery Level (%)</Label>
            <Select value={fuelLevel} onValueChange={setFuelLevel}>
              <SelectTrigger>
                <SelectValue placeholder='Select battery level' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='90-100'>90-100%</SelectItem>
                <SelectItem value='80-89'>80-89%</SelectItem>
                <SelectItem value='70-79'>70-79%</SelectItem>
                <SelectItem value='60-69'>60-69%</SelectItem>
                <SelectItem value='50-59'>50-59%</SelectItem>
                <SelectItem value='below-50'>Below 50%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='damages'>Damage Assessment</Label>
            <Textarea
              id='damages'
              placeholder='Document any damages or issues found during inspection...'
              value={damages}
              onChange={e => setDamages(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='inspection-notes'>Inspection Notes</Label>
            <Textarea
              id='inspection-notes'
              placeholder='Additional notes about vehicle condition...'
              value={inspectionNotes}
              onChange={e => setInspectionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleDropoff}
            className='w-full'
            disabled={!selectedBooking}
          >
            <CheckCircle className='mr-2 h-4 w-4' />
            Complete Drop-off
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UpdateCarStatus() {
  const [selectedCar, setSelectedCar] = React.useState('');
  const [newStatus, setNewStatus] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleStatusUpdate = () => {
    // Handle status update logic
    console.log('Updating car status:', { selectedCar, newStatus, notes });
  };

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {mockCars.map(car => (
          <Card key={car.id}>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium'>
                  {car.model}
                </CardTitle>
                <CarStatusBadge status={car.status} />
              </div>
              <CardDescription>{car.licensePlate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Battery:</span>
                  <span className='flex items-center gap-1'>
                    <Battery className='h-3 w-3' />
                    {car.batteryLevel}%
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Mileage:</span>
                  <span>{car.mileage.toLocaleString()} mi</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Location:</span>
                  <span className='text-right'>{car.location}</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' size='sm' className='w-full mt-3'>
                    <Edit className='mr-2 h-4 w-4' />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>Update Car Status</DialogTitle>
                    <DialogDescription>
                      Update the status of {car.model} ({car.licensePlate})
                    </DialogDescription>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='status'>New Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select new status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Available'>Available</SelectItem>
                          <SelectItem value='Maintenance'>
                            Maintenance
                          </SelectItem>
                          <SelectItem value='Charging'>Charging</SelectItem>
                          <SelectItem value='Out of Service'>
                            Out of Service
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='notes'>Notes</Label>
                      <Textarea
                        id='notes'
                        placeholder='Add notes about the status change...'
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Update Status
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CarManagement() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Car Management</h2>
        <p className='text-muted-foreground'>
          Manage vehicle bookings, process drop-offs, and update car status
        </p>
      </div>

      <Tabs defaultValue='bookings' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='bookings'>View Bookings</TabsTrigger>
          <TabsTrigger value='dropoff'>Car Drop-off</TabsTrigger>
          <TabsTrigger value='status'>Update Status</TabsTrigger>
        </TabsList>

        <TabsContent value='bookings' className='space-y-4'>
          <ViewBookings />
        </TabsContent>

        <TabsContent value='dropoff' className='space-y-4'>
          <CarDropoff />
        </TabsContent>

        <TabsContent value='status' className='space-y-4'>
          <UpdateCarStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
