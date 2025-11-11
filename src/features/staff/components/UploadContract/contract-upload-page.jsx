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
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { endpoints } from '../../../shared/lib/endpoints';
import { apiClient } from '../../../shared/lib/apiClient';
import { toast } from 'sonner';
import { ContractUploadForm } from './contract-upload-form';
import { useAuth } from '../../../../app/providers/AuthProvider';

export function ContractUploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Backend only has: COMPLETED
  // Frontend adds "NO_CONTRACT" for bookings without contract
  const statusOptions = ['all', 'NO_CONTRACT', 'COMPLETED']; // Không còn CREATED
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  // Authorization check
  useEffect(() => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      toast.error('You do not have permission to access this page');
      // Optionally redirect to home or another page
    }
  }, [user]);

  // Fetch both bookings and contracts, then merge
  const fetchContracts = async () => {
    try {
      setLoading(true);

      // Fetch both bookings and contracts in parallel
      const [bookingsResponse, contractsResponse] = await Promise.all([
        apiClient.get(
          `${endpoints.bookings.getAll()}?status=CONFIRMED&limit=100`
        ),
        apiClient.get(endpoints.contracts.getAll()),
      ]);

      const confirmedBookings = Array.isArray(bookingsResponse?.data)
        ? bookingsResponse.data
        : Array.isArray(bookingsResponse?.data?.bookings)
        ? bookingsResponse.data.bookings
        : [];

      const existingContracts = Array.isArray(contractsResponse?.data)
        ? contractsResponse.data
        : Array.isArray(contractsResponse?.data?.contracts)
        ? contractsResponse.data.contracts
        : [];

      console.log('📋 Found CONFIRMED bookings:', confirmedBookings.length);
      console.log('📄 Found existing contracts:', existingContracts.length);

      // Create a map of contracts by bookingId
      const contractMap = {};
      existingContracts.forEach(contract => {
        if (contract?.bookingId) {
          contractMap[contract.bookingId] = contract;
        }
      });

      // Merge bookings with their contracts
      const mergedData = confirmedBookings.map(booking => {
        const contract = contractMap[booking.id];
        return {
          ...booking,
          hasContract: !!contract,
          contractId: contract?.id || null,
          contractNumber: contract?.contractNumber || null,
          // Backend status: CREATED (no file yet) or COMPLETED (file uploaded)
          // Frontend: NO_CONTRACT (no contract record exists yet)
          contractStatus: contract?.status || 'NO_CONTRACT',
          contractFileUrl: contract?.signedFileUrl || null,
          contractCreatedAt: contract?.createdAt || null,
          contractUpdatedAt: contract?.updatedAt || null,
          vehicleId: booking?.vehicle?.id || booking?.vehicleId,
        };
      });

      console.log('🔗 Merged data:', mergedData.length);

      // Collect user ids to fetch phone numbers
      const userIdsToFetch = [
        ...new Set(mergedData.map(b => b.userId).filter(id => id)),
      ];

      // Collect vehicle ids to fetch brand and model
      const vehicleIdsToFetch = [
        ...new Set(mergedData.map(b => b.vehicleId).filter(id => id)),
      ];

      // Fetch user details to get phone numbers
      if (userIdsToFetch.length > 0) {
        try {
          console.log('👤 Fetching user details for:', userIdsToFetch);
          const userFetches = userIdsToFetch.map(id =>
            apiClient
              .get(endpoints.renters.getById(id))
              .then(r => {
                console.log(`🔍 API Response for user ${id}:`, r);
                // Backend returns { success: true, data: { renter } }
                return { id, data: r?.data?.data?.renter || r?.data?.renter };
              })
              .catch(err => {
                console.error(`❌ Error fetching user ${id}:`, err);
                return { id, data: null };
              })
          );
          const users = await Promise.all(userFetches);

          const userMap = {};
          users.forEach(u => {
            if (u?.id && u?.data) {
              userMap[u.id] = u.data;
              console.log(`✅ User ${u.id}:`, {
                name: u.data.name,
                email: u.data.email,
                phone: u.data.phone,
              });
            }
          });

          // Merge fetched user phone back into mergedData
          for (let i = 0; i < mergedData.length; i++) {
            const uid = mergedData[i]?.userId;
            if (uid && userMap[uid]) {
              // If user object doesn't exist, create it
              if (!mergedData[i].user) {
                mergedData[i].user = {};
              }
              mergedData[i].user = {
                ...mergedData[i].user,
                id: uid,
                name: userMap[uid].name || mergedData[i].user.name,
                email: userMap[uid].email || mergedData[i].user.email,
                phone: userMap[uid].phone,
              };
              console.log(`✅ Merged user ${uid}:`, mergedData[i].user);
            }
          }
          console.log('🔄 User phone data merged successfully');
        } catch (err) {
          console.warn('⚠️ Could not fetch user details:', err);
        }
      }

      // Fetch vehicle details
      if (vehicleIdsToFetch.length > 0) {
        try {
          console.log('🚗 Fetching vehicle details for:', vehicleIdsToFetch);
          // Fetch vehicle details in parallel
          const vehicleFetches = vehicleIdsToFetch.map(id =>
            apiClient
              .get(endpoints.vehicles.getById(id))
              .then(r => {
                console.log(`🔍 API Response for vehicle ${id}:`, r);
                return { id, data: r?.data?.data || r?.data };
              })
              .catch(err => {
                console.error(`❌ Error fetching vehicle ${id}:`, err);
                return { id, data: null };
              })
          );
          const vehicles = await Promise.all(vehicleFetches);

          const vehicleMap = {};
          vehicles.forEach(v => {
            if (v?.id && v?.data) {
              vehicleMap[v.id] = v.data;
              console.log(`✅ Vehicle ${v.id}:`, {
                brand: v.data.brand,
                model: v.data.model,
                licensePlate: v.data.licensePlate,
                fullData: v.data,
              });
            }
          });

          // Merge fetched vehicle info back into mergedData
          for (let i = 0; i < mergedData.length; i++) {
            const vid = mergedData[i]?.vehicleId;
            if (vid && vehicleMap[vid]) {
              mergedData[i].vehicle = {
                ...mergedData[i].vehicle,
                brand: vehicleMap[vid].brand,
                model: vehicleMap[vid].model,
              };
              console.log(`✅ Merged vehicle ${vid}:`, mergedData[i].vehicle);
            }
          }
          console.log('🔄 Vehicle data merged successfully');
        } catch (err) {
          console.warn('⚠️ Could not fetch additional vehicle details:', err);
        }
      }

      setContracts(mergedData);
      setTotalPages(Math.ceil(mergedData.length / limit));
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err?.message || 'Failed to load data');
      toast.error('Failed to load data');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleUploadClick = contract => {
    console.log('📤 Opening upload modal for contract:', contract);
    console.log('🚗 Vehicle data:', contract?.vehicle);
    setSelectedContract(contract);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = async () => {
    await fetchContracts();
    setShowUploadModal(false);
    setSelectedContract(null);
    toast.success(
      'Contract uploaded successfully! Redirecting to Check-In...',
      {
        duration: 2000,
      }
    );

    // ✅ Navigate to CheckInCar page after 1.5 seconds
    setTimeout(() => {
      navigate('/staff?tab=check-in');
    }, 1500);
  };

  const handleViewDetails = contract => {
    console.log('👁️ Opening detail modal for contract:', contract);
    console.log('🚗 Vehicle data:', contract?.vehicle);
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract?.contractNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract?.vehicle?.licensePlate
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract?.vehicle?.brand
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract?.vehicle?.model
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract?.station?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    // Không còn trạng thái CREATED
    const matchesStatus =
      filterStatus === 'all'
        ? contract?.contractStatus !== 'CREATED'
        : contract?.contractStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = status => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'NO_CONTRACT':
        return <AlertCircle className='w-5 h-5 text-amber-600' />;
      default:
        return null;
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'COMPLETED':
        return t('staffContracts.status.completed');
      case 'NO_CONTRACT':
        return t('staffContracts.status.noContract');
      default:
        return status || t('staffContracts.status.unknown');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'NO_CONTRACT':
        return 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-muted/50 text-muted-foreground border';
    }
  };

  const getVehicleLabel = vehicle => {
    if (!vehicle) return '';

    // Priority: brand + model > model alone > name
    // Do NOT fallback to licensePlate (to avoid duplication)
    if (vehicle.brand && vehicle.model)
      return `${vehicle.brand} ${vehicle.model}`;
    if (vehicle.model) return vehicle.model;
    if (vehicle.name) return vehicle.name;

    return ''; // Return empty string if no brand/model/name
  };

  const formatFileSize = bytes => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
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

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-muted/30 to-muted/50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>{t('staffContracts.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-muted/30 to-muted/50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>
            {t('staffContracts.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('staffContracts.subtitle')}
          </p>
        </div>

        {/* Filters and Search */}
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex-1'>
            <Input
              placeholder={t('staffContracts.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              {t('staffContracts.filters.all')}
            </Button>
            <Button
              variant={filterStatus === 'NO_CONTRACT' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('NO_CONTRACT')}
            >
              {t('staffContracts.filters.noContract')}
            </Button>
            {/* Đã xóa nút Chờ tải file */}
            <Button
              variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              {t('staffContracts.filters.completed')}
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-muted/50 border-b'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.contractNumber')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.customer')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.vehicleBranch')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.status')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.createdAt')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold'>
                    {t('staffContracts.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {filteredContracts.length > 0 ? (
                  filteredContracts.map(contract => (
                    <tr
                      key={contract?.id}
                      className='hover:bg-muted/50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        {contract?.contractNumber ? (
                          <p className='font-mono text-sm font-medium text-primary'>
                            {contract.contractNumber}
                          </p>
                        ) : (
                          <p className='text-sm text-muted-foreground italic'>
                            {t('staffContracts.common.notAvailable')}
                          </p>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='font-medium'>
                            {contract?.user?.name ||
                              getVehicleLabel(contract?.vehicle) ||
                              'N/A'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {contract?.user?.phone || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='text-sm font-medium'>
                            {contract?.vehicle?.licensePlate || 'N/A'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {contract?.station?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                            contract?.contractStatus
                          )}`}
                        >
                          {getStatusIcon(contract?.contractStatus)}
                          <span className='text-sm font-medium'>
                            {getStatusLabel(contract?.contractStatus)}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(
                            contract?.contractCreatedAt || contract?.createdAt
                          )}
                        </p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-muted-foreground hover:text-primary hover:bg-primary/10'
                            title={t('staffContracts.actions.viewDetails')}
                            onClick={() => handleViewDetails(contract)}
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                          {contract?.contractStatus === 'NO_CONTRACT' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                              title={t('staffContracts.actions.upload')}
                              onClick={() => handleUploadClick(contract)}
                            >
                              <Upload className='w-4 h-4' />
                            </Button>
                          )}
                          {contract?.contractFileUrl && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                              title={t('staffContracts.actions.download')}
                              onClick={() =>
                                window.open(contract.contractFileUrl, '_blank')
                              }
                            >
                              <Download className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center gap-2'>
                        <FileText className='w-12 h-12 text-muted-foreground/50' />
                        <p className='text-muted-foreground'>
                          {t('staffContracts.empty.noBookings')}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className='bg-muted/50 border-t px-6 py-4 flex flex-wrap gap-6'>
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('staffContracts.stats.total')}
              </p>
              <p className='text-2xl font-bold'>{contracts.length}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('staffContracts.stats.notCreated')}
              </p>
              <p className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
                {
                  contracts.filter(c => c?.contractStatus === 'NO_CONTRACT')
                    .length
                }
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('staffContracts.stats.completed')}
              </p>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {
                  contracts.filter(c => c?.contractStatus === 'COMPLETED')
                    .length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedContract && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold'>
                  {t('staffContracts.upload.title')}
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              <div className='mb-6 p-4 bg-muted/50 rounded-lg border'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staffContracts.details.contractNumber')}
                    </p>
                    {selectedContract?.contractNumber ? (
                      <p className='font-mono font-semibold text-primary'>
                        {selectedContract.contractNumber}
                      </p>
                    ) : (
                      <p className='text-sm text-muted-foreground italic'>
                        {t('staffContracts.details.autoGenerate')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staffContracts.details.status')}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      {getStatusIcon(selectedContract?.contractStatus)}
                      <span className='font-semibold'>
                        {getStatusLabel(selectedContract?.contractStatus)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staffContracts.details.customer')}
                    </p>
                    <p className='font-semibold'>
                      {selectedContract?.user?.name || 'N/A'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedContract?.user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staffContracts.details.vehicle')}
                    </p>
                    <p className='font-semibold'>
                      {selectedContract?.vehicle?.licensePlate || 'N/A'}
                    </p>
                    {getVehicleLabel(selectedContract?.vehicle) && (
                      <p className='text-xs text-muted-foreground'>
                        {getVehicleLabel(selectedContract?.vehicle)}
                      </p>
                    )}
                  </div>
                  <div className='col-span-2'>
                    <p className='text-sm text-muted-foreground'>
                      {t('staffContracts.details.branch')}
                    </p>
                    <p className='font-semibold'>
                      {selectedContract?.station?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <ContractUploadForm
                bookingId={selectedContract?.id}
                contractId={selectedContract?.contractId}
                customerName={selectedContract?.user?.name}
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUploadModal(false)}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold'>Booking Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
              <div className='space-y-6'>
                {/* Booking Info */}
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    Booking Information
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-3 bg-muted/50 rounded border'>
                      <p className='text-sm text-muted-foreground'>Status</p>
                      <div className='flex items-center gap-2 mt-1'>
                        {getStatusIcon(selectedContract?.status)}
                        <span className='font-semibold'>
                          {getStatusLabel(selectedContract?.status)}
                        </span>
                      </div>
                    </div>
                    <div className='p-3 bg-muted/50 rounded border'>
                      <p className='text-sm text-muted-foreground'>Phone</p>
                      <p className='font-semibold'>
                        {selectedContract?.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 bg-muted/50 rounded border'>
                      <p className='text-sm text-muted-foreground'>Customer</p>
                      <p className='font-semibold'>
                        {selectedContract?.user?.name ||
                          getVehicleLabel(selectedContract?.vehicle) ||
                          'N/A'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {selectedContract?.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 bg-muted/50 rounded border'>
                      <p className='text-sm text-muted-foreground'>Vehicle</p>
                      <p className='font-semibold'>
                        {selectedContract?.vehicle?.licensePlate || 'N/A'}
                      </p>
                      {getVehicleLabel(selectedContract?.vehicle) && (
                        <p className='text-xs text-muted-foreground'>
                          {getVehicleLabel(selectedContract?.vehicle)}
                        </p>
                      )}
                    </div>
                    <div className='p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700'>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Branch
                      </p>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>
                        {selectedContract?.station?.name || 'N/A'}
                      </p>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        {selectedContract?.station?.address || 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700'>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Staff in Charge
                      </p>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>
                        {selectedContract?.staff?.name || user?.name || 'N/A'}
                      </p>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        {selectedContract?.staff?.email || user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Dates */}
                <div>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4'>
                    Time Period
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700'>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Start Date
                      </p>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>
                        {selectedContract?.startTime
                          ? new Date(selectedContract.startTime).toLocaleString(
                              'vi-VN'
                            )
                          : 'N/A'}
                      </p>
                    </div>
                    <div className='p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700'>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        End Date
                      </p>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>
                        {selectedContract?.endTime
                          ? new Date(selectedContract.endTime).toLocaleString(
                              'vi-VN'
                            )
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-3 mt-6'>
                <Button
                  onClick={() => setShowDetailModal(false)}
                  variant='outline'
                  className='flex-1 border-slate-300 dark:border-slate-600'
                >
                  Close
                </Button>
                {selectedContract?.contractStatus === 'NO_CONTRACT' && (
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleUploadClick(selectedContract);
                    }}
                    className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                  >
                    <Upload className='w-4 h-4 mr-2' />
                    Upload Contract
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Kết thúc Detail Modal */}
    </div>
  );
}
