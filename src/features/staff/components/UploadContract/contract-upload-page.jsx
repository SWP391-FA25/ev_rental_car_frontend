'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  X,
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/components/ui/tabs';
import { Badge } from '../../../shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { endpoints } from '../../../shared/lib/endpoints';
import { apiClient } from '../../../shared/lib/apiClient';
import { toast } from 'sonner';
import { CreateContractModal } from '../CreateContractModal';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { useBooking } from '../../../booking/hooks/useBooking';

export function ContractUploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getAllBookings } = useBooking();

  // Tab state
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'create'

  // ========== EXISTING CONTRACTS TAB ==========
  const [existingContracts, setExistingContracts] = useState([]);
  const [existingLoading, setExistingLoading] = useState(false);
  const [existingPage, setExistingPage] = useState(1);
  const [existingLimit] = useState(10);
  const [existingTotal, setExistingTotal] = useState(0);
  const [existingTotalPages, setExistingTotalPages] = useState(0);
  const [existingSearch, setExistingSearch] = useState('');
  const [existingStatusFilter, setExistingStatusFilter] = useState('');

  // ========== CREATE CONTRACT TAB (Bookings without contract) ==========
  const [bookingsWithoutContract, setBookingsWithoutContract] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsSearch, setBookingsSearch] = useState('');

  // ========== COMMON STATE ==========
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Authorization check
  useEffect(() => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      toast.error('You do not have permission to access this page');
    }
  }, [user]);

  // ========== FETCH EXISTING CONTRACTS ==========
  const fetchExistingContracts = async (page = 1, status = '', search = '') => {
    try {
      setExistingLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: existingLimit.toString(),
      });

      if (status) params.append('status', status);
      // Backend search tự tìm trong booking.user.name, vehicle.model, etc

      const response = await apiClient.get(
        `${endpoints.contracts.getAll()}?${params.toString()}`
      );

      console.log('📄 Contracts API Response:', response);
      console.log('📄 Response data:', response?.data);
      console.log('📄 Response data.data:', response?.data?.data);

      const data = response?.data || {}; // Backend trả về {success, data: {contracts, pagination}}
      const contracts = data.contracts || [];
      const pagination = data.pagination || {};

      console.log('📄 Extracted contracts:', contracts);
      console.log('📄 Extracted pagination:', pagination);

      setExistingContracts(contracts);
      setExistingTotal(pagination.total || 0);
      setExistingTotalPages(pagination.totalPages || 0);
    } catch (err) {
      console.error('❌ Fetch contracts error:', err);
      console.error('❌ Error response:', err?.response);
      toast.error('Failed to load contracts');
    } finally {
      setExistingLoading(false);
    }
  };

  // ========== FETCH BOOKINGS WITHOUT CONTRACT ==========
  const fetchBookingsWithoutContract = async () => {
    try {
      setBookingsLoading(true);

      // Fetch CONFIRMED bookings using useBooking hook (same as CheckIn)
      const bookingsData = await getAllBookings({
        status: 'CONFIRMED',
        limit: 100,
      });

      console.log('📦 Bookings Data (from useBooking):', bookingsData);

      // Fetch all contracts
      const contractsResponse = await apiClient.get(
        endpoints.contracts.getAll()
      );
      console.log('📄 Contracts Response:', contractsResponse);

      const bookings = bookingsData?.bookings || [];
      const contracts = contractsResponse?.data?.contracts || [];

      console.log('📦 Extracted bookings:', bookings);
      console.log('📄 Extracted contracts:', contracts);

      // Create map of bookingId that have contracts
      const bookingIdsWithContract = new Set(
        contracts.map(c => c.bookingId).filter(Boolean)
      );

      console.log(
        '🔍 Booking IDs with contracts:',
        Array.from(bookingIdsWithContract)
      );

      // Filter bookings without contracts
      const bookingsWithout = bookings.filter(
        booking => !bookingIdsWithContract.has(booking.id)
      );

      console.log('✅ Bookings without contracts:', bookingsWithout);

      setBookingsWithoutContract(bookingsWithout);
    } catch (err) {
      console.error('❌ Fetch bookings error:', err);
      toast.error('Failed to load bookings');
      setBookingsWithoutContract([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'existing') {
      fetchExistingContracts(
        existingPage,
        existingStatusFilter,
        existingSearch
      );
    } else if (activeTab === 'create') {
      fetchBookingsWithoutContract();
    }
  }, [activeTab, existingPage, existingStatusFilter]);

  // ========== HANDLERS ==========
  const handleCreateContract = async booking => {
    try {
      // Fetch full booking details to ensure we have customer info
      const response = await apiClient.get(endpoints.bookings.getById(booking.id));
      const fullBooking = response?.data?.booking || response?.data || booking;

      console.log('📋 Full booking data:', fullBooking);

      setSelectedBooking(fullBooking);
      setShowUploadModal(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
      // Fallback to using the booking data we have
      setSelectedBooking(booking);
      setShowUploadModal(true);
    }
  };

  const handleViewContract = contract => {
    console.log('🔍 View Contract clicked:', contract);
    console.log('🔍 signedFileUrl:', contract?.signedFileUrl);
    console.log('🔍 signedFileName:', contract?.signedFileName);
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const handleUploadSuccess = async () => {
    toast.success('Contract created successfully!');
    setShowUploadModal(false);
    setSelectedBooking(null);
    setSelectedContract(null);

    // Refresh current tab
    if (activeTab === 'existing') {
      await fetchExistingContracts(
        existingPage,
        existingStatusFilter,
        existingSearch
      );
    } else {
      await fetchBookingsWithoutContract();
    }

    // Navigate to check-in after 1.5s
    setTimeout(() => {
      navigate('/staff?tab=check-in');
    }, 1500);
  };

  // ========== HELPERS ==========
  const getStatusBadge = status => {
    switch (status) {
      case 'CREATED':
        return (
          <Badge
            variant='outline'
            className='bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
          >
            <Clock className='w-3 h-3 mr-1' />
            Pending Upload
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge
            variant='outline'
            className='text-green-700 border-green-200 bg-green-50 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Completed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== FILTERED DATA ==========
  const filteredExisting = existingContracts.filter(contract => {
    if (!existingSearch) return true; // Show all if no search

    const searchLower = existingSearch.toLowerCase();
    return (
      contract?.contractNumber?.toLowerCase().includes(searchLower) ||
      contract?.booking?.user?.name?.toLowerCase().includes(searchLower) ||
      contract?.booking?.vehicle?.licensePlate
        ?.toLowerCase()
        .includes(searchLower) ||
      contract?.renterName?.toLowerCase().includes(searchLower)
    );
  });

  const filteredBookings = bookingsWithoutContract.filter(
    booking =>
      booking?.user?.name
        ?.toLowerCase()
        .includes(bookingsSearch.toLowerCase()) ||
      booking?.vehicle?.licensePlate
        ?.toLowerCase()
        .includes(bookingsSearch.toLowerCase()) ||
      booking?.station?.name
        ?.toLowerCase()
        .includes(bookingsSearch.toLowerCase())
  );

  // ========== RENDER ==========
  return (
    <div className='min-h-screen p-6 bg-linear-to-br from-muted/30 to-muted/50'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-4xl font-bold'>Contract Management</h1>
          <p className='text-muted-foreground'>
            Manage rental contracts and create new ones
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='existing' className='flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              Existing Contracts
            </TabsTrigger>
            <TabsTrigger value='create' className='flex items-center gap-2'>
              <Plus className='w-4 h-4' />
              Create Contract
            </TabsTrigger>
          </TabsList>

          {/* ========== TAB 1: EXISTING CONTRACTS ========== */}
          <TabsContent value='existing' className='space-y-4'>
            {/* Filters */}
            <div className='flex flex-col gap-4 md:flex-row md:items-center'>
              <Input
                placeholder='Search by contract number, customer, vehicle...'
                value={existingSearch}
                onChange={e => setExistingSearch(e.target.value)}
                className='md:w-96'
              />
              <Select
                value={existingStatusFilter || 'ALL'}
                onValueChange={value =>
                  setExistingStatusFilter(value === 'ALL' ? '' : value)
                }
              >
                <SelectTrigger className='md:w-48'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Status</SelectItem>
                  <SelectItem value='CREATED'>Pending Upload</SelectItem>
                  <SelectItem value='COMPLETED'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card>
              {existingLoading ? (
                <div className='p-12 text-center'>
                  <div className='w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary' />
                  <p className='text-muted-foreground'>Loading contracts...</p>
                </div>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='border-b bg-muted/50'>
                        <tr>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Contract #
                          </th>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Customer
                          </th>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Vehicle
                          </th>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Status
                          </th>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Created
                          </th>
                          <th className='px-4 py-3 text-sm font-semibold text-left'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y'>
                        {filteredExisting.length > 0 ? (
                          filteredExisting.map((contract, index) => (
                            <tr key={contract.id} className='hover:bg-muted/30'>
                              <td className='px-4 py-3'>
                                <span className='font-mono text-sm font-medium text-primary'>
                                  #
                                  {String(
                                    (existingPage - 1) * existingLimit +
                                    index +
                                    1
                                  ).padStart(3, '0')}
                                </span>
                              </td>
                              <td className='px-4 py-3'>
                                <div>
                                  <p className='font-medium'>
                                    {contract.booking?.user?.name || 'N/A'}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {contract.booking?.user?.phone || 'N/A'}
                                  </p>
                                </div>
                              </td>
                              <td className='px-4 py-3'>
                                <p className='text-sm'>
                                  {contract.booking?.vehicle?.licensePlate ||
                                    'N/A'}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {contract.booking?.vehicle?.brand}{' '}
                                  {contract.booking?.vehicle?.model}
                                </p>
                              </td>
                              <td className='px-4 py-3'>
                                {getStatusBadge(contract.status)}
                              </td>
                              <td className='px-4 py-3'>
                                <p className='text-sm text-muted-foreground'>
                                  {formatDate(contract.createdAt)}
                                </p>
                              </td>
                              <td className='px-4 py-3'>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleViewContract(contract)}
                                  >
                                    <Eye className='w-4 h-4' />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className='px-4 py-12 text-center'>
                              <FileText className='w-12 h-12 mx-auto mb-2 text-muted-foreground/50' />
                              <p className='text-muted-foreground'>
                                No contracts found
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {existingTotalPages > 1 && (
                    <div className='flex items-center justify-between p-4 border-t'>
                      <p className='text-sm text-muted-foreground'>
                        Page {existingPage} of {existingTotalPages} •{' '}
                        {existingTotal} total
                      </p>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            setExistingPage(p => Math.max(1, p - 1))
                          }
                          disabled={existingPage === 1}
                        >
                          <ChevronLeft className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            setExistingPage(p =>
                              Math.min(existingTotalPages, p + 1)
                            )
                          }
                          disabled={existingPage === existingTotalPages}
                        >
                          <ChevronRight className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabsContent>

          {/* ========== TAB 2: CREATE CONTRACT ========== */}
          <TabsContent value='create' className='space-y-4'>
            {/* Search */}
            <Input
              placeholder='Search by customer, vehicle, branch...'
              value={bookingsSearch}
              onChange={e => setBookingsSearch(e.target.value)}
              className='md:w-96'
            />

            {/* Table */}
            <Card>
              {bookingsLoading ? (
                <div className='p-12 text-center'>
                  <div className='w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary' />
                  <p className='text-muted-foreground'>Loading bookings...</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='border-b bg-muted/50'>
                      <tr>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Booking ID
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Customer
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Vehicle
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Branch
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Start Date
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold text-left'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <tr key={booking.id} className='hover:bg-muted/30'>
                            <td className='px-4 py-3'>
                              <span className='font-mono text-sm font-semibold'>
                                #{String(index + 1).padStart(3, '0')}
                              </span>
                            </td>
                            <td className='px-4 py-3'>
                              <div>
                                <p className='font-medium'>
                                  {booking.user?.name || booking.renter?.name || 'Unknown'}
                                </p>
                                {(booking.user?.phone || booking.renter?.phone || booking.user?.email) && (
                                  <p className='text-xs text-muted-foreground'>
                                    {booking.user?.phone || booking.renter?.phone || booking.user?.email}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className='px-4 py-3'>
                              <p className='text-sm'>
                                {booking.vehicle?.licensePlate || 'N/A'}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {booking.vehicle?.brand}{' '}
                                {booking.vehicle?.model}
                              </p>
                            </td>
                            <td className='px-4 py-3'>
                              <p className='text-sm'>
                                {booking.station?.name || 'N/A'}
                              </p>
                            </td>
                            <td className='px-4 py-3'>
                              <p className='text-sm text-muted-foreground'>
                                {formatDate(booking.startTime)}
                              </p>
                            </td>
                            <td className='px-4 py-3'>
                              <Button
                                variant='default'
                                size='sm'
                                onClick={() => handleCreateContract(booking)}
                                className='bg-green-600 hover:bg-green-700'
                              >
                                <Plus className='w-4 h-4 mr-1' />
                                Create Contract
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className='px-4 py-12 text-center'>
                            <AlertCircle className='w-12 h-12 mx-auto mb-2 text-muted-foreground/50' />
                            <p className='text-muted-foreground'>
                              No confirmed bookings without contract
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ✨ Contract Upload Modal - Using CreateContractModal */}
      <CreateContractModal
        booking={selectedBooking}
        existingContract={null}
        isOpen={showUploadModal && !!selectedBooking}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedBooking(null);
        }}
        onSuccess={handleUploadSuccess}
      />

      {/* Contract Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
          <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold'>Contract Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              <div className='space-y-6'>
                {/* Contract Info */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Contract Information
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>
                        Contract Number
                      </p>
                      <p className='font-semibold'>
                        {selectedContract.contractNumber || 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>Status</p>
                      {getStatusBadge(selectedContract.status)}
                    </div>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>
                        Renter Name
                      </p>
                      <p className='font-semibold'>
                        {selectedContract.renterName || 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>
                        Witness Name
                      </p>
                      <p className='font-semibold'>
                        {selectedContract.witnessName || 'N/A'}
                      </p>
                    </div>
                    <div className='col-span-2 p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>Notes</p>
                      <p className='text-sm'>
                        {selectedContract.notes || 'No notes'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                {selectedContract.booking && (
                  <div>
                    <h3 className='mb-4 text-lg font-semibold'>
                      Booking Information
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>
                          Customer
                        </p>
                        <p className='font-semibold'>
                          {selectedContract.booking.user?.name || 'N/A'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {selectedContract.booking.user?.phone || 'N/A'}
                        </p>
                      </div>
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>Vehicle</p>
                        <p className='font-semibold'>
                          {selectedContract.booking.vehicle?.licensePlate ||
                            'N/A'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {selectedContract.booking.vehicle?.brand}{' '}
                          {selectedContract.booking.vehicle?.model}
                        </p>
                      </div>
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>
                          Start Time
                        </p>
                        <p className='text-sm'>
                          {formatDate(selectedContract.booking.startTime)}
                        </p>
                      </div>
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>
                          End Time
                        </p>
                        <p className='text-sm'>
                          {formatDate(selectedContract.booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>Timestamps</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>
                        Created At
                      </p>
                      <p className='text-sm'>
                        {formatDate(selectedContract.createdAt)}
                      </p>
                    </div>
                    <div className='p-3 border rounded bg-muted/50'>
                      <p className='text-sm text-muted-foreground'>
                        Updated At
                      </p>
                      <p className='text-sm'>
                        {formatDate(selectedContract.updatedAt)}
                      </p>
                    </div>
                    {selectedContract.signedAt && (
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>
                          Signed At
                        </p>
                        <p className='text-sm'>
                          {formatDate(selectedContract.signedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signed Contract Preview */}
                {selectedContract.signedFileUrl && (
                  <div>
                    <h3 className='mb-4 text-lg font-semibold'>
                      Signed Contract
                    </h3>
                    <div className='space-y-3'>
                      {/* File Name */}
                      <div className='p-3 border rounded bg-muted/50'>
                        <p className='text-sm text-muted-foreground'>
                          File Name
                        </p>
                        <p className='mt-1 font-mono text-sm break-all'>
                          {selectedContract.signedFileName || 'N/A'}
                        </p>
                      </div>

                      {/* File Preview */}
                      <div className='overflow-hidden border rounded bg-muted/50'>
                        {selectedContract.signedFileName
                          ?.toLowerCase()
                          .endsWith('.pdf') ? (
                          // PDF Preview using iframe
                          <iframe
                            src={selectedContract.signedFileUrl}
                            className='w-full h-[500px]'
                            title='Signed Contract PDF'
                          />
                        ) : (
                          // Image Preview
                          <img
                            src={selectedContract.signedFileUrl}
                            alt='Signed Contract'
                            className='object-contain w-full h-auto max-h-[500px]'
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() =>
                          window.open(selectedContract.signedFileUrl, '_blank')
                        }
                        variant='outline'
                        className='w-full'
                      >
                        <Eye className='w-4 h-4 mr-2' />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className='flex gap-3 mt-6'>
                <Button
                  onClick={() => setShowDetailModal(false)}
                  variant='outline'
                  className='flex-1'
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
