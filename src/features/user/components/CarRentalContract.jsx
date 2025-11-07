'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Checkbox } from '../../shared/components/ui/checkbox';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Check,
} from 'lucide-react';
import { endpoints } from '../../shared/lib/endpoints';
import { toast as notify } from '../../shared/lib/toast';
import { apiClient } from '../../shared/lib/apiClient';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';

export default function CarRentalContract({ bookingId, onStatusChange }) {
  const { user } = useAuth(); // ← Di chuyển lên đầu

  // Inspection state - Lưu MẢNG inspections thay vì 1 cái
  const [inspections, setInspections] = useState([]);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [inspectionError, setInspectionError] = useState(null);

  // Fetch ALL CHECK_IN inspections by bookingId
  const fetchInspection = useCallback(async bookingId => {
    if (!bookingId) return;
    setLoadingInspection(true);
    setInspectionError(null);
    try {
      console.log('🔍 Fetching inspections for bookingId:', bookingId);
      // Sử dụng API dành cho RENTER
      const res = await apiClient.get(
        endpoints.inspections.getByBookingRenter(bookingId)
      );
      const json = res?.data;
      console.log('📋 Full API response:', res);
      console.log('📋 Response data (json):', json);
      console.log('📋 json type:', typeof json);
      console.log('📋 json keys:', json ? Object.keys(json) : 'null');
      console.log('📋 json.success:', json?.success);
      console.log('📋 json.data:', json?.data);
      console.log('📋 json.data type:', typeof json?.data);
      console.log('📋 json.data.inspections:', json?.data?.inspections);
      console.log('📋 json stringified:', JSON.stringify(json, null, 2));

      let allInspections = [];
      // Handle multiple response structures from backend

      console.log('🔍 Checking response structure...');
      console.log('🔍 Has success property?', 'success' in (json || {}));
      console.log('🔍 Has data property?', 'data' in (json || {}));
      console.log(
        '🔍 Has inspections property?',
        'inspections' in (json || {})
      );
      console.log(
        '🔍 json.inspections type:',
        Array.isArray(json?.inspections) ? 'array' : typeof json?.inspections
      );

      // Priority 1: Direct { inspections: [...] } structure (ACTUAL BACKEND RESPONSE)
      if (json && 'inspections' in json && Array.isArray(json.inspections)) {
        console.log(
          '✅ Branch 1: Direct inspections array in json.inspections'
        );
        allInspections = json.inspections;
      }
      // Priority 2: Standard backend response { success: true, data: { inspections: [...] } }
      else if (json?.success === true && json?.data?.inspections) {
        console.log(
          '✅ Branch 2: Standard response with success and data.inspections'
        );
        allInspections = Array.isArray(json.data.inspections)
          ? json.data.inspections
          : [json.data.inspections];
      }
      // Priority 3: Response has 'success' and 'data' properties at top level
      else if (
        json &&
        typeof json === 'object' &&
        'success' in json &&
        'data' in json
      ) {
        console.log('✅ Branch 3: Has success and data properties');
        if (json.data?.inspections) {
          allInspections = Array.isArray(json.data.inspections)
            ? json.data.inspections
            : [json.data.inspections];
        } else if (Array.isArray(json.data)) {
          allInspections = json.data;
        } else if (json.data && typeof json.data === 'object') {
          allInspections = [json.data];
        }
      }
      // Priority 4: Direct inspection object (has id and bookingId)
      else if (json && typeof json === 'object' && json.id && json.bookingId) {
        console.log(
          '✅ Branch 4: Direct inspection object with id and bookingId'
        );
        allInspections = [json];
      }
      // Priority 5: Array of inspections
      else if (Array.isArray(json)) {
        console.log('✅ Branch 5: Direct array of inspections');
        allInspections = json;
      }
      // Fallback
      else {
        console.log('❌ No matching structure found!');
        console.log('❌ json type:', typeof json);
        console.log(
          '❌ json keys:',
          json ? Object.keys(json).join(', ') : 'none'
        );
      }

      console.log('📊 All inspections extracted:', allInspections);
      console.log('📊 All inspections length:', allInspections.length);
      console.log(
        '📊 All inspections content:',
        JSON.stringify(allInspections, null, 2)
      );

      // 🔥 LỌC CHỈ LẤY INSPECTION TYPE = CHECK_IN
      const checkInInspections = allInspections.filter(ins => {
        console.log(
          '🔍 Filtering inspection:',
          ins?.id,
          'type:',
          ins?.inspectionType
        );
        return ins && ins.inspectionType === 'CHECK_IN';
      });

      console.log('✅ Total inspections:', allInspections.length);
      console.log('✅ CHECK_IN inspections found:', checkInInspections.length);
      console.log('✅ CHECK_IN inspections data:', checkInInspections);
      setInspections(checkInInspections);
    } catch (err) {
      console.error('❌ Fetch inspection error:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setInspectionError('Unable to load inspection records.');
      setInspections([]);
    } finally {
      setLoadingInspection(false);
    }
  }, []); // Không cần user vào dependency vì chỉ dùng API RENTER

  // local helper to emulate previous useToast({title,description,variant})
  const showToast = ({ title = '', description = '', variant = '' } = {}) => {
    const message =
      title && description
        ? `${title} — ${description}`
        : title || description || '';
    if (variant === 'destructive') {
      notify.error(message || 'Error', { autoClose: 5000 });
    } else {
      notify.success(message || 'Success', { autoClose: 4000 });
    }
  };

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    renterName: '',
    witnessName: '',
    notes: '',
  });

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    conditionsAccepted: false,
    damageResponsibility: false,
    dataPrivacy: false,
  });

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await res.json();
        setAuthUser(result.data?.user);
      } catch (err) {
        console.error('Failed to fetch auth user:', err);
      }
    };

    fetchAuthUser();
  }, []);

  // Fetch contracts for a specific booking
  const fetchContracts = useCallback(async bookingId => {
    if (!bookingId) return;

    setLoadingContracts(true);
    setError(null);
    try {
      const res = await apiClient.get(
        endpoints.contracts.getByBooking(bookingId)
      );
      const json = res?.data;

      // Handle multiple response structures
      if (json.success && Array.isArray(json.data)) {
        setContracts(json.data);
      } else if (json.success && json.data && typeof json.data === 'object') {
        if (Array.isArray(json.data.contracts)) {
          setContracts(json.data.contracts);
        } else {
          setContracts([json.data]);
        }
      } else if (Array.isArray(json)) {
        setContracts(json);
      } else {
        console.log('Unexpected contract data format:', json);
        setContracts([]);
      }
    } catch (err) {
      console.error('fetchContracts error:', err);
      setError('Unable to load contracts. Please try again later.');
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  // Fetch booking details if bookingId is provided
  const fetchBookingDetails = useCallback(
    async id => {
      if (!id) return;

      setLoadingBookings(true);
      setError(null);
      try {
        const res = await apiClient.get(`/api/bookings/${id}`);
        const json = res?.data;
        const booking =
          json?.data?.booking ?? json?.booking ?? json?.data ?? json;
        setSelectedBooking(booking);

        // Fetch contracts after getting booking
        await fetchContracts(id);
        // Fetch inspection after getting booking
        await fetchInspection(id);
      } catch (err) {
        console.error('fetchBookingDetails:', err);
        setError('Unable to load booking information. Please try again later.');
      } finally {
        setLoadingBookings(false);
      }
    },
    [fetchContracts, fetchInspection]
  );

  // Fetch bookings for current user
  const fetchBookings = useCallback(async () => {
    console.log('fetchBookings called');

    if (bookingId) {
      console.log(
        'bookingId provided, fetching booking details for:',
        bookingId
      );
      fetchBookingDetails(bookingId);
      return;
    }

    if (!user?.id) {
      console.warn('User not logged in. Cannot fetch bookings.');
      setError('Please log in to view bookings');
      setBookings([]);
      return;
    }

    console.log('Fetching bookings for user ID:', user.id);
    setLoadingBookings(true);
    setError(null);

    try {
      const res = await apiClient.get(
        endpoints.bookings.getUserBookings(user.id)
      );
      console.log('API response:', res);
      const json = res?.data;
      console.log('Parsed JSON data:', json);

      // Backend trả về { bookings: [...] } hoặc trực tiếp array
      const list = json?.bookings ?? json?.data?.bookings ?? json?.data ?? json;
      console.log('Extracted bookings list:', list);

      // Lọc chỉ lấy bookings IN_PROGRESS
      const inProgressBookings = (Array.isArray(list) ? list : []).filter(
        b => (b.status || b.bookingStatus) === 'IN_PROGRESS'
      );
      console.log('Filtered in-progress bookings:', inProgressBookings);

      setBookings(inProgressBookings);
    } catch (err) {
      console.error('fetchBookings error:', err);
      setError('Không thể tải danh sách booking. Vui lòng thử lại sau.');
      setBookings([]);
    } finally {
      console.log('fetchBookings completed');
      setLoadingBookings(false);
    }
  }, [bookingId, fetchBookingDetails, user?.id]);

  useEffect(() => {
    console.log('useEffect triggered: calling fetchBookings');
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingSelect = booking => {
    // Toggle: Click lần 2 vào cùng booking → Deselect & Hide info
    if (selectedBooking?.id === booking.id) {
      setSelectedBooking(null);
      setInspections([]);
      setContracts([]);
      return;
    }

    // Select new booking
    setSelectedBooking(booking);
    fetchBookingDetails(booking.id);
    fetchContracts(booking.id);
  };

  const handleAgreementChange = (field, value) => {
    setAgreements(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!validTypes.includes(file.type)) {
        showToast({
          title: 'Error',
          description: 'File must be JPEG, PNG, or PDF',
          variant: 'destructive',
        });
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          title: 'Error',
          description: 'File size must not exceed 10MB',
          variant: 'destructive',
        });
        e.target.value = ''; // Reset input
        return;
      }

      setSelectedFile(file);
    }
  };

  const allAgreementsAccepted = Object.values(agreements).every(
    v => v === true
  );

  // Validate form data
  const validateFormData = data => {
    // Validation for upload (renterName & witnessName required)
    if (
      !data.renterName ||
      data.renterName.trim().length < 2 ||
      data.renterName.length > 100
    ) {
      throw new Error('Renter name must be 2–100 characters');
    }
    if (
      !data.witnessName ||
      data.witnessName.trim().length < 2 ||
      data.witnessName.length > 100
    ) {
      throw new Error('Witness name must be 2–100 characters');
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error('Notes must not exceed 500 characters');
    }
  };

  // Upload signed contract
  const handleUploadContract = async contractId => {
    if (!selectedFile) {
      showToast({
        title: 'Error',
        description: 'Please select the signed contract file',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      validateFormData(formData);

      const formDataObj = new FormData();
      formDataObj.append('file', selectedFile);
      formDataObj.append('renterName', formData.renterName);
      formDataObj.append('witnessName', formData.witnessName);
      if (formData.notes) formDataObj.append('notes', formData.notes);

      const res = await apiClient.post(
        endpoints.contracts.uploadSignedFile(contractId),
        formDataObj,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const successData = res?.data;
      if (!successData)
        throw new Error('Failed to upload contract (no response)');

      showToast({
        title: 'Success',
        description: 'Signed contract uploaded successfully',
      });

      // Reset form
      setSelectedFile(null);
      setFormData({
        renterName: '',
        witnessName: '',
        notes: '',
      });

      // Refresh contracts list
      await fetchContracts(selectedBooking.id);

      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error('Upload contract error:', err);
      showToast({
        title: 'Error',
        description:
          err.message || 'Unable to upload contract. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setActionLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!allAgreementsAccepted) {
      showToast({
        title: 'Error',
        description: 'Please agree to all terms',
        variant: 'destructive',
      });
      return;
    }

    // Implementation for final contract submission
    showToast({
      title: 'Success',
      description: 'Contract has been signed successfully',
    });
  };

  return (
    <div className='space-y-8'>
      {/* Booking Selection Section */}
      {!bookingId && (
        <Card className='border-slate-200 shadow-sm'>
          <CardHeader className='bg-white border-b border-slate-200'>
            <CardTitle className='text-slate-900'>Select Booking</CardTitle>
            <CardDescription>Choose your car rental booking</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-3'>
              {loadingBookings && (
                <div className='text-sm text-slate-500'>
                  Loading bookings...
                </div>
              )}
              {error && <div className='text-sm text-red-600'>{error}</div>}
              {bookings && bookings.length === 0 && (
                <div className='text-center py-8'>
                  <p className='text-slate-500'>
                    No bookings require contract creation
                  </p>
                </div>
              )}
              {bookings &&
                bookings.length > 0 &&
                bookings.map((booking, index) => (
                  <Card
                    key={booking.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      selectedBooking?.id === booking.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    onClick={() => handleBookingSelect(booking)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-semibold text-slate-900'>
                            {booking.bookingCode || `Record #${index + 1}`}
                          </h3>
                          <span className='text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                            {booking.status}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 gap-4 text-sm text-slate-600'>
                          <div>
                            <p className='text-slate-500'>Customer</p>
                            <p className='font-medium text-slate-900'>
                              {authUser?.name || booking.staff?.name}
                            </p>
                          </div>
                          <div>
                            <p className='text-slate-500'>Assigned Staff</p>
                            <p className='font-medium text-slate-900'>
                              {booking.staff?.name}
                            </p>
                          </div>
                          <div>
                            <p className='text-slate-500'>Location</p>
                            <p className='font-medium text-slate-900'>
                              {booking.station?.name}
                            </p>
                          </div>
                          <div>
                            <p className='text-slate-500'>Vehicle</p>
                            <p className='font-medium text-slate-900'>
                              {booking.vehicle?.brand} {booking.vehicle?.model}
                            </p>
                          </div>
                          <div>
                            <p className='text-slate-500'>Rental date</p>
                            <p className='font-medium text-slate-900'>
                              {new Date(
                                booking.createdAt || booking.rentalDate
                              ).toLocaleDateString('en-US')}
                            </p>
                          </div>
                          <div>
                            <p className='text-slate-500'>Price</p>
                            <p className='font-medium text-slate-900'>
                              {booking.totalAmount?.toLocaleString('en-US') ||
                                booking.price}{' '}
                              VND
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedBooking?.id === booking.id && (
                        <div className='ml-4 flex-shrink-0'>
                          <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-600'>
                            <Check className='w-4 h-4 text-white' />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Card Section - Hiển thị TẤT CẢ CHECK_IN inspections */}
      {selectedBooking && (
        <Card className='border-slate-200 shadow-sm'>
          <CardHeader className='bg-white border-b border-slate-200'>
            <CardTitle className='flex items-center gap-2 text-slate-900'>
              <FileText className='w-5 h-5' />
              Vehicle Inspection Report (Vehicle Receipt)
            </CardTitle>
            <CardDescription>
              List of check-in inspection reports for this booking
              {inspections.length > 0 && (
                <span className='ml-2 text-blue-600 font-medium'>
                  ({inspections.length} reports)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            {loadingInspection && (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <span className='ml-3 text-sm text-slate-500'>
                  Loading inspection reports...
                </span>
              </div>
            )}
            {inspectionError && (
              <div className='flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                <p className='text-sm text-red-600'>{inspectionError}</p>
              </div>
            )}
            {!loadingInspection &&
              inspections.length === 0 &&
              !inspectionError && (
                <div className='text-center py-8 border-2 border-dashed border-slate-200 rounded-lg'>
                  <FileText className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                  <p className='text-slate-500'>
                    No CHECK_IN inspection reports for this booking
                  </p>
                  <p className='text-xs text-slate-400 mt-1'>
                    Reports will be created when you check in the vehicle
                  </p>
                </div>
              )}

            {/* Render TẤT CẢ inspections */}
            {inspections.length > 0 && (
              <div className='space-y-6'>
                {inspections.map((inspection, index) => (
                  <div
                    key={inspection.id || index}
                    className='border border-slate-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow'
                  >
                    {/* Header với trạng thái */}
                    <div className='flex items-center justify-between pb-4 border-b mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                          🚗 Check-in #{index + 1}
                        </div>
                        {inspection.isCompleted && (
                          <div className='flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium'>
                            <CheckCircle2 className='w-3 h-3' />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thông tin chính - Grid 3 cột */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                      {/* Số km */}
                      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
                        <p className='text-xs text-slate-500 mb-1'>Mileage</p>
                        <p className='text-2xl font-bold text-slate-900'>
                          {inspection.mileage ?? 'N/A'}
                          {inspection.mileage && (
                            <span className='text-sm font-normal text-slate-500 ml-1'>
                              km
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Mức pin */}
                      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
                        <p className='text-xs text-slate-500 mb-1'>
                          Battery Level
                        </p>
                        <div className='flex items-center gap-2'>
                          <p className='text-2xl font-bold text-slate-900'>
                            {inspection.batteryLevel ?? 'N/A'}
                            {inspection.batteryLevel != null && (
                              <span className='text-sm font-normal text-slate-500'>
                                %
                              </span>
                            )}
                          </p>
                          {inspection.batteryLevel != null && (
                            <div className='flex-1 h-2 bg-slate-200 rounded-full overflow-hidden'>
                              <div
                                className={`h-full transition-all ${
                                  inspection.batteryLevel >= 80
                                    ? 'bg-green-500'
                                    : inspection.batteryLevel >= 50
                                    ? 'bg-yellow-500'
                                    : inspection.batteryLevel >= 20
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${inspection.batteryLevel}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nhân viên */}
                      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
                        <p className='text-xs text-slate-500 mb-1'>
                          Inspecting staff
                        </p>
                        <p className='text-lg font-semibold text-slate-900'>
                          {inspection.staffName ||
                            inspection.staff?.name ||
                            'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Tình trạng xe */}
                    <div className='bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4'>
                      <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                        <CheckCircle2 className='w-4 h-4 text-blue-600' />
                        Vehicle condition
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        {/* Ngoại thất */}
                        <div>
                          <p className='text-xs text-slate-600 mb-1'>
                            Exterior
                          </p>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              inspection.exteriorCondition === 'GOOD'
                                ? 'bg-green-100 text-green-700'
                                : inspection.exteriorCondition === 'FAIR'
                                ? 'bg-yellow-100 text-yellow-700'
                                : inspection.exteriorCondition === 'POOR'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inspection.exteriorCondition === 'GOOD' &&
                              '✓ Good'}
                            {inspection.exteriorCondition === 'FAIR' &&
                              '~ Fair'}
                            {inspection.exteriorCondition === 'POOR' &&
                              '✗ Poor'}
                            {!inspection.exteriorCondition && 'N/A'}
                          </div>
                        </div>

                        {/* Nội thất */}
                        <div>
                          <p className='text-xs text-slate-600 mb-1'>
                            Interior
                          </p>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              inspection.interiorCondition === 'GOOD'
                                ? 'bg-green-100 text-green-700'
                                : inspection.interiorCondition === 'FAIR'
                                ? 'bg-yellow-100 text-yellow-700'
                                : inspection.interiorCondition === 'POOR'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inspection.interiorCondition === 'GOOD' &&
                              '✓ Good'}
                            {inspection.interiorCondition === 'FAIR' &&
                              '~ Fair'}
                            {inspection.interiorCondition === 'POOR' &&
                              '✗ Poor'}
                            {!inspection.interiorCondition && 'N/A'}
                          </div>
                        </div>

                        {/* Lốp xe */}
                        <div>
                          <p className='text-xs text-slate-600 mb-1'>
                            Tire condition
                          </p>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              inspection.tireCondition === 'GOOD'
                                ? 'bg-green-100 text-green-700'
                                : inspection.tireCondition === 'FAIR'
                                ? 'bg-yellow-100 text-yellow-700'
                                : inspection.tireCondition === 'POOR'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inspection.tireCondition === 'GOOD' && '✓ Good'}
                            {inspection.tireCondition === 'FAIR' && '~ Fair'}
                            {inspection.tireCondition === 'POOR' && '✗ Poor'}
                            {!inspection.tireCondition && 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Damage notes (if any) */}
                    {inspection.damageNotes && (
                      <div className='bg-red-50 p-4 rounded-lg border border-red-200 mb-4'>
                        <h4 className='font-semibold text-red-900 mb-2 flex items-center gap-2'>
                          <AlertCircle className='w-4 h-4' />
                          Damage notes
                        </h4>
                        <p className='text-sm text-red-800'>
                          {inspection.damageNotes}
                        </p>
                      </div>
                    )}

                    {/* Other notes */}
                    {inspection.notes && (
                      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4'>
                        <h4 className='font-semibold text-slate-900 mb-2'>
                          Notes
                        </h4>
                        <p className='text-sm text-slate-700'>
                          {inspection.notes}
                        </p>
                      </div>
                    )}

                    {/* Accessories */}
                    {Array.isArray(inspection.accessories) &&
                      inspection.accessories.length > 0 && (
                        <div className='bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4'>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            Accessories
                          </h4>
                          <div className='flex flex-wrap gap-2'>
                            {inspection.accessories.map((accessory, idx) => (
                              <span
                                key={idx}
                                className='px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-700'
                              >
                                {accessory}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Inspection images */}
                    {inspection.images && inspection.images.length > 0 && (
                      <div className='mb-4'>
                        <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                          📷 Inspection images ({inspection.images.length})
                        </h4>
                        {/* Warning message */}
                        <div className='mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                          <p className='text-xs text-amber-800'>
                            ⚠️ <strong>Note:</strong> If images appear
                            dark/black, please <strong>click the image</strong>{' '}
                            to open in a new tab or contact staff to update
                            clearer images.
                          </p>
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                          {inspection.images.map((img, idx) => {
                            // Extract image URL - prioritize thumbnailUrl for preview
                            const thumbnailUrl =
                              img?.thumbnailUrl ||
                              img?.url ||
                              img?.imageUrl ||
                              (typeof img === 'string' ? img : '');
                            const fullUrl =
                              img?.url ||
                              img?.imageUrl ||
                              img?.thumbnailUrl ||
                              (typeof img === 'string' ? img : '');

                            console.log(`🖼️ Image ${idx}:`, {
                              thumbnailUrl,
                              fullUrl,
                              img,
                            });

                            // Add white background transformation for ImageKit
                            let previewUrl = thumbnailUrl;
                            if (thumbnailUrl.includes('imagekit.io')) {
                              // Add transformation: resize + white background
                              previewUrl = `${thumbnailUrl}?tr=w-400,h-300,bg-FFFFFF`;
                            }

                            return (
                              <div
                                key={idx}
                                className='relative group bg-white rounded-lg overflow-hidden border border-slate-200'
                              >
                                <img
                                  src={previewUrl}
                                  alt={`Ảnh kiểm tra ${idx + 1}`}
                                  className='w-full h-32 object-contain cursor-pointer hover:shadow-lg transition-shadow'
                                  style={{
                                    minHeight: '128px',
                                    maxHeight: '128px',
                                    backgroundColor: '#ffffff',
                                  }}
                                  onClick={() => {
                                    if (fullUrl) {
                                      window.open(fullUrl, '_blank');
                                    }
                                  }}
                                  onLoad={e => {
                                    console.log(
                                      '✅ Image loaded successfully:',
                                      previewUrl
                                    );
                                    console.log(
                                      '   - Natural width:',
                                      e.target.naturalWidth
                                    );
                                    console.log(
                                      '   - Natural height:',
                                      e.target.naturalHeight
                                    );

                                    // Check if image is actually black/empty
                                    if (
                                      e.target.naturalWidth === 0 ||
                                      e.target.naturalHeight === 0
                                    ) {
                                      console.error(
                                        '❌ Image loaded but has 0 dimensions!'
                                      );
                                    }
                                  }}
                                  onError={e => {
                                    console.error(
                                      '❌ Image load error:',
                                      previewUrl
                                    );
                                    console.error('   - Error event:', e);
                                    // Show error placeholder
                                    e.target.style.display = 'none';
                                    const errorDiv =
                                      document.createElement('div');
                                    errorDiv.className =
                                      'w-full h-32 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg cursor-pointer';
                                    errorDiv.onclick = () =>
                                      window.open(fullUrl, '_blank');
                                    errorDiv.innerHTML = `
                                      <div class="text-center p-2">
                                        <p class="text-red-600 text-xs font-medium">⚠️ Failed to load image</p>
                                        <p class="text-blue-500 text-xs mt-1">Click to view in a new tab</p>
                                      </div>
                                    `;
                                    e.target.parentElement.appendChild(
                                      errorDiv
                                    );
                                  }}
                                />
                                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none'>
                                  <span className='text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none'>
                                    🔍 Xem lớn
                                  </span>
                                </div>
                                {/* Debug badge */}
                                <div className='absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-[10px] px-1 rounded'>
                                  #{idx + 1}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Additional information */}
                    <div className='pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500'>
                      <div>
                        <span className='font-medium'>Created at:</span>{' '}
                        {inspection.createdAt
                          ? new Date(inspection.createdAt).toLocaleString(
                              'en-US'
                            )
                          : 'N/A'}
                      </div>
                      <div>
                        <span className='font-medium'>Last updated:</span>{' '}
                        {inspection.updatedAt
                          ? new Date(inspection.updatedAt).toLocaleString(
                              'en-US'
                            )
                          : 'N/A'}
                      </div>
                      <div>
                        <span className='font-medium'>
                          Document verification:
                        </span>{' '}
                        <span
                          className={
                            inspection.documentVerified
                              ? 'text-green-600'
                              : 'text-amber-600'
                          }
                        >
                          {inspection.documentVerified
                            ? '✓ Verified'
                            : '⏳ Not verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contract List Section */}
      {selectedBooking && (
        <Card className='border-slate-200 shadow-sm'>
          <CardHeader className='bg-white border-b border-slate-200'>
            <CardTitle className='text-slate-900'>Contracts</CardTitle>
            <CardDescription>
              List of contracts for this booking
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            {loadingContracts && (
              <div className='text-sm text-slate-500'>Loading contracts...</div>
            )}
            {error && <div className='text-sm text-red-600'>{error}</div>}

            {!loadingContracts && contracts.length === 0 && (
              <div className='text-center py-8 border-2 border-dashed border-slate-200 rounded-lg'>
                <FileText className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                <p className='text-slate-500'>No contracts for this booking</p>
                <p className='text-sm text-slate-400 mt-1'>
                  Contracts will be created by staff
                </p>
              </div>
            )}

            {contracts.length > 0 && (
              <div className='space-y-4'>
                {contracts.map(contract => (
                  <Card key={contract.id} className='p-4 border-slate-200'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-semibold text-slate-900'>
                            {contract.contractNumber}
                          </h3>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              contract.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {contract.status === 'COMPLETED'
                              ? 'Completed'
                              : 'Awaiting signature'}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 gap-4 text-sm text-slate-600'>
                          <div>
                            <p className='text-slate-500'>Created on</p>
                            <p className='font-medium text-slate-900'>
                              {new Date(contract.createdAt).toLocaleDateString(
                                'en-US'
                              )}
                            </p>
                          </div>
                          {contract.renterName && (
                            <div>
                              <p className='text-slate-500'>Renter</p>
                              <p className='font-medium text-slate-900'>
                                {contract.renterName}
                              </p>
                            </div>
                          )}
                          {contract.status === 'COMPLETED' &&
                            contract.signedAt && (
                              <>
                                <div>
                                  <p className='text-slate-500'>Signed on</p>
                                  <p className='font-medium text-slate-900'>
                                    {new Date(
                                      contract.signedAt
                                    ).toLocaleDateString('en-US')}
                                  </p>
                                </div>
                                {contract.witnessName && (
                                  <div>
                                    <p className='text-slate-500'>Witness</p>
                                    <p className='font-medium text-slate-900'>
                                      {contract.witnessName}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                        </div>
                        {contract.notes && (
                          <div className='mt-2 text-sm'>
                            <p className='text-slate-500'>Notes:</p>
                            <p className='text-slate-700'>{contract.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-2 ml-4'>
                        {contract.status === 'CREATED' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              const element = document.getElementById(
                                `upload-form-${contract.id}`
                              );
                              if (element)
                                element.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <Upload className='w-4 h-4 mr-2' />
                            Upload
                          </Button>
                        )}
                        {contract.status === 'COMPLETED' &&
                          contract.signedFileUrl && (
                            <a
                              href={contract.signedFileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50'
                            >
                              <FileText className='w-4 h-4 mr-2' />
                              View contract
                            </a>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Contract Form */}
      {selectedBooking &&
        contracts.filter(c => c.status === 'CREATED').length > 0 && (
          <Card className='border-slate-200 shadow-sm'>
            <CardHeader className='bg-white border-b border-slate-200'>
              <CardTitle className='text-slate-900'>
                Upload Signed Contract
              </CardTitle>
              <CardDescription>
                Please fill in the information and upload the signed contract
                file
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              {contracts
                .filter(c => c.status === 'CREATED')
                .map(contract => (
                  <div
                    key={contract.id}
                    id={`upload-form-${contract.id}`}
                    className='space-y-4 mb-8 pb-8 border-b last:border-b-0'
                  >
                    <h3 className='font-semibold text-lg mb-4'>
                      Contract: {contract.contractNumber}
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor={`renterName-${contract.id}`}>
                          Renter name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id={`renterName-${contract.id}`}
                          name='renterName'
                          value={formData.renterName}
                          onChange={handleInputChange}
                          placeholder='John Doe (2–100 characters)'
                          required
                          minLength={2}
                          maxLength={100}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor={`witnessName-${contract.id}`}>
                          Witness name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id={`witnessName-${contract.id}`}
                          name='witnessName'
                          value={formData.witnessName}
                          onChange={handleInputChange}
                          placeholder='Jane Smith (2–100 characters)'
                          required
                          minLength={2}
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`notes-${contract.id}`}>Notes</Label>
                      <Textarea
                        id={`notes-${contract.id}`}
                        name='notes'
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder='Add notes about the contract (max 500 characters)'
                        rows={3}
                        maxLength={500}
                      />
                      <p className='text-xs text-slate-500'>
                        {formData.notes.length}/500 characters
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`file-${contract.id}`}>
                        Signed contract file{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <div className='flex items-center gap-4'>
                        <Input
                          id={`file-${contract.id}`}
                          type='file'
                          onChange={handleFileChange}
                          accept='.pdf,.jpg,.jpeg,.png'
                          required
                        />
                        <Button
                          onClick={() => handleUploadContract(contract.id)}
                          disabled={actionLoading || !selectedFile}
                        >
                          {actionLoading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                      <p className='text-xs text-slate-500'>
                        Accepts PDF, JPG, JPEG, PNG (max 10MB)
                      </p>
                      {selectedFile && (
                        <p className='text-xs text-green-600'>
                          Selected: {selectedFile.name} (
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

      {/* Review-Only Section - Không có action buttons */}
      {selectedBooking && contracts.some(c => c.status === 'COMPLETED') && (
        <Card className='border-slate-200 shadow-sm'>
          <CardHeader className='bg-white border-b border-slate-200'>
            <CardTitle className='text-slate-900'>
              Contract Terms (Read Only)
            </CardTitle>
            <CardDescription>
              Information on the terms and conditions of the rental contract
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-6'>
              {/* Contract Terms - Read Only */}
              <Card className='border-slate-200'>
                <CardHeader className='bg-slate-50 border-b border-slate-200'>
                  <CardTitle className='text-slate-900'>
                    Contract Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-4 text-sm text-slate-700 max-h-96 overflow-y-auto'>
                    <div>
                      <h4 className='font-semibold text-slate-900 mb-2'>
                        1. Rental Period
                      </h4>
                      <p>
                        The rental period starts at check-in at the station and
                        ends at return at the station. Any usage beyond the
                        rental period will be charged according to the stated
                        rates.
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 mb-2'>
                        2. Vehicle Care Responsibility
                      </h4>
                      <p>
                        The renter is responsible for caring for the vehicle
                        throughout the rental period. Any damage, loss, or harm
                        occurring during the rental is the renter’s
                        responsibility.
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 mb-2'>
                        3. Usage Conditions
                      </h4>
                      <p>
                        The vehicle is for personal use only. Sub-renting,
                        commercial use, or illegal activities are prohibited.
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 mb-2'>
                        4. Insurance & Protection
                      </h4>
                      <p>
                        The vehicle has basic insurance. The renter may purchase
                        additional insurance for extra protection. Any insurance
                        claims must be reported within 24 hours.
                      </p>
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 mb-2'>
                        5. Fees & Payment
                      </h4>
                      <p>
                        Rental fees must be paid in full before check-in.
                        Additional charges (overtime, damage, etc.) will be
                        calculated and settled upon return.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Damage Responsibility - Read Only */}
              <Card className='border-slate-200'>
                <CardHeader className='bg-slate-50 border-b border-slate-200'>
                  <CardTitle className='text-slate-900'>
                    Damage Responsibility
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-3 text-sm text-slate-700'>
                    <p>
                      <span className='font-semibold text-slate-900'>
                        The renter confirms that:
                      </span>
                    </p>
                    <ul className='list-disc list-inside space-y-2 ml-2'>
                      <li>
                        Has carefully checked the vehicle condition before
                        check-in
                      </li>
                      <li>Has recorded all existing damages with photos</li>
                      <li>
                        Will be responsible for any new damages occurring during
                        the rental
                      </li>
                      <li>Will promptly report any accidents or incidents</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Data Privacy - Read Only */}
              <Card className='border-slate-200'>
                <CardHeader className='bg-slate-50 border-b border-slate-200'>
                  <CardTitle className='text-slate-900'>
                    Personal Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-3 text-sm text-slate-700'>
                    <p>
                      Your personal data is processed in accordance with our
                      data protection policy. We are committed to safeguarding
                      your information and only using it for purposes related to
                      the rental contract.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Conditions - Read Only */}
              <Card className='border-slate-200'>
                <CardHeader className='bg-slate-50 border-b border-slate-200'>
                  <CardTitle className='text-slate-900'>
                    Additional Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-3 text-sm text-slate-700'>
                    <p>
                      <span className='font-semibold text-slate-900'>
                        Additional conditions:
                      </span>
                    </p>
                    <ul className='list-disc list-inside space-y-2 ml-2'>
                      <li>
                        The vehicle must be returned at the specified time and
                        location
                      </li>
                      <li>The vehicle must be returned in a clean condition</li>
                      <li>The battery must be fully charged before return</li>
                      <li>All additional fees must be settled before return</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Info Notice */}
              <div className='flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <AlertCircle className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div className='text-sm text-blue-800'>
                  <p className='font-semibold mb-1'>Important note:</p>
                  <p>
                    By signing this contract, you confirm that you have read,
                    understood, and agree to all terms and conditions. This
                    contract is legally binding and you bear legal
                    responsibility for any violations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
