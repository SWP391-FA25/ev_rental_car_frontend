import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Info as InfoIcon,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from '../../shared/lib/toast';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import UserDetails from '../../admin/components/renter/UserDetails';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../shared/components/ui/alert';
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
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import documentService from '../../shared/services/documentService';
import DocumentVerification from './document-verification';

function CustomerStatusBadge({ status }) {
  const config = {
    Active: { variant: 'default' },
    'Pending Check-in': { variant: 'secondary' },
    Suspended: { variant: 'destructive' },
    Inactive: { variant: 'outline' },
  };

  const { variant } = config[status] || config['Active'];

  return <Badge variant={variant}>{status}</Badge>;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRenterId, setSelectedRenterId] = useState(null);
  const [renterDetails, setRenterDetails] = useState(null);

  // Fetch renter details when selectedRenterId changes
  useEffect(() => {
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

  useEffect(() => {
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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRenterId, setSelectedRenterId] = useState(null);
  const [renterDetails, setRenterDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDocVerifyOpen, setIsDocVerifyOpen] = useState(false);
  // Phân trang: giới hạn 10 người dùng mỗi trang để giảm lag
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const computeVerificationStatusForUser = docsForUser => {
    const identityDocs = docsForUser.filter(
      d => d.documentType === 'ID_CARD' || d.documentType === 'PASSPORT'
    );
    const licenseDocs = docsForUser.filter(
      d => d.documentType === 'DRIVERS_LICENSE'
    );

    const mapStatus = arr => {
      if (arr.length === 0) return 'Pending';
      if (arr.some(d => d.status === 'APPROVED')) return 'Verified';
      if (arr.some(d => d.status === 'REJECTED')) return 'Failed';
      return 'Pending';
    };

    return {
      identity: mapStatus(identityDocs),
      license: mapStatus(licenseDocs),
    };
  };

  useEffect(() => {
    async function fetchRenters() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(endpoints.renters.getAll());
        // Kiểm tra xem data.renters có tồn tại không
        const rentersData =
          response.data?.renters || response.data?.data?.renters || [];
        let formattedRenters = rentersData.map(renter => ({
          id: renter.id,
          name: renter.name,
          email: renter.email,
          phone: renter.phone,
          createdAt: renter.createdAt || renter.created_at || null,
          avatar: renter.avatar || '/api/placeholder/32/32',
          // Map trạng thái dựa trên accountStatus thay vì isActive để tránh hiển thị sai
          status:
            renter.accountStatus === 'ACTIVE'
              ? 'Active'
              : renter.accountStatus === 'SUSPENDED'
              ? 'Suspended'
              : 'Inactive',
          // totalBookings: renter.totalBookings || 0,
          // lastBooking: renter.lastBooking || null,
          verificationStatus: {
            identity: renter.identityVerified ? 'Verified' : 'Pending',
            license: renter.licenseVerified ? 'Verified' : 'Pending',
            payment: renter.paymentVerified ? 'Verified' : 'Pending',
          },
        }));

        try {
          const docsRes = await documentService.getAllDocuments();
          const docsSuccess = docsRes?.success;
          if (docsSuccess) {
            const docs = docsRes?.data?.documents || [];
            const byUser = {};
            for (const doc of docs) {
              const uid = doc?.user?.id;
              if (!uid) continue;
              if (!byUser[uid]) byUser[uid] = [];
              byUser[uid].push(doc);
            }
            formattedRenters = formattedRenters.map(r => {
              const docsForUser = byUser[r.id] || [];
              if (docsForUser.length === 0) return r;
              const vs = computeVerificationStatusForUser(docsForUser);
              return {
                ...r,
                verificationStatus: { ...r.verificationStatus, ...vs },
              };
            });
          }
        } catch (e) {
          // Nếu không lấy được documents, giữ nguyên theo cờ booleans
        }
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

  const filteredCustomers = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return renters.filter(c => {
      const matchesTerm =
        term === '' ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(searchTerm));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.status === 'Active') ||
        (statusFilter === 'inactive' && c.status === 'Inactive') ||
        (statusFilter === 'suspended' && c.status === 'Suspended');
      return matchesTerm && matchesStatus;
    });
  }, [renters, searchTerm, statusFilter]);

  // Tính toán phân trang dựa trên filteredCustomers
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Khi thay đổi bộ lọc hoặc tìm kiếm, reset về trang 1 và chặn vượt quá totalPages
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const payload = { accountStatus: newStatus };
      const res = await apiClient.put(endpoints.renters.update(id), payload);
      const success = res?.data?.success ?? true;
      if (!success) {
        throw new Error(res?.data?.message || 'Cập nhật trạng thái thất bại');
      }
      setRenters(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, status: newStatus === 'ACTIVE' ? 'Active' : 'Suspended' }
            : r
        )
      );
      toast.success('User status updated');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCustomer = customer => {
    const phone = customer.phone || 'No phone number';
    try {
      if (navigator?.clipboard && customer.phone) {
        navigator.clipboard.writeText(customer.phone);
        toast.info(`Customer phone: ${phone} (copied)`);
      } else {
        toast.info(`Customer phone: ${phone}`);
      }
    } catch {
      toast.info(`Customer phone: ${phone}`);
    }
  };

  const handleVerifyDocuments = () => {
    // Mở Dialog chứa DocumentVerification ngay trong Customer Management
    setIsDocVerifyOpen(true);
  };

  useEffect(() => {
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
            <SelectItem value='suspended'>
              {t('userManagement.badges.suspended', {
                defaultValue: 'Suspended',
              })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border text-sm'>
        {loading && (
          <div className='flex justify-center items-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <span className='ml-2'>Loading data...</span>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md'>
            <p className='font-medium'>Error loading data</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && renters.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            {t('staffCustomers.support.noCustomers')}
          </div>
        )}

        {!loading && !error && renters.length > 0 && (
          <>
            <Table className='table-fixed w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-2/12'>
                    {t('userManagement.table.name', { defaultValue: 'Name' })}
                  </TableHead>
                  <TableHead className='w-3/12'>
                    {t('userManagement.table.email', { defaultValue: 'Email' })}
                  </TableHead>
                  <TableHead className='w-2/12'>
                    {t('userManagement.table.phone', {
                      defaultValue: 'Phone',
                    })}
                  </TableHead>
                  <TableHead className='w-2/12'>
                    {t('userManagement.table.status', {
                      defaultValue: 'Status',
                    })}
                  </TableHead>
                  <TableHead className='w-2/12'>
                    {t('userManagement.table.joinDate', {
                      defaultValue: 'Created at',
                    })}
                  </TableHead>
                  <TableHead className='w-1/12 text-center'>
                    {t('userManagement.table.actions', {
                      defaultValue: 'Thao tác',
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='overflow-y'>
                {pagedCustomers.map(customer => (
                  <TableRow
                    key={customer.id}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    <TableCell className='font-medium'>
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || '—'}</TableCell>
                    <TableCell>
                      <CustomerStatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell>
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className='text-center'>
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
                            onClick={() => {
                              setSelectedRenterId(customer.id);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            {t('staffCustomers.support.viewProfile')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleContactCustomer(customer)}
                          >
                            <Phone className='mr-2 h-4 w-4' />
                            {t('staffCustomers.support.contactCustomer')}
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => {
                              setSelectedRenterId(customer.id);
                              setIsDocVerifyOpen(true);
                            }}
                          >
                            <Shield className='mr-2 h-4 w-4' />
                            {t('staffSidebar.documents')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator /> */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(customer.id, 'SUSPENDED')
                            }
                          >
                            <Ban className='mr-2 h-4 w-4' />
                            {t('staffCustomers.support.suspend', {
                              defaultValue: 'Suspend',
                            })}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className='flex items-center justify-between px-4 py-3 border-t'>
              <div className='text-sm text-muted-foreground'>
                Showing {filteredCustomers.length === 0 ? 0 : startIndex + 1}–
                {Math.min(endIndex, filteredCustomers.length)} of{' '}
                {filteredCustomers.length} customers
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className='mr-1 h-4 w-4' />
                  Previous
                </Button>
                <span className='text-sm'>
                  Page {currentPage}/{totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                >
                  Sau
                  <ChevronRight className='ml-1 h-4 w-4' />
                </Button>
              </div>
            </div>
          </>
        )}

        <UserDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          userId={selectedRenterId}
          verificationStatus={
            renters.find(r => r.id === selectedRenterId)?.verificationStatus
          }
          onUserUpdated={updated => {
            if (!updated?.id) return;
            setRenters(prev =>
              prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r))
            );
          }}
        />

        <Dialog open={isDocVerifyOpen} onOpenChange={setIsDocVerifyOpen}>
          <DialogContent className='max-w-5xl'>
            <DialogHeader>
              <DialogTitle>{t('staffSidebar.documents')}</DialogTitle>
              <DialogDescription>
                {t('staffDocuments.description', {
                  defaultValue: 'Verify customer documents',
                })}
              </DialogDescription>
            </DialogHeader>
            <DocumentVerification
              userId={selectedRenterId}
              onVerificationUpdated={(uid, verificationStatus) => {
                setRenters(prev =>
                  prev.map(r =>
                    r.id === uid ? { ...r, verificationStatus } : r
                  )
                );
                setRenterDetails(prev =>
                  prev && prev.id === uid
                    ? { ...prev, verificationStatus }
                    : prev
                );
              }}
            />
          </DialogContent>
        </Dialog>
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
          <TabsTrigger value='support'>
            {t('staffCustomers.tabs.support')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='checkin' className='space-y-4'>
          <CustomerCheckIn />
        </TabsContent>

        <TabsContent value='support' className='space-y-4'>
          <CustomerSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
