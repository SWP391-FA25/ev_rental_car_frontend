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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          <CardTitle>{t('staffCustomers.checkin.title')}</CardTitle>
          <CardDescription>
            {t('staffCustomers.checkin.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={t('staffCustomers.checkin.searchPlaceholder')}
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
                              <span className='font-medium'>
                                {t('staffCustomers.common.booking')}:
                              </span>{' '}
                              {customer.currentBooking.car}
                              <span className='text-muted-foreground ml-2'>
                                {t('staffCustomers.common.at')}{' '}
                                {customer.currentBooking.pickupLocation}
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
                              {t('staffCustomers.checkin.checkIn')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[500px]'>
                            <DialogHeader>
                              <DialogTitle>
                                {t('staffCustomers.checkin.title')}
                              </DialogTitle>
                              <DialogDescription>
                                {t('staffCustomers.checkin.dialogSubtitle', {
                                  name: customer.name,
                                })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                  <Label>
                                    {t(
                                      'staffCustomers.checkin.identityVerification'
                                    )}
                                  </Label>
                                  <VerificationStatusBadge
                                    status={
                                      customer.verificationStatus.identity
                                    }
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <Label>
                                    {t(
                                      'staffCustomers.checkin.licenseVerification'
                                    )}
                                  </Label>
                                  <VerificationStatusBadge
                                    status={customer.verificationStatus.license}
                                  />
                                </div>
                              </div>
                              <div className='space-y-2'>
                                <Label>
                                  {t('staffCustomers.common.paymentMethod')}
                                </Label>
                                <VerificationStatusBadge
                                  status={customer.verificationStatus.payment}
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label htmlFor='checkin-notes'>
                                  {t('staffCustomers.checkin.notes')}
                                </Label>
                                <Textarea
                                  id='checkin-notes'
                                  placeholder={t(
                                    'staffCustomers.placeholders.checkinNotes'
                                  )}
                                  value={checkInNotes}
                                  onChange={e =>
                                    setCheckInNotes(e.target.value)
                                  }
                                />
                              </div>
                              <div className='flex items-center space-x-2'>
                                <Checkbox id='terms' />
                                <Label htmlFor='terms'>
                                  {t('staffCustomers.checkin.confirmTerms')}
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => handleCheckIn(customer)}>
                                {t('staffCustomers.checkin.complete')}
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
                    ? t('staffCustomers.checkin.emptySearch')
                    : t('staffCustomers.checkin.empty')}
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
  const { t } = useTranslation();
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
          <CardTitle>{t('staffCustomers.license.title')}</CardTitle>
          <CardDescription>
            {t('staffCustomers.license.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>{t('staffCustomers.license.selectCustomer')}</Label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('staffCustomers.license.selectPlaceholder')}
                />
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
                        <Label>{t('staffCustomers.common.customerName')}</Label>
                        <div className='font-medium'>{customer.name}</div>
                      </div>
                      <div className='space-y-2'>
                        <Label>
                          {t('staffCustomers.license.licenseNumber')}
                        </Label>
                        <div className='font-medium'>
                          {customer.licenseNumber}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>
                          {t('staffCustomers.license.licenseState')}
                        </Label>
                        <div className='font-medium'>
                          {customer.licenseState}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>{t('staffCustomers.common.expiryDate')}</Label>
                        <div className='font-medium'>
                          {new Date(
                            customer.licenseExpiry
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>{t('staffCustomers.common.currentStatus')}</Label>
                      <VerificationStatusBadge
                        status={customer.verificationStatus.license}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>
                        {t('staffCustomers.license.licenseDocument')}
                      </Label>
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                        <Camera className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='mt-2'>
                          <Button variant='outline'>
                            <FileText className='mr-2 h-4 w-4' />
                            {t('staffCustomers.license.viewUploaded')}
                          </Button>
                        </div>
                        <p className='text-sm text-muted-foreground mt-2'>
                          {t('staffCustomers.common.uploaded')}:
                          {customer.documents.license.uploadDate
                            ? new Date(
                                customer.documents.license.uploadDate
                              ).toLocaleDateString()
                            : t('staffCustomers.common.notUploaded')}
                        </p>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='verification-notes'>
                        {t('staffCustomers.license.notes')}
                      </Label>
                      <Textarea
                        id='verification-notes'
                        placeholder={t(
                          'staffCustomers.placeholders.licenseNotes'
                        )}
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
                        {t('staffCustomers.license.approve')}
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={() => handleVerification(false)}
                        className='flex-1'
                      >
                        <AlertTriangle className='mr-2 h-4 w-4' />
                        {t('staffCustomers.license.reject')}
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
  const { t } = useTranslation();
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
              placeholder={t('staffCustomers.support.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue
              placeholder={t('staffCustomers.common.filterByStatus')}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {t('staffCustomers.support.filters.all')}
            </SelectItem>
            <SelectItem value='active'>
              {t('staffCustomers.status.active')}
            </SelectItem>
            <SelectItem value='pending-check-in'>
              {t('staffCustomers.status.pendingCheckin')}
            </SelectItem>
            <SelectItem value='suspended'>
              {t('staffCustomers.status.suspended')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('staffCustomers.common.customer')}</TableHead>
              <TableHead>{t('staffCustomers.support.membership')}</TableHead>
              <TableHead>{t('staffCustomers.common.status')}</TableHead>
              <TableHead>{t('staffCustomers.support.totalBookings')}</TableHead>
              <TableHead>{t('staffCustomers.support.verification')}</TableHead>
              <TableHead>{t('staffCustomers.support.lastBooking')}</TableHead>
              <TableHead className='text-right'>
                {t('staffCustomers.common.actions')}
              </TableHead>
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
                      <span className='text-xs'>
                        {t('staffCustomers.common.license')}:
                      </span>
                      <VerificationStatusBadge
                        status={customer.verificationStatus.license}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastBooking
                    ? new Date(customer.lastBooking).toLocaleDateString()
                    : t('staffCustomers.support.never')}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='z-50'>
                      <DropdownMenuLabel>
                        {t('staffCustomers.common.actions')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className='mr-2 h-4 w-4' />
                        {t('staffCustomers.support.viewProfile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className='mr-2 h-4 w-4' />
                        {t('staffCustomers.support.contactCustomer')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className='mr-2 h-4 w-4' />
                        {t('staffCustomers.support.editDetails')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className='mr-2 h-4 w-4' />
                        {t('staffCustomers.support.verifyDocuments')}
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
  const { t } = useTranslation();
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('staffCustomers.title')}
        </h2>
        <p className='text-muted-foreground'>{t('staffCustomers.subtitle')}</p>
      </div>

      <Tabs defaultValue='checkin' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='checkin'>
            {t('staffCustomers.tabs.checkin')}
          </TabsTrigger>
          <TabsTrigger value='verification'>
            {t('staffCustomers.tabs.verification')}
          </TabsTrigger>
          <TabsTrigger value='support'>
            {t('staffCustomers.tabs.support')}
          </TabsTrigger>
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
