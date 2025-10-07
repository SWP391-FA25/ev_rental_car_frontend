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
  AlertCircle,
  Info as InfoIcon,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'react-toastify';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/components/ui/avatar';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../shared/components/ui/alert';
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
import { endpoints } from '../../shared/lib/endpoints';
import { apiClient } from '../../shared/lib/apiClient';

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
  const [renters, setRenters] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedRenterId, setSelectedRenterId] = React.useState(null);
  const [renterDetails, setRenterDetails] = React.useState(null);

  // Fetch renter details when selectedRenterId changes
  React.useEffect(() => {
    async function fetchRenterDetails() {
      if (!selectedRenterId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(
          endpoints.renters.getById(selectedRenterId)
        );
        const data = res.data?.renter || res.data || null;
        if (!data) {
          throw new Error('Failed to fetch renter details');
        }
        setRenterDetails(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching renter details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRenterDetails();
  }, [selectedRenterId]);

  React.useEffect(() => {
    async function fetchPendingRenters() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(endpoints.renters.getAll());
        const rentersData = response.data?.data?.renters || [];

        // Giả sử API trả về field status trong từng renter
        const pendingRenters = rentersData.filter(
          renter => renter.status === 'pending_checkin'
        );

        const formattedRenters = pendingRenters.map(renter => ({
          id: renter.id,
          name: renter.name,
          email: renter.email,
          phone: renter.phone,
          avatar: renter.avatar || '/api/placeholder/32/32',
          status: 'Pending Check-in',
          currentBooking: renter.currentBooking || null,
          verificationStatus: {
            identity: renter.identityVerified ? 'Verified' : 'Pending',
            license: renter.licenseVerified ? 'Verified' : 'Pending',
            payment: renter.paymentVerified ? 'Verified' : 'Pending',
          },
        }));

        setRenters(formattedRenters);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Error fetching pending renters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingRenters();
  }, []);

  const pendingCustomers = renters.filter(
    customer =>
      searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const handleCheckIn = async customer => {
    try {
      setSubmitting(true);
      await apiClient.put(endpoints.renters.update(customer.id), {
        status: 'checked_in',
        notes: checkInNotes,
        checkedInAt: new Date().toISOString(),
      });

      // Remove the checked-in customer from the list
      setRenters(prevRenters => prevRenters.filter(r => r.id !== customer.id));
      setSelectedCustomer(null);
      setCheckInNotes('');

      // Show success toast or notification
      toast({
        title: t('staffCustomers.checkin.successTitle'),
        description: t('staffCustomers.checkin.successMessage', {
          name: customer.name,
        }),
        variant: 'success',
      });
    } catch (err) {
      console.error('Error checking in customer:', err);
      // Show error toast or notification
      toast({
        title: t('staffCustomers.checkin.errorTitle'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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

            {loading && (
              <div className='flex justify-center py-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
              </div>
            )}

            {error && (
              <div className='bg-destructive/10 text-destructive p-4 rounded-md'>
                <p className='font-medium'>Lỗi khi tải dữ liệu</p>
                <p className='text-sm'>{error}</p>
              </div>
            )}

            {!loading && !error && (
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
                              {(customer.name ?? '')
                                .split(' ')
                                .map(n => n?.[0] ?? '')
                                .join('') || '?'}
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
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setSelectedRenterId(customer.id);
                                }}
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
                                    name: selectedCustomer?.name || '',
                                  })}
                                </DialogDescription>
                              </DialogHeader>
                              <div className='space-y-4 py-4'>
                                {loading && (
                                  <div className='flex justify-center py-4'>
                                    <div className='h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                                  </div>
                                )}

                                {error && (
                                  <div className='bg-destructive/10 text-destructive p-3 rounded-md mb-4'>
                                    <p className='text-sm'>{error}</p>
                                  </div>
                                )}

                                {!loading && !error && (
                                  <>
                                    <div className='grid grid-cols-2 gap-4'>
                                      <div className='space-y-2'>
                                        <Label>
                                          {t(
                                            'staffCustomers.checkin.identityVerification'
                                          )}
                                        </Label>
                                        <VerificationStatusBadge
                                          status={
                                            customer.verificationStatus
                                              ?.identity || 'Pending'
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
                                          status={
                                            customer.verificationStatus
                                              ?.license || 'Pending'
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className='space-y-2'>
                                      <Label>
                                        {t(
                                          'staffCustomers.common.paymentMethod'
                                        )}
                                      </Label>
                                      <VerificationStatusBadge
                                        status={
                                          customer.verificationStatus
                                            ?.payment || 'Pending'
                                        }
                                      />
                                    </div>
                                    <div className='space-y-2'>
                                      <Label htmlFor='checkin-notes'>
                                        {t('staffCustomers.checkin.notes')}
                                      </Label>
                                      <Textarea
                                        id='checkin-notes'
                                        placeholder={t(
                                          'staffCustomers.checkin.checkinNotes'
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
                                        {t(
                                          'staffCustomers.checkin.confirmTerms'
                                        )}
                                      </Label>
                                    </div>
                                  </>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => handleCheckIn(customer)}
                                  disabled={submitting || loading}
                                >
                                  {submitting ? (
                                    <>
                                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                      {t('staffCustomers.common.processing')}
                                    </>
                                  ) : (
                                    t('staffCustomers.checkin.complete')
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!loading && !error && pendingCustomers.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    {searchTerm
                      ? t('staffCustomers.checkin.emptySearch')
                      : t('staffCustomers.checkin.empty')}
                  </div>
                )}
              </div>
            )}
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
  const [renters, setRenters] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchPendingLicenseRenters() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(endpoints.renters.getAll(), {
          params: { licenseStatus: 'pending' },
        });
        const rentersData = res.data?.renters || res.data?.data?.renters || [];
        const formattedRenters = rentersData.map(renter => ({
          id: renter.id,
          name: renter.name,
          licenseNumber: renter.licenseNumber || 'N/A',
          licenseState: renter.licenseState || 'N/A',
          licenseExpiry: renter.licenseExpiry || new Date().toISOString(),
          documents: {
            license: {
              uploadDate: renter.licenseUploadDate || null,
              url: renter.licenseDocumentUrl || null,
            },
          },
          verificationStatus: {
            license: 'Pending',
          },
        }));
        setRenters(formattedRenters);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching renters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingLicenseRenters();
  }, []);

  const handleVerification = async approved => {
    if (!selectedCustomer) return;

    try {
      setSubmitting(true);
      await apiClient.put(endpoints.renters.update(selectedCustomer), {
        licenseVerified: approved,
        licenseStatus: approved ? 'verified' : 'rejected',
        licenseVerificationNotes: verificationNotes,
      });

      // Remove the verified/rejected customer from the list
      setRenters(prev => prev.filter(renter => renter.id !== selectedCustomer));
      setSelectedCustomer('');
      setVerificationNotes('');

      toast.success(
        approved
          ? t('staffCustomers.license.approveSuccess')
          : t('staffCustomers.license.rejectSuccess')
      );
    } catch (err) {
      console.error('Error updating license verification:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
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
          {loading && (
            <div className='flex justify-center py-4'>
              <div className='h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
            </div>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>{t('staffCustomers.common.error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && renters.length === 0 && (
            <Alert>
              <InfoIcon className='h-4 w-4' />
              <AlertTitle>{t('staffCustomers.license.noCustomers')}</AlertTitle>
              <AlertDescription>
                {t('staffCustomers.license.allVerified')}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && renters.length > 0 && (
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
                  {renters.map(renter => (
                    <SelectItem key={renter.id} value={renter.id}>
                      {renter.name} - {renter.licenseNumber} (
                      {renter.verificationStatus.license})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedCustomer && (
            <div className='space-y-4 p-4 border rounded-lg'>
              {(() => {
                const customer = renters.find(c => c.id === selectedCustomer);
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
                          {customer.documents.license.url ? (
                            <Button variant='outline'>
                              <FileText className='mr-2 h-4 w-4' />
                              {t('staffCustomers.license.viewUploaded')}
                            </Button>
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              {t('staffCustomers.license.noDocument')}
                            </p>
                          )}
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
                        placeholder={t('staffCustomers.license.licenseNotes')}
                        value={verificationNotes}
                        onChange={e => setVerificationNotes(e.target.value)}
                      />
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleVerification(true)}
                        className='flex-1'
                        disabled={submitting}
                      >
                        {submitting ? (
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                        ) : (
                          <CheckCircle className='mr-2 h-4 w-4' />
                        )}
                        {submitting
                          ? t('staffCustomers.common.processing')
                          : t('staffCustomers.license.approve')}
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={() => handleVerification(false)}
                        className='flex-1'
                        disabled={submitting}
                      >
                        {submitting ? (
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                        ) : (
                          <AlertTriangle className='mr-2 h-4 w-4' />
                        )}
                        {submitting
                          ? t('staffCustomers.common.processing')
                          : t('staffCustomers.license.reject')}
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
  const [renters, setRenters] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedRenterId, setSelectedRenterId] = React.useState(null);
  const [renterDetails, setRenterDetails] = React.useState(null);

  React.useEffect(() => {
    async function fetchRenters() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(endpoints.renters.getAll());
        // Kiểm tra xem data.renters có tồn tại không
        const rentersData =
          response.data?.renters || response.data?.data?.renters || [];
        const formattedRenters = rentersData.map(renter => ({
          id: renter.id,
          name: renter.name,
          email: renter.email,
          phone: renter.phone,
          avatar: renter.avatar || '/api/placeholder/32/32',
          membershipType: renter.membershipType || 'Standard',
          status: renter.isActive ? 'Active' : 'Inactive',
          totalBookings: renter.totalBookings || 0,
          lastBooking: renter.lastBooking || null,
          verificationStatus: {
            identity: renter.identityVerified ? 'Verified' : 'Pending',
            license: renter.licenseVerified ? 'Verified' : 'Pending',
            payment: renter.paymentVerified ? 'Verified' : 'Pending',
          },
        }));
        setRenters(formattedRenters);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching renters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRenters();
  }, []);

  React.useEffect(() => {
    async function fetchRenterDetails() {
      if (!selectedRenterId) return;

      try {
        setLoading(true);
        const res = await apiClient.get(
          endpoints.renters.getById(selectedRenterId)
        );
        const data = res.data?.renter || res.data || null;
        if (!data) {
          throw new Error('Failed to fetch renter details');
        }
        setRenterDetails(data);
      } catch (err) {
        console.error('Error fetching renter details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRenterDetails();
  }, [selectedRenterId]);

  const filteredCustomers = renters.filter(customer => {
    const matchesSearch =
      searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.id &&
        customer.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (customer.status &&
        customer.status.toLowerCase().replace(' ', '-') === statusFilter);

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
            <SelectItem value='inactive'>
              {t('staffCustomers.status.inactive')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        {loading && (
          <div className='flex justify-center items-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <span className='ml-2'>Đang tải dữ liệu...</span>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md'>
            <p className='font-medium'>Lỗi khi tải dữ liệu</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && renters.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            {t('staffCustomers.support.noCustomers')}
          </div>
        )}

        {!loading && !error && renters.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('staffCustomers.common.customer')}</TableHead>
                <TableHead>{t('staffCustomers.support.membership')}</TableHead>
                <TableHead>{t('staffCustomers.common.status')}</TableHead>
                <TableHead>
                  {t('staffCustomers.support.totalBookings')}
                </TableHead>
                <TableHead>
                  {t('staffCustomers.support.verification')}
                </TableHead>
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
                        <AvatarImage
                          src={customer.avatar}
                          alt={customer.name}
                        />
                        <AvatarFallback>
                          {(customer.name ?? '')
                            .split(' ')
                            .map(n => n?.[0] ?? '')
                            .join('') || '?'}
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
                          status={
                            customer.verificationStatus?.identity || 'Pending'
                          }
                        />
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs'>
                          {t('staffCustomers.common.license')}:
                        </span>
                        <VerificationStatusBadge
                          status={
                            customer.verificationStatus?.license || 'Pending'
                          }
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
                        <DropdownMenuItem
                          onClick={() => setSelectedRenterId(customer.id)}
                        >
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
        )}
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
