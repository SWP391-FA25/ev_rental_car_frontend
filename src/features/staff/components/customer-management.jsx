import {
  AlertTriangle,
  Ban,
  Camera,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Shield,
  UserCheck,
} from 'lucide-react';
import * as React from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/components/ui/avatar';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Checkbox } from '../../shared/components/ui/checkbox';
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

const mockCustomers = [
  {
    id: 'CUST001',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1-555-0123',
    avatar: '/api/placeholder/32/32',
    licenseNumber: 'NY123456789',
    licenseExpiry: '2026-08-15',
    licenseState: 'NY',
    membershipType: 'Premium',
    joinDate: '2023-03-15',
    totalBookings: 28,
    status: 'Active',
    lastBooking: '2024-01-15T10:00:00Z',
    currentBooking: {
      id: 'BOOK001',
      car: 'Tesla Model 3 (EV-123-ABC)',
      startTime: '2024-01-20T09:00:00Z',
      endTime: '2024-01-22T18:00:00Z',
      pickupLocation: 'Downtown Station',
    },
    verificationStatus: {
      identity: 'Verified',
      license: 'Verified',
      payment: 'Verified',
    },
    documents: {
      license: { uploaded: true, verified: true, uploadDate: '2023-03-15' },
      insurance: { uploaded: true, verified: true, uploadDate: '2023-03-15' },
    },
  },
  {
    id: 'CUST002',
    name: 'Bob Wilson',
    email: 'bob.wilson@email.com',
    phone: '+1-555-0456',
    avatar: '/api/placeholder/32/32',
    licenseNumber: 'NY987654321',
    licenseExpiry: '2025-12-20',
    licenseState: 'NY',
    membershipType: 'Standard',
    joinDate: '2023-07-22',
    totalBookings: 15,
    status: 'Pending Check-in',
    lastBooking: '2024-01-10T14:00:00Z',
    currentBooking: {
      id: 'BOOK002',
      car: 'Nissan Leaf (EV-456-DEF)',
      startTime: '2024-01-21T14:00:00Z',
      endTime: '2024-01-23T12:00:00Z',
      pickupLocation: 'Airport Station',
    },
    verificationStatus: {
      identity: 'Verified',
      license: 'Pending',
      payment: 'Verified',
    },
    documents: {
      license: { uploaded: true, verified: false, uploadDate: '2024-01-20' },
      insurance: { uploaded: false, verified: false, uploadDate: null },
    },
  },
  {
    id: 'CUST003',
    name: 'Carol Davis',
    email: 'carol.davis@email.com',
    phone: '+1-555-0789',
    avatar: '/api/placeholder/32/32',
    licenseNumber: 'CA555123789',
    licenseExpiry: '2027-03-10',
    licenseState: 'CA',
    membershipType: 'Basic',
    joinDate: '2023-11-08',
    totalBookings: 5,
    status: 'Active',
    lastBooking: '2024-01-05T16:00:00Z',
    currentBooking: null,
    verificationStatus: {
      identity: 'Verified',
      license: 'Expired',
      payment: 'Pending',
    },
    documents: {
      license: { uploaded: true, verified: false, uploadDate: '2023-11-08' },
      insurance: { uploaded: true, verified: true, uploadDate: '2023-11-08' },
    },
  },
];

const mockIncidents = [
  {
    id: 'INC001',
    customerId: 'CUST001',
    bookingId: 'BOOK001',
    type: 'Vehicle Damage',
    description: 'Minor scratch on rear bumper',
    reportedDate: '2024-01-18T15:30:00Z',
    status: 'Resolved',
    severity: 'Low',
    reportedBy: 'John Smith',
  },
  {
    id: 'INC002',
    customerId: 'CUST002',
    bookingId: 'BOOK002',
    type: 'Late Return',
    description: 'Vehicle returned 2 hours late',
    reportedDate: '2024-01-17T20:00:00Z',
    status: 'In Review',
    severity: 'Medium',
    reportedBy: 'Sarah Johnson',
  },
];

function CustomerStatusBadge({ status }) {
  const config = {
    Active: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
    'Pending Check-in': {
      variant: 'secondary',
      icon: Clock,
      color: 'text-blue-600',
    },
    Suspended: { variant: 'destructive', icon: Ban, color: 'text-red-600' },
    Inactive: {
      variant: 'outline',
      icon: AlertTriangle,
      color: 'text-gray-600',
    },
  };

  const { variant, icon: Icon, color } = config[status] || config['Active'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function VerificationStatusBadge({ status }) {
  const config = {
    Verified: {
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    Pending: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
    Expired: {
      variant: 'destructive',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    Failed: {
      variant: 'destructive',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  };

  const { variant, icon: Icon, color } = config[status] || config['Pending'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function CustomerCheckIn() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [checkInNotes, setCheckInNotes] = React.useState('');

  const pendingCustomers = mockCustomers.filter(
    customer =>
      customer.status === 'Pending Check-in' &&
      (searchTerm === '' ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm))
  );

  const handleCheckIn = customer => {
    console.log('Checking in customer:', customer.id);
    setSelectedCustomer(null);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Customer Check-in</CardTitle>
          <CardDescription>
            Process customer arrivals and verify their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name, email, or phone...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>

            <div className='grid gap-4'>
              {pendingCustomers.map(customer => (
                <Card key={customer.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <Avatar className='h-12 w-12'>
                          <AvatarImage
                            src={customer.avatar}
                            alt={customer.name}
                          />
                          <AvatarFallback>
                            {customer.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className='space-y-1'>
                          <div className='font-semibold'>{customer.name}</div>
                          <div className='text-sm text-muted-foreground flex items-center gap-4'>
                            <span className='flex items-center gap-1'>
                              <Mail className='h-3 w-3' />
                              {customer.email}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Phone className='h-3 w-3' />
                              {customer.phone}
                            </span>
                          </div>
                          {customer.currentBooking && (
                            <div className='text-sm'>
                              <span className='font-medium'>Booking:</span>{' '}
                              {customer.currentBooking.car}
                              <span className='text-muted-foreground ml-2'>
                                at {customer.currentBooking.pickupLocation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <CustomerStatusBadge status={customer.status} />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <UserCheck className='mr-2 h-4 w-4' />
                              Check In
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[500px]'>
                            <DialogHeader>
                              <DialogTitle>Customer Check-in</DialogTitle>
                              <DialogDescription>
                                Complete check-in process for {customer.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                  <Label>Identity Verification</Label>
                                  <VerificationStatusBadge
                                    status={
                                      customer.verificationStatus.identity
                                    }
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <Label>License Verification</Label>
                                  <VerificationStatusBadge
                                    status={customer.verificationStatus.license}
                                  />
                                </div>
                              </div>
                              <div className='space-y-2'>
                                <Label>Payment Method</Label>
                                <VerificationStatusBadge
                                  status={customer.verificationStatus.payment}
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label htmlFor='checkin-notes'>
                                  Check-in Notes
                                </Label>
                                <Textarea
                                  id='checkin-notes'
                                  placeholder='Add any notes about the check-in process...'
                                  value={checkInNotes}
                                  onChange={e =>
                                    setCheckInNotes(e.target.value)
                                  }
                                />
                              </div>
                              <div className='flex items-center space-x-2'>
                                <Checkbox id='terms' />
                                <Label htmlFor='terms'>
                                  Customer confirmed terms and conditions
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => handleCheckIn(customer)}>
                                Complete Check-in
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingCustomers.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>
                  {searchTerm
                    ? 'No customers found matching your search.'
                    : 'No customers pending check-in.'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LicenseVerification() {
  const [selectedCustomer, setSelectedCustomer] = React.useState('');
  const [verificationNotes, setVerificationNotes] = React.useState('');

  const customersNeedingVerification = mockCustomers.filter(
    customer =>
      customer.verificationStatus.license === 'Pending' ||
      customer.verificationStatus.license === 'Expired'
  );

  const handleVerification = approved => {
    console.log('License verification:', {
      selectedCustomer,
      approved,
      verificationNotes,
    });
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>License Verification</CardTitle>
          <CardDescription>
            Verify customer driver's licenses and update verification status
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Select Customer</Label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger>
                <SelectValue placeholder='Choose customer for license verification' />
              </SelectTrigger>
              <SelectContent>
                {customersNeedingVerification.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.licenseNumber} (
                    {customer.verificationStatus.license})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && (
            <div className='space-y-4 p-4 border rounded-lg'>
              {(() => {
                const customer = customersNeedingVerification.find(
                  c => c.id === selectedCustomer
                );
                return (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label>Customer Name</Label>
                        <div className='font-medium'>{customer.name}</div>
                      </div>
                      <div className='space-y-2'>
                        <Label>License Number</Label>
                        <div className='font-medium'>
                          {customer.licenseNumber}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>License State</Label>
                        <div className='font-medium'>
                          {customer.licenseState}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>Expiry Date</Label>
                        <div className='font-medium'>
                          {new Date(
                            customer.licenseExpiry
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>Current Status</Label>
                      <VerificationStatusBadge
                        status={customer.verificationStatus.license}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>License Document</Label>
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                        <Camera className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='mt-2'>
                          <Button variant='outline'>
                            <FileText className='mr-2 h-4 w-4' />
                            View Uploaded License
                          </Button>
                        </div>
                        <p className='text-sm text-muted-foreground mt-2'>
                          Uploaded:{' '}
                          {customer.documents.license.uploadDate
                            ? new Date(
                                customer.documents.license.uploadDate
                              ).toLocaleDateString()
                            : 'Not uploaded'}
                        </p>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='verification-notes'>
                        Verification Notes
                      </Label>
                      <Textarea
                        id='verification-notes'
                        placeholder='Add notes about the license verification...'
                        value={verificationNotes}
                        onChange={e => setVerificationNotes(e.target.value)}
                      />
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleVerification(true)}
                        className='flex-1'
                      >
                        <CheckCircle className='mr-2 h-4 w-4' />
                        Approve License
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={() => handleVerification(false)}
                        className='flex-1'
                      >
                        <AlertTriangle className='mr-2 h-4 w-4' />
                        Reject License
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerSupport() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch =
      searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      customer.status.toLowerCase().replace(' ', '-') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search customers...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Customers</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='pending-check-in'>Pending Check-in</SelectItem>
            <SelectItem value='suspended'>Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Last Booking</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={customer.avatar} alt={customer.name} />
                      <AvatarFallback>
                        {customer.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium'>{customer.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      customer.membershipType === 'Premium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {customer.membershipType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <CustomerStatusBadge status={customer.status} />
                </TableCell>
                <TableCell>{customer.totalBookings}</TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs'>ID:</span>
                      <VerificationStatusBadge
                        status={customer.verificationStatus.identity}
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs'>License:</span>
                      <VerificationStatusBadge
                        status={customer.verificationStatus.license}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastBooking
                    ? new Date(customer.lastBooking).toLocaleDateString()
                    : 'Never'}
                </TableCell>
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
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className='mr-2 h-4 w-4' />
                        Contact Customer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className='mr-2 h-4 w-4' />
                        Verify Documents
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

export function CustomerManagement() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Customer Management
        </h2>
        <p className='text-muted-foreground'>
          Handle customer check-ins, verify licenses, and provide support
        </p>
      </div>

      <Tabs defaultValue='checkin' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='checkin'>Customer Check-in</TabsTrigger>
          <TabsTrigger value='verification'>License Verification</TabsTrigger>
          <TabsTrigger value='support'>Customer Support</TabsTrigger>
        </TabsList>

        <TabsContent value='checkin' className='space-y-4'>
          <CustomerCheckIn />
        </TabsContent>

        <TabsContent value='verification' className='space-y-4'>
          <LicenseVerification />
        </TabsContent>

        <TabsContent value='support' className='space-y-4'>
          <CustomerSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
