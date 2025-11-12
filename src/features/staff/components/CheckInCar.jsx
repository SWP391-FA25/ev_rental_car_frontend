import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useBooking } from '../../booking/hooks/useBooking';
import { useStaffBooking } from '../hooks/useStaffBooking';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
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
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import { Textarea } from '../../shared/components/ui/textarea';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';
import { formatCurrency } from '../../shared/lib/utils';
import { CreateContractModal } from './CreateContractModal';
// import { useStaffBooking } from '../hooks/useStaffBooking';
import {
  Search,
  X,
  Check,
  Calendar,
  User,
  Car,
  ChevronsUp,
} from 'lucide-react';

export default function CheckInCar() {
  const { t } = useTranslation();
  const { getAllBookings, getBookingById } = useBooking();
  const { stations } = useStaffBooking();
  const { user } = useAuth();

  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedStation, setSelectedStation] = useState('');

  // 🔍 Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const inspectionType = 'CHECK_IN';
  const [exteriorCondition, setExteriorCondition] = useState('GOOD');
  const [interiorCondition, setInteriorCondition] = useState('GOOD');
  const [tireCondition, setTireCondition] = useState('GOOD');
  const [accessories, setAccessories] = useState('ALL_PRESENT');

  const [batteryLevel, setBatteryLevel] = useState('');
  const [mileage, setMileage] = useState('');
  const [damageNotes, setDamageNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [documentVerified, setDocumentVerified] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    batteryLevel: '',
    mileage: '',
    damageNotes: '',
    notes: '',
  });

  const [inspectionFiles, setInspectionFiles] = useState([]);
  const [inspectionPreviews, setInspectionPreviews] = useState([]);

  const [checkInSummaryOpen, setCheckInSummaryOpen] = useState(false);
  const [checkInSummary, setCheckInSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState(null);
  const [customerDocumentsList, setCustomerDocumentsList] = useState([]);
  const [needsDocumentUpload, setNeedsDocumentUpload] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('ID_CARD');
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // ✨ Inspection management states
  const [bookingHasInspection, setBookingHasInspection] = useState(false);
  const [existingInspection, setExistingInspection] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loadingInspection, setLoadingInspection] = useState(false);

  // ✨ Contract management states
  const [bookingHasContract, setBookingHasContract] = useState(false);
  const [existingContract, setExistingContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false); // Modal state

  // ✨ Staff assignment state (now supports multiple stations)
  const [staffAssignment, setStaffAssignment] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  // Fetch staff assignments (can be multiple stations)
  useEffect(() => {
    const fetchStaffAssignment = async () => {
      if (!user?.id) return;

      try {
        setLoadingAssignment(true);
        // ✅ Get ALL assignments for staff (many-to-many relationship)
        const response = await apiClient.get(
          endpoints.assignments.getByStaffId(user.id)
        );

        console.log('📋 API Response:', response);

        // Backend returns { success: true, assignments: [...] }
        const assignments =
          response.data?.assignments || response.assignments || [];

        console.log('📋 Assignments array:', assignments);
        console.log('📋 Total assignments:', assignments.length);

        if (assignments && assignments.length > 0) {
          // ✅ Store ALL assignments (not just first one)
          setStaffAssignment({
            assignments, // Array of all assignments
            stations: assignments.map(a => a.station).filter(Boolean), // Array of stations
          });

          const stationNames = assignments
            .map(a => a.station?.name)
            .filter(Boolean)
            .join(', ');

          console.log('✅ Staff assigned to stations:', stationNames);
          console.log('✅ Total assignments:', assignments.length);
        } else {
          console.warn('⚠️ Staff not assigned to any station (empty array)');
          toast.error(
            'You are not assigned to any station. Please contact admin.'
          );
          setStaffAssignment(null);
        }
      } catch (error) {
        console.error('❌ Error fetching staff assignment:', error);
        console.error('❌ Error response:', error.response?.data);

        // If 404, staff has no assignment
        if (error.response?.status === 404) {
          toast.error(
            'You are not assigned to any station. Please contact admin.'
          );
        } else {
          toast.error(
            'Failed to load station assignment: ' +
              (error.message || 'Unknown error')
          );
        }
        setStaffAssignment(null);
      } finally {
        setLoadingAssignment(false);
      }
    };

    fetchStaffAssignment();
  }, [user]);

  useEffect(() => {
    const fetchEligibleBookings = async () => {
      if (
        !staffAssignment?.assignments ||
        staffAssignment.assignments.length === 0
      ) {
        console.log('Waiting for staff assignments...');
        return;
      }

      try {
        setLoadingBookings(true);
        const resData = await getAllBookings({ limit: 100 });
        const allBookings = resData?.bookings || resData || [];

        console.log('Total bookings from API:', allBookings.length);

        // Get all station IDs that staff is assigned to
        const assignedStationIds = staffAssignment.assignments
          .map(a => a.station?.id)
          .filter(Boolean);

        console.log('Staff assigned to stations:', {
          stationIds: assignedStationIds,
          stationNames: staffAssignment.assignments
            .map(a => a.station?.name)
            .filter(Boolean),
        });

        // Filter bookings: CONFIRMED status + belongs to ANY assigned station
        const list = allBookings.filter(b => {
          const status = (b.status || b.bookingStatus || '').toUpperCase();
          const bookingStationId = b.station?.id || b.stationId;

          const isConfirmed = status === 'CONFIRMED';
          const isAssignedStation =
            assignedStationIds.includes(bookingStationId);

          return isConfirmed && isAssignedStation;
        });

        console.log(
          'Available CONFIRMED bookings from assigned stations:',
          list.length
        );
        setAvailableBookings(list);
      } catch (err) {
        console.error('Fetch eligible bookings error', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchEligibleBookings();
  }, [getAllBookings, staffAssignment]);

  // ✨ Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Auto-set station from booking (no manual selection)
  useEffect(() => {
    if (booking?.station?.id) {
      setSelectedStation(booking.station.id);
      console.log('🏢 Station set from booking:', booking.station.name);
    }
  }, [booking]);

  const handleSelectBooking = async value => {
    setBookingId(value);
    setBookingHasInspection(false);
    setExistingInspection(null);
    setBookingHasContract(false);
    setExistingContract(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setIsSearchOpen(false); // Close search dropdown
    setSearchQuery(''); // Clear search

    try {
      const res = await getBookingById(value);
      const b = res?.booking || res?.data?.booking || null;
      setBooking(b);

      // ✨ Fetch existing inspections for this booking
      await fetchBookingInspections(value);

      // ✨ Fetch existing contracts for this booking
      await fetchBookingContracts(value);

      // ✅ Always fetch customer documents and setup check-in fields
      // User can upload contract via modal if needed
      const renterId = b?.renters?.id || b?.renters || b?.user?.id || b?.userId;
      if (renterId) {
        console.log('🔍 Fetching documents for renter ID:', renterId);
        await fetchCustomerDocuments(renterId);
      } else {
        console.warn('⚠️ No renter/user ID found in booking:', b);
      }

      // Reset fields to default
      setExteriorCondition('GOOD');
      setInteriorCondition('GOOD');
      setTireCondition('GOOD');
      setAccessories('ALL_PRESENT');
      setBatteryLevel(
        b?.vehicle?.batteryLevel ? String(b.vehicle.batteryLevel) : ''
      );
      setMileage(b?.vehicle?.mileage ? String(b.vehicle.mileage) : '');
      setDamageNotes('');
      setNotes('');
      setDocumentVerified(false);
      setInspectionFiles([]);
    } catch (e) {
      toast.error(e?.message || 'Failed to load booking');
    }
  };

  // 🔍 Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return availableBookings;

    const query = searchQuery.toLowerCase();
    return availableBookings.filter(b => {
      const customerName = (
        b.user?.name ||
        b.customer?.name ||
        ''
      ).toLowerCase();
      const vehicleName = (b.vehicle?.name || '').toLowerCase();
      const licensePlate = (b.vehicle?.licensePlate || '').toLowerCase();
      const bookingCode = (b.bookingCode || b.id || '').toLowerCase();
      const startDate = new Date(b.startTime)
        .toLocaleDateString()
        .toLowerCase();

      return (
        customerName.includes(query) ||
        vehicleName.includes(query) ||
        licensePlate.includes(query) ||
        bookingCode.includes(query) ||
        startDate.includes(query)
      );
    });
  }, [availableBookings, searchQuery]);

  // Status helpers for badge
  const getBookingStatus = b =>
    (b?.status || b?.bookingStatus || '').toUpperCase();
  const renderStatusBadge = statusUpper => {
    if (!statusUpper) return null;
    const cls =
      statusUpper === 'CONFIRMED'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : statusUpper === 'IN_PROGRESS'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        : statusUpper === 'COMPLETED'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        : statusUpper === 'PENDING'
        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${cls}`}
      >
        {statusUpper}
      </span>
    );
  };

  // ✨ NEW: Fetch inspections for selected booking
  const fetchBookingInspections = async bookingId => {
    if (!bookingId) return;

    try {
      setLoadingInspection(true);
      const response = await apiClient.get(
        endpoints.inspections.getByBooking(bookingId)
      );
      const inspections =
        response?.data?.data?.inspections || response?.data?.inspections || [];

      // Find CHECK_IN inspection
      const checkInInspection = inspections.find(
        i => i.inspectionType === 'CHECK_IN'
      );

      if (checkInInspection) {
        setBookingHasInspection(true);
        setExistingInspection(checkInInspection);
        setIsViewMode(true);
        loadInspectionData(checkInInspection);

        // Remove noisy toast
      } else {
        setBookingHasInspection(false);
        setExistingInspection(null);
      }
    } catch (err) {
      console.warn('Failed to fetch booking inspections:', err);
      setBookingHasInspection(false);
      setExistingInspection(null);
    } finally {
      setLoadingInspection(false);
    }
  };

  // ✨ NEW: Load inspection data into form (including existing images)
  const loadInspectionData = inspection => {
    console.log('🔍 Loading inspection data:', inspection);
    console.log('📝 Notes values:', {
      damageNotes: inspection.damageNotes,
      notes: inspection.notes,
      batteryLevel: inspection.batteryLevel,
      mileage: inspection.mileage,
    });

    setExteriorCondition(inspection.exteriorCondition || 'GOOD');
    setInteriorCondition(inspection.interiorCondition || 'GOOD');
    setTireCondition(inspection.tireCondition || 'GOOD');
    setAccessories(
      Array.isArray(inspection.accessories) &&
        inspection.accessories.includes('ALL_PRESENT')
        ? 'ALL_PRESENT'
        : 'MISSING_ITEMS'
    );
    setBatteryLevel(
      inspection.batteryLevel ? String(inspection.batteryLevel) : ''
    );
    setMileage(inspection.mileage ? String(inspection.mileage) : '');
    setDamageNotes(inspection.damageNotes || '');
    setNotes(inspection.notes || '');
    setDocumentVerified(inspection.documentVerified || false);

    console.log('✅ State set:', {
      batteryLevel: inspection.batteryLevel
        ? String(inspection.batteryLevel)
        : '',
      mileage: inspection.mileage ? String(inspection.mileage) : '',
      damageNotes: inspection.damageNotes || '',
      notes: inspection.notes || '',
    });

    // ✨ Load existing images as preview
    // Backend can return: images (array of objects) OR imageUrls (array of strings)
    let existingPreviews = [];

    if (
      inspection.images &&
      Array.isArray(inspection.images) &&
      inspection.images.length > 0
    ) {
      // Format: images: [{url: '...', fileName: '...', uploadedAt: '...'}, ...]
      console.log('📸 Found images array:', inspection.images.length);
      existingPreviews = inspection.images.map((img, idx) => ({
        url: img.url || img,
        name: img.fileName || `Existing Image ${idx + 1}`,
        isExisting: true,
      }));
    } else if (
      inspection.imageUrls &&
      Array.isArray(inspection.imageUrls) &&
      inspection.imageUrls.length > 0
    ) {
      // Format: imageUrls: ['url1', 'url2', ...]
      console.log('📸 Found imageUrls array:', inspection.imageUrls.length);
      existingPreviews = inspection.imageUrls.map((url, idx) => ({
        url,
        name: `Existing Image ${idx + 1}`,
        isExisting: true,
      }));
    } else if (inspection.imageUrl) {
      // Single image fallback
      console.log('📸 Found single imageUrl');
      existingPreviews = [
        {
          url: inspection.imageUrl,
          name: 'Existing Image',
          isExisting: true,
        },
      ];
    }

    console.log('✅ Loaded existing previews:', existingPreviews.length);
    setInspectionPreviews(existingPreviews);
    setInspectionFiles([]); // Clear new files when loading existing
  };

  // ✨ NEW: Fetch contracts for selected booking
  const fetchBookingContracts = async bookingId => {
    if (!bookingId) return;

    try {
      setLoadingContract(true);
      const response = await apiClient.get(
        endpoints.contracts.getByBooking(bookingId)
      );
      const contracts = response?.data?.data || response?.data || [];

      if (Array.isArray(contracts) && contracts.length > 0) {
        const latestContract = contracts[0]; // Get most recent contract
        setBookingHasContract(true);
        setExistingContract(latestContract);

        // Remove noisy toast
      } else {
        setBookingHasContract(false);
        setExistingContract(null);
      }
    } catch (err) {
      console.warn('Failed to fetch booking contracts:', err);
      setBookingHasContract(false);
      setExistingContract(null);
    } finally {
      setLoadingContract(false);
    }
  };

  const fetchCustomerDocuments = async rentersId => {
    if (!rentersId) {
      console.warn('⚠️ fetchCustomerDocuments called without renter ID');
      return;
    }

    try {
      setLoadingDocuments(true);
      console.log('📡 Calling API: GET /api/documents/user/' + rentersId);
      const response = await apiClient.get(
        endpoints.documents.getByUserId(rentersId)
      );

      const documentsData =
        response?.data?.data?.documents ||
        response?.data?.documents ||
        response?.data ||
        [];

      const docsArray = Array.isArray(documentsData) ? documentsData : [];
      setCustomerDocumentsList(docsArray);

      console.log('📄 Fetched customer documents:', {
        renterId: rentersId,
        count: docsArray.length,
        documents: docsArray,
      });

      // ✅ Check if customer has APPROVED documents
      const hasApprovedDocs = docsArray.some(doc => doc.status === 'APPROVED');

      if (hasApprovedDocs) {
        // ✅ Customer ĐÃ CÓ document approved → Show documents, allow checkbox tick
        const docsObj = {};
        docsArray.forEach(doc => {
          if (doc.status === 'APPROVED') {
            if (doc.documentType === 'ID_CARD') {
              docsObj.identityCard = doc.fileUrl || doc.thumbnailUrl;
            } else if (doc.documentType === 'DRIVERS_LICENSE') {
              docsObj.drivingLicense = doc.fileUrl || doc.thumbnailUrl;
            } else if (doc.documentType === 'PASSPORT') {
              docsObj.passport = doc.fileUrl || doc.thumbnailUrl;
            }
          }
        });
        setCustomerDocuments(Object.keys(docsObj).length > 0 ? docsObj : null);
        setNeedsDocumentUpload(false);
      } else {
        // ⚠️ Customer CHƯA CÓ document approved → Show upload UI
        setCustomerDocuments(null);
        setNeedsDocumentUpload(true);
      }
    } catch (err) {
      console.warn('Failed to fetch customer documents:', err);
      if (err?.response?.status === 404) {
        console.log('No documents found - show upload UI');
        setCustomerDocumentsList([]);
        setCustomerDocuments(null);
        setNeedsDocumentUpload(true);
      } else {
        const errorMsg = err?.response?.data?.message || err?.message;
        toast.warning(`Could not load customer documents: ${errorMsg}`);
        setCustomerDocumentsList([]);
        setCustomerDocuments(null);
        setNeedsDocumentUpload(true);
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Upload a document on behalf of renter (staff action)
  const handleUploadCustomerDocument = async () => {
    if (!booking) return toast.error('Select a booking first');
    if (!docFile) return toast.error('Please choose a file to upload');

    // ✅ Lấy renter ID từ booking
    const renterId =
      booking?.renters?.id ||
      booking?.renters ||
      booking?.user?.id ||
      booking?.userId;
    console.log('🔍 Renter ID for document upload:', renterId);
    if (!renterId) {
      console.error('❌ Cannot find renter ID in booking:', booking);
      return toast.error('Renter ID not found in booking');
    }

    try {
      setLoadingDocuments(true);
      const form = new FormData();

      // ✅ CRITICAL: Gửi userId của RENTER (không phải staff)
      form.append('userId', renterId);
      form.append('document', docFile, docFile.name);
      form.append('documentType', docType);
      // ✅ IMPORTANT: Send renterId so backend knows who to upload for
      form.append('renterId', renterId);

      console.log('📤 Uploading document for renter:', {
        renterId,
        docType,
        fileName: docFile.name,
        fileSize: (docFile.size / 1024 / 1024).toFixed(2) + ' MB',
        bookingId: booking?.id,
      });

      // ✅ Upload với userId trong FormData body
      const res = await apiClient.post(endpoints.documents.upload(), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const created = res?.data?.data || res?.data;
      const uploadedDocId = created?.id;

      console.log('✅ Document uploaded successfully:', {
        docId: uploadedDocId,
        renterId,
        response: created,
      });

      // ✅ Tự động verify luôn sau khi upload (silent - no toast)
      if (uploadedDocId) {
        try {
          await apiClient.patch(endpoints.documents.verify(uploadedDocId));
          console.log('✅ Document auto-verified:', uploadedDocId);
          setDocumentVerified(true); // ✅ Auto-tick checkbox
        } catch (verifyErr) {
          console.warn('⚠️ Auto-verify failed (silent):', verifyErr);
          // Silent fail - document might still be verified
        }
      }

      // Refresh documents để hiển thị document mới
      await fetchCustomerDocuments(renterId);

      // Show success toast after refresh
      toast.success('Document uploaded successfully');
      setDocFile(null);

      // Auto-select next missing document type
      const hasIdCard = customerDocumentsList.some(
        d => d.documentType === 'ID_CARD'
      );
      const hasLicense = customerDocumentsList.some(
        d => d.documentType === 'DRIVERS_LICENSE'
      );

      if (!hasIdCard) {
        setDocType('ID_CARD');
      } else if (!hasLicense) {
        setDocType('DRIVERS_LICENSE');
      } else {
        setDocType('ID_CARD'); // Reset to default
      }

      setNeedsDocumentUpload(false);
    } catch (e) {
      console.error('❌ Upload document error:', e);
      console.error('❌ Error response:', e?.response?.data);
      const msg = e?.response?.data?.message || e?.message;
      toast.error('Failed to upload document', {
        description: msg || 'An error occurred while uploading the document',
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  // When staff toggles verification checkbox
  const handleToggleDocumentVerified = e => {
    const checked = e.target.checked;

    // ✅ Checkbox chỉ để staff XÁC NHẬN đã kiểm tra document
    // KHÔNG GỌI API - Upload đã tự động verify rồi
    if (!checked) {
      setDocumentVerified(false);
      return;
    }

    // Check if customer has any approved documents
    const hasApprovedDocs = customerDocumentsList.some(
      doc => doc.status === 'APPROVED'
    );

    if (hasApprovedDocs) {
      // ✅ Customer có document approved → Cho phép tick
      setDocumentVerified(true);
    } else {
      // ❌ Customer chưa có document approved → Không cho tick
      toast.error('Cannot verify - No approved documents', {
        description:
          'Please upload customer documents first using the form above',
      });
      setDocumentVerified(false);
    }
  };

  const handleBatteryLevelChange = e => {
    const value = e.target.value;
    setBatteryLevel(value);
    const num = Number(value);
    if (!value) {
      setValidationErrors(prev => ({
        ...prev,
        batteryLevel: 'Battery level is required',
      }));
    } else if (isNaN(num) || num < 0 || num > 100) {
      setValidationErrors(prev => ({
        ...prev,
        batteryLevel: 'Battery level must be 0-100%',
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, batteryLevel: '' }));
    }
  };

  const handleMileageChange = e => {
    const value = e.target.value;
    setMileage(value);
    const num = Number(value);
    if (!value) {
      setValidationErrors(prev => ({
        ...prev,
        mileage: 'Odometer reading is required',
      }));
    } else if (isNaN(num) || num < 0) {
      setValidationErrors(prev => ({
        ...prev,
        mileage: 'Odometer must be a positive number',
      }));
    } else if (num > 999999) {
      setValidationErrors(prev => ({
        ...prev,
        mileage: 'Odometer reading seems unrealistic',
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, mileage: '' }));
    }
  };

  const handleDamageNotesChange = e => {
    const value = e.target.value;
    setDamageNotes(value);
    if (value.length > 1000) {
      setValidationErrors(prev => ({
        ...prev,
        damageNotes: 'Damage notes must not exceed 1000 characters',
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, damageNotes: '' }));
    }
  };

  const handleNotesChange = e => {
    const value = e.target.value;
    setNotes(value);
    if (value.length > 500) {
      setValidationErrors(prev => ({
        ...prev,
        notes: 'Notes must not exceed 500 characters',
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, notes: '' }));
    }
  };

  const handleFiles = e => {
    const files = Array.from(e.target.files || []);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast.error(`Invalid file type. Only JPG, PNG, WebP are allowed.`);
      return;
    }

    // ✨ Calculate total including existing images
    const existingImagesCount = inspectionPreviews.filter(
      p => p.isExisting
    ).length;
    const currentNewCount = inspectionFiles.length;
    const totalAfterUpload =
      existingImagesCount + currentNewCount + files.length;

    if (totalAfterUpload > 10) {
      toast.error(
        `Maximum 10 images allowed. You have ${existingImagesCount} existing + ${currentNewCount} new. Can only add ${
          10 - existingImagesCount - currentNewCount
        } more.`
      );
      return;
    }

    // ✅ FIXED: Match backend limit (10MB instead of 5MB)
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`Files exceed 10MB (backend limit)`);
      return;
    }

    setInspectionFiles(prev => [...prev, ...files]);
  };

  useEffect(() => {
    // ✨ Combine existing images + new file uploads
    const existingImages = inspectionPreviews.filter(p => p.isExisting);
    const newFileUrls = inspectionFiles
      .filter(f => f && f.type && f.type.startsWith('image/'))
      .map(f => ({
        url: URL.createObjectURL(f),
        name: f.name,
        isExisting: false,
      }));

    setInspectionPreviews([...existingImages, ...newFileUrls]);

    return () => {
      // Cleanup only new file URLs (not existing image URLs)
      newFileUrls.forEach(p => {
        if (p.url.startsWith('blob:')) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [inspectionFiles]);

  const uploadInspectionImages = async inspectionId => {
    try {
      console.log('🚀 uploadInspectionImages called with ID:', inspectionId);

      const imageFiles = (inspectionFiles || []).filter(
        f => f && f.type && f.type.startsWith('image/')
      );

      console.log('📁 Total inspection files:', inspectionFiles.length);
      console.log('🖼️  Valid image files:', imageFiles.length);

      if (!inspectionId || !imageFiles.length) {
        console.warn('⚠️ Skipping upload:', {
          inspectionId,
          imageCount: imageFiles.length,
        });
        return [];
      }

      // ✅ FIXED: Match backend limit (10MB instead of 5MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB to match backend
      const validFiles = imageFiles.filter(f => f.size <= MAX_SIZE);

      console.log('✅ Files within size limit:', validFiles.length);

      if (validFiles.length < imageFiles.length) {
        const oversizedCount = imageFiles.length - validFiles.length;
        console.warn(`⚠️ ${oversizedCount} file(s) exceed 10MB limit`);
        // Không hiển thị toast ở đây để tránh trùng lặp
      }

      // ✅ Upload tuần tự để tránh ImageKit/Server quá tải (ReturnCar cũng làm tuần tự)
      const uploadedUrls = [];
      for (let index = 0; index < validFiles.length; index++) {
        const file = validFiles[index];
        try {
          console.log(
            `📤 Uploading ${index + 1}/${validFiles.length}: ${file.name} (${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB)`
          );

          if (!file.type.startsWith('image/')) {
            console.warn(`⚠️ Skipping non-image file: ${file.name}`);
            continue;
          }

          const formData = new FormData();
          // Đính kèm tên file giống Postman để Multer giữ originalname
          formData.append('image', file, file.name);

          console.log(
            `📡 POST ${endpoints.inspections.uploadImage(inspectionId)}`
          );

          const tryUpload = async (attempt = 1) => {
            try {
              const res = await apiClient.post(
                endpoints.inspections.uploadImage(inspectionId),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
              return res;
            } catch (e) {
              const status = e?.response?.status;
              const shouldRetry = status >= 500 && status < 600 && attempt < 3;
              if (shouldRetry) {
                const delay = 500 * attempt;
                console.warn(
                  `Retry upload (${attempt}) after ${delay}ms for`,
                  file.name
                );
                await new Promise(r => setTimeout(r, delay));
                return tryUpload(attempt + 1);
              }
              throw e;
            }
          };

          const res = await tryUpload();
          const responseData = res?.data?.data || res?.data;
          if (responseData?.imageUrl) {
            uploadedUrls.push(responseData.imageUrl);
            console.log(`✅ Uploaded image ${index + 1}/${validFiles.length}`);
          } else {
            console.error(
              `❌ No imageUrl in response for ${file.name}:`,
              responseData
            );
          }
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file.name}:`, uploadError);
          console.error(
            'Details:',
            uploadError?.response?.data || uploadError?.message
          );
        }
      }

      console.log('📊 Upload results:', {
        total: validFiles.length,
        successful: uploadedUrls.length,
        failed: validFiles.length - uploadedUrls.length,
        urls: uploadedUrls,
      });

      // Không hiển thị toast ở đây để tránh trùng lặp

      return uploadedUrls;
    } catch (err) {
      console.error('❌ Upload inspection images error:', err);
      toast.error('Failed to upload images. Please try again.');
      return [];
    }
  };

  // ✨ NEW: Remove specific image from preview (existing or new)
  const handleRemoveImage = indexToRemove => {
    const imageToRemove = inspectionPreviews[indexToRemove];

    if (imageToRemove.isExisting) {
      // Remove from preview only (existing images)
      setInspectionPreviews(prev =>
        prev.filter((_, index) => index !== indexToRemove)
      );
      toast.info(
        'Existing image removed from view. It will remain unless you upload new ones.'
      );
    } else {
      // Remove from new files array
      const newFilesOnlyPreviews = inspectionPreviews.filter(
        p => !p.isExisting
      );
      const indexInNewFiles = newFilesOnlyPreviews.findIndex((_, i) => {
        const actualIndex =
          inspectionPreviews.filter(p => p.isExisting).length + i;
        return actualIndex === indexToRemove;
      });

      if (indexInNewFiles !== -1) {
        setInspectionFiles(prev =>
          prev.filter((_, index) => index !== indexInNewFiles)
        );
      }
    }
  };

  const resetAllFields = () => {
    // Reset booking
    setBookingId('');
    setBooking(null);

    // Reset inspection states
    setBookingHasInspection(false);
    setExistingInspection(null);
    setIsEditMode(false);
    setIsViewMode(false);

    // Reset inspection form fields
    setExteriorCondition('GOOD');
    setInteriorCondition('GOOD');
    setTireCondition('GOOD');
    setAccessories('ALL_PRESENT');
    setBatteryLevel('');
    setMileage('');
    setDamageNotes('');
    setNotes('');
    setDocumentVerified(false);
    setInspectionFiles([]);
    setInspectionPreviews([]);
    setSelectedStation('');

    // Reset contract states
    setBookingHasContract(false);
    setExistingContract(null);

    // Reset customer documents
    setCustomerDocuments(null);
    setCustomerDocumentsList([]);
    setNeedsDocumentUpload(false);
    setDocFile(null);
    setDocType('ID_CARD');

    // Reset search
    setSearchQuery('');
    setIsSearchOpen(false);

    // Reset validation errors
    setValidationErrors({
      batteryLevel: '',
      mileage: '',
      damageNotes: '',
      notes: '',
    });
  };

  const performInspectionSubmission = async () => {
    const batteryNum = Number(batteryLevel);
    const mileageNum = Number(mileage);
    const id = booking?.id || bookingId;

    try {
      setIsSubmitting(true);

      // 🔄 STEP 1: Check-in booking FIRST
      // This ensures booking status changes to IN_PROGRESS and vehicle to RENTED
      // If this fails, we don't create any inspection record (clean state)
      console.log('🔄 Step 1: Checking in booking...');
      const actualPickupLocation =
        stations?.find?.(s => s.id === selectedStation)?.name ||
        booking?.station?.name ||
        '';

      await apiClient.post(endpoints.bookings.checkIn(id), {
        actualStartTime: new Date().toISOString(),
        actualPickupLocation,
        pickupOdometer: mileageNum,
        batteryLevel: batteryNum,
      });

      console.log('✅ Step 1 completed: Booking checked in successfully');
      console.log('   → Booking status: CONFIRMED → IN_PROGRESS');
      console.log('   → Vehicle status: RESERVED → RENTED');

      // 🔄 STEP 2: Create inspection AFTER successful check-in
      // Only create inspection when booking is already IN_PROGRESS
      console.log('🔄 Step 2: Creating inspection record...');
      const inspectionPayload = {
        vehicleId: booking?.vehicle?.id || booking?.vehicleId,
        staffId: user?.id,
        bookingId: id,
        inspectionType: inspectionType,
        batteryLevel: batteryNum,
        mileage: mileageNum,
        exteriorCondition: exteriorCondition,
        interiorCondition: interiorCondition,
        tireCondition: tireCondition,
        accessories:
          accessories === 'ALL_PRESENT' ? ['ALL_PRESENT'] : ['MISSING_ITEMS'],
        damageNotes: damageNotes || undefined,
        notes: notes || undefined,
        documentVerified: documentVerified,
        // Create as draft first, will mark completed after images uploaded
        isCompleted: false,
        images: [],
      };

      const inspectionRes = await apiClient.post(
        endpoints.inspections.create(),
        inspectionPayload
      );
      const createdInspection =
        inspectionRes?.data?.inspection || inspectionRes?.data || null;

      if (!createdInspection?.id) {
        throw new Error(
          'Failed to create inspection: No inspection ID returned'
        );
      }

      console.log(
        '✅ Step 2 completed: Inspection created:',
        createdInspection.id
      );

      // 🔄 STEP 3: Upload images (if any)
      let uploadedImageUrls = [];
      if (inspectionFiles.length > 0) {
        console.log(`🔄 Step 3: Uploading ${inspectionFiles.length} images...`);
        try {
          uploadedImageUrls = await uploadInspectionImages(
            createdInspection.id
          );
          console.log(
            `✅ Step 3 completed: ${uploadedImageUrls.length} images uploaded`
          );
        } catch (uploadErr) {
          console.warn(
            '⚠️ Image upload failed, but inspection is created:',
            uploadErr
          );
          // Don't fail the whole process if images fail - can be uploaded later
          toast.warning('Images upload failed', {
            description:
              'Inspection created but images failed to upload. You can edit and re-upload later.',
            duration: 5000,
          });
        }
      } else {
        console.log('ℹ️ Step 3 skipped: No images to upload');
      }

      // 🔄 STEP 4: Mark inspection as completed
      console.log('🔄 Step 4: Marking inspection as completed...');
      await apiClient.put(endpoints.inspections.getById(createdInspection.id), {
        images: uploadedImageUrls,
        isCompleted: true,
      });
      console.log('✅ Step 4 completed: Inspection marked as completed');

      // 🔄 STEP 5: Show success dialog
      const customerName = booking?.user?.name || booking?.renter?.name || '';
      const vehicleLabel = `${booking?.vehicle?.name || ''}${
        booking?.vehicle?.licensePlate
          ? ' • ' + booking.vehicle.licensePlate
          : ''
      }`.trim();

      setCheckInSummary({
        bookingId: id,
        vehicleLabel,
        customerName,
        mileage: mileageNum,
        batteryLevel: batteryNum,
        actualStartTime: new Date().toISOString(),
        staffInfo: { name: user?.name || 'Current staff' },
      });

      setCheckInSummaryOpen(true);
      resetAllFields();

      console.log('✅ All steps completed successfully!');

      // 🔄 STEP 6: Refresh bookings list
      try {
        setLoadingBookings(true);
        const resData = await getAllBookings({ limit: 100 });
        const list = (resData?.bookings || resData || []).filter(b => {
          const status = (b.status || b.bookingStatus || '').toUpperCase();
          return status !== 'CANCELED' && status !== 'CANCELLED';
        });
        setAvailableBookings(list);
        console.log('✅ Bookings list refreshed');
      } catch (err) {
        console.error('⚠️ Failed to refresh bookings (non-critical):', err);
      } finally {
        setLoadingBookings(false);
      }
    } catch (e) {
      console.error('❌ Check-in process failed:', e);
      const status = e?.status ?? e?.response?.status;
      const serverMsg = e?.response?.data?.message || e?.message;

      // Enhanced error messages
      let errorTitle = 'Check-in Failed';
      let errorDescription =
        serverMsg || 'Unable to complete check-in process. Please try again.';

      if (status === 400) {
        errorTitle = 'Validation Error';
        errorDescription =
          serverMsg || 'Invalid data provided. Please check all fields.';
      } else if (status === 403) {
        errorTitle = 'Permission Denied';
        errorDescription = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorTitle = 'Not Found';
        errorDescription = 'Booking or vehicle not found.';
      } else if (status >= 500) {
        errorTitle = 'Server Error';
        errorDescription =
          'Server encountered an error. Please try again later.';
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInspection = async () => {
    // ✅ COMPREHENSIVE VALIDATION - Thu thập TẤT CẢ lỗi trước khi hiển thị
    const validationErrors = [];

    // 1. Check booking
    if (!booking) {
      validationErrors.push('❌ No booking selected');
    }

    // 2. Check staff ID
    if (!user?.id) {
      validationErrors.push('❌ Staff information is missing');
    }

    // 3. Check vehicle info from booking
    if (booking && !booking.vehicle?.id) {
      validationErrors.push('❌ Vehicle information is missing from booking');
    }

    // 4. ⚠️ CRITICAL: Check vehicle status MUST be RESERVED to check-in
    if (booking?.vehicle) {
      const vehicleStatus = (booking.vehicle.status || '').toUpperCase();
      if (vehicleStatus !== 'RESERVED') {
        validationErrors.push(
          `❌ Vehicle status must be RESERVED to check-in (Current status: ${
            vehicleStatus || 'Unknown'
          })`
        );
      }
    }

    // 5. Check station
    if (!selectedStation) {
      validationErrors.push('❌ Return station is not set');
    }

    // 5. ⚠️ Check contract exists and is COMPLETED
    if (!bookingHasContract || !existingContract) {
      validationErrors.push(
        '❌ Contract is required - Please create and upload signed contract first'
      );
    } else if (existingContract.status !== 'COMPLETED') {
      validationErrors.push(
        '❌ Contract must be COMPLETED - Customer must sign and staff must upload it'
      );
    }

    // 6. Check exterior condition
    if (!exteriorCondition) {
      validationErrors.push('❌ Exterior condition is required');
    }

    // 7. Check interior condition
    if (!interiorCondition) {
      validationErrors.push('❌ Interior condition is required');
    }

    // 8. Check tire condition
    if (!tireCondition) {
      validationErrors.push('❌ Tire condition is required');
    }

    // 9. Check accessories status
    if (!accessories) {
      validationErrors.push('❌ Accessories status is required');
    }

    // 10. Check battery level
    const batteryNum = Number(batteryLevel);
    if (!batteryLevel || batteryLevel.trim() === '') {
      validationErrors.push('❌ Battery level is required');
    } else if (isNaN(batteryNum)) {
      validationErrors.push('❌ Battery level must be a valid number');
    } else if (batteryNum < 0 || batteryNum > 100) {
      validationErrors.push('❌ Battery level must be between 0-100%');
    }

    // 11. Check odometer reading
    const mileageNum = Number(mileage);
    if (!mileage || mileage.trim() === '') {
      validationErrors.push('❌ Odometer reading is required');
    } else if (isNaN(mileageNum)) {
      validationErrors.push('❌ Odometer reading must be a valid number');
    } else if (mileageNum < 0) {
      validationErrors.push('❌ Odometer reading cannot be negative');
    }

    // 12. ⚠️ Check document verification (CRITICAL)
    if (!documentVerified) {
      validationErrors.push(
        '❌ Customer documents must be verified - Please tick the verification checkbox'
      );
    }

    // 13. Check vehicle images (not in edit mode)
    if (!isEditMode) {
      const existingImagesCount = inspectionPreviews.filter(
        p => p.isExisting
      ).length;
      const newImagesCount = inspectionFiles.length;
      const totalImages = existingImagesCount + newImagesCount;

      if (totalImages === 0) {
        validationErrors.push('❌ At least 1 vehicle image is required');
      }
    }

    // 14. Check damage notes if condition is not GOOD
    if (
      exteriorCondition !== 'GOOD' ||
      interiorCondition !== 'GOOD' ||
      tireCondition !== 'GOOD'
    ) {
      if (!damageNotes || damageNotes.trim().length < 10) {
        validationErrors.push(
          '❌ Detailed damage notes (min 10 characters) are required when vehicle condition is not GOOD'
        );
      }
    }

    // 15. Validate notes length if provided
    if (notes && notes.length > 500) {
      validationErrors.push(
        '❌ Additional notes must not exceed 500 characters'
      );
    }

    if (damageNotes && damageNotes.length > 1000) {
      validationErrors.push('❌ Damage notes must not exceed 1000 characters');
    }

    // 16. Check time cutoff (must check-in within 24h of scheduled start)
    const plannedStartTime = booking?.startTime
      ? new Date(booking.startTime)
      : null;
    if (plannedStartTime) {
      const actualStartTime = new Date();
      const maxAllowed = new Date(
        plannedStartTime.getTime() + 24 * 60 * 60 * 1000
      );
      if (actualStartTime > maxAllowed) {
        validationErrors.push(
          '❌ Cannot check-in more than 24 hours after scheduled start time'
        );
      }
    }

    // 🚨 If there are ANY validation errors, show them ALL and stop
    if (validationErrors.length > 0) {
      const errorMessage = `Please complete the following required fields:\n\n${validationErrors.join(
        '\n'
      )}`;

      toast.error('Check-In Validation Failed', {
        description: (
          <div className='space-y-1 text-xs'>
            <p className='mb-2 font-semibold'>Missing required information:</p>
            <ul className='space-y-1 list-none'>
              {validationErrors.map((error, idx) => (
                <li key={idx} className='text-red-600 dark:text-red-400'>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ),
        duration: 8000,
      });

      // Also log to console for debugging
      console.error('❌ Check-In Validation Failed:', validationErrors);
      return; // ❌ STOP - Do not proceed
    }

    // ✅ ALL VALIDATIONS PASSED - Proceed with inspection
    console.log('✅ All validations passed - Proceeding with check-in');

    if (isEditMode && existingInspection?.id) {
      await handleUpdateInspection();
    } else {
      await performInspectionSubmission();
    }
  };

  // ✨ NEW: Update existing inspection
  const handleUpdateInspection = async () => {
    if (!existingInspection?.id) return;

    const batteryNum = Number(batteryLevel);
    const mileageNum = Number(mileage);

    const updatePayload = {
      batteryLevel: batteryNum,
      mileage: mileageNum,
      exteriorCondition: exteriorCondition,
      interiorCondition: interiorCondition,
      tireCondition: tireCondition,
      accessories:
        accessories === 'ALL_PRESENT' ? ['ALL_PRESENT'] : ['MISSING_ITEMS'],
      damageNotes: damageNotes || undefined,
      notes: notes || undefined,
      documentVerified: documentVerified,
      isCompleted: true,
    };

    try {
      setIsSubmitting(true);

      const response = await apiClient.put(
        endpoints.inspections.getById(existingInspection.id),
        updatePayload
      );

      // Upload new images if any
      if (inspectionFiles.length > 0) {
        await uploadInspectionImages(existingInspection.id);
      }

      toast.success('Inspection updated successfully');

      // Refresh inspection data
      await fetchBookingInspections(bookingId);
      setIsEditMode(false);
      setIsViewMode(true);
      setInspectionFiles([]);
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message;
      toast.error(serverMsg || 'Failed to update inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✨ NEW: Delete inspection
  const handleDeleteInspection = async () => {
    if (!existingInspection?.id) return;

    if (
      !confirm(
        'Are you sure you want to delete this inspection? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      await apiClient.delete(
        endpoints.inspections.getById(existingInspection.id)
      );

      toast.success('Inspection deleted successfully');

      // Reset states
      setBookingHasInspection(false);
      setExistingInspection(null);
      setIsEditMode(false);
      setIsViewMode(false);

      // Reload booking
      if (bookingId) {
        await fetchBookingInspections(bookingId);
      }
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message;
      toast.error(serverMsg || 'Failed to delete inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✨ NEW: Enable edit mode
  const handleEnableEditMode = () => {
    setIsEditMode(true);
    setIsViewMode(false);
    toast.info('Edit mode enabled', {
      description: 'You can now modify the inspection details',
    });
  };

  // ✨ NEW: Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsViewMode(true);
    setInspectionFiles([]);
    if (existingInspection) {
      loadInspectionData(existingInspection);
    }
    toast.info('Edit cancelled');
  };

  // ✅ Calculate validation errors count for UI feedback
  const getValidationErrorsCount = () => {
    if (isEditMode || isViewMode) return 0; // Skip for edit/view mode

    let errorCount = 0;

    if (!booking) errorCount++;
    if (!user?.id) errorCount++;
    if (booking && !booking.vehicle?.id) errorCount++;
    if (!selectedStation) errorCount++;
    if (!bookingHasContract || !existingContract) errorCount++;
    else if (existingContract.status !== 'COMPLETED') errorCount++;
    if (!exteriorCondition) errorCount++;
    if (!interiorCondition) errorCount++;
    if (!tireCondition) errorCount++;
    if (!accessories) errorCount++;

    const batteryNum = Number(batteryLevel);
    if (
      !batteryLevel ||
      batteryLevel.trim() === '' ||
      isNaN(batteryNum) ||
      batteryNum < 0 ||
      batteryNum > 100
    ) {
      errorCount++;
    }

    const mileageNum = Number(mileage);
    if (
      !mileage ||
      mileage.trim() === '' ||
      isNaN(mileageNum) ||
      mileageNum < 0
    ) {
      errorCount++;
    }

    if (!documentVerified) errorCount++;

    const existingImagesCount = inspectionPreviews.filter(
      p => p.isExisting
    ).length;
    const newImagesCount = inspectionFiles.length;
    if (existingImagesCount + newImagesCount === 0) errorCount++;

    if (
      (exteriorCondition !== 'GOOD' ||
        interiorCondition !== 'GOOD' ||
        tireCondition !== 'GOOD') &&
      (!damageNotes || damageNotes.trim().length < 10)
    ) {
      errorCount++;
    }

    return errorCount;
  };

  const validationErrorsCount = getValidationErrorsCount();

  // Determine if fields should be disabled
  const isFieldsDisabled = isViewMode && !isEditMode;
  const isContractNotCompleted =
    !bookingHasContract || existingContract?.status !== 'COMPLETED';
  const isSubmitDisabled =
    isSubmitting ||
    !booking ||
    (bookingHasInspection && !isEditMode) ||
    isContractNotCompleted;

  // Show loading state while fetching staff assignment
  if (loadingAssignment) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='space-y-3 text-center'>
          <div className='w-8 h-8 mx-auto border-4 rounded-full border-primary border-t-transparent animate-spin' />
          <p className='text-sm text-muted-foreground'>
            Loading staff assignment...
          </p>
        </div>
      </div>
    );
  }

  // Show error if staff not assigned to any station
  if (
    !staffAssignment ||
    !staffAssignment.assignments ||
    staffAssignment.assignments.length === 0
  ) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='max-w-md space-y-4 text-center'>
          <div className='text-6xl'>🚫</div>
          <div>
            <h3 className='text-lg font-semibold'>No Station Assignment</h3>
            <p className='mt-2 text-sm text-muted-foreground'>
              You are not assigned to any station. Please contact your
              administrator to assign you to a station before performing
              check-ins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get all assigned station names
  const assignedStationNames = staffAssignment.assignments
    .map(a => a.station?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold'>Check-In Car (Staff)</h2>
        <p className='text-sm text-muted-foreground'>
          Inspect vehicle condition and hand over keys to customer • Stations:{' '}
          {staffAssignment.assignments
            ?.map(a => a.station?.name)
            .filter(Boolean)
            .join(', ') || 'Unknown'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Booking</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* 🔍 Enhanced Search Booking Selector */}
          <div className='space-y-3' ref={searchRef}>
            <Label className='text-base font-semibold'>
              Search & Select Booking
            </Label>
            <p className='text-sm text-muted-foreground'>
              Find by customer name, vehicle, license plate, booking code, or
              date
            </p>

            <div className='relative'>
              {/* Search Input */}
              <div className='relative'>
                <Search className='absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Search bookings...'
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className='h-12 pl-10 pr-10 text-base'
                  disabled={loadingBookings}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className='absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground'
                  >
                    <X className='w-4 h-4' />
                  </button>
                )}
              </div>

              {/* Dropdown Results - Max 4 items with scroll */}
              {isSearchOpen && !loadingBookings && (
                <div className='absolute z-50 w-full mt-2 border rounded-lg shadow-lg bg-popover'>
                  {filteredBookings.length === 0 ? (
                    <div className='p-8 text-center'>
                      <Search className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        {searchQuery
                          ? 'No bookings found matching your search'
                          : 'No bookings available'}
                      </p>
                    </div>
                  ) : (
                    <div className='p-2'>
                      <div className='px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 rounded-t-md'>
                        {filteredBookings.length} booking
                        {filteredBookings.length !== 1 ? 's' : ''} found
                      </div>
                      {/* Max height for 4 items (~400px) with scroll */}
                      <div className='max-h-[400px] overflow-y-auto space-y-1 mt-2'>
                        {filteredBookings.map(b => {
                          const hasInspection =
                            b?.inspection?.id ||
                            b?.inspections?.some(i => i?.id);
                          const isSelected = bookingId === b.id;

                          return (
                            <button
                              key={b.id}
                              onClick={() => handleSelectBooking(b.id)}
                              className={`w-full text-left p-4 rounded-md transition-all ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div className='flex-1 space-y-2'>
                                  {/* Customer & Vehicle */}
                                  <div className='flex flex-wrap items-center gap-2'>
                                    <div className='flex items-center gap-1.5'>
                                      <User className='h-3.5 w-3.5' />
                                      <span
                                        className={`font-semibold text-sm ${
                                          isSelected
                                            ? 'text-primary-foreground'
                                            : 'text-foreground'
                                        }`}
                                      >
                                        {b.user?.name ||
                                          b.customer?.name ||
                                          'Unknown'}
                                      </span>
                                    </div>
                                    <span
                                      className={
                                        isSelected
                                          ? 'text-primary-foreground/70'
                                          : 'text-muted-foreground'
                                      }
                                    >
                                      •
                                    </span>
                                    <div className='flex items-center gap-1.5'>
                                      <Car className='h-3.5 w-3.5' />
                                      <span
                                        className={`text-sm ${
                                          isSelected
                                            ? 'text-primary-foreground'
                                            : 'text-foreground'
                                        }`}
                                      >
                                        {b.vehicle?.name || 'Vehicle'}
                                        {b.vehicle?.licensePlate && (
                                          <span
                                            className={`font-mono ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                                              isSelected
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                          >
                                            {b.vehicle.licensePlate}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Date & Code */}
                                  <div
                                    className={`flex items-center gap-3 text-xs ${
                                      isSelected
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    <div className='flex items-center gap-1.5'>
                                      <Calendar className='w-3 h-3' />
                                      <span>
                                        {new Date(
                                          b.startTime
                                        ).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                    {b.bookingCode && (
                                      <>
                                        <span>•</span>
                                        <span className='font-mono'>
                                          {b.bookingCode}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Status Badges */}
                                <div className='flex flex-col items-end gap-1.5'>
                                  {isSelected && <Check className='w-5 h-5' />}
                                  {renderStatusBadge(getBookingStatus(b))}
                                  {hasInspection && (
                                    <span className='inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-md dark:bg-green-900/30 dark:text-green-300'>
                                      <Check className='w-3 h-3' />
                                      Inspected
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loadingBookings && (
              <div className='flex items-center justify-center p-8 border rounded-lg bg-muted/30'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <div className='w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin' />
                  <span className='text-sm'>Loading bookings...</span>
                </div>
              </div>
            )}
          </div>

          {/* ✨ Info banner for existing inspection */}
          {bookingHasInspection && existingInspection && (
            <div className='p-4 border-2 border-blue-400 rounded-lg md:col-span-3 bg-blue-50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-2xl'>📋</span>
                  <div>
                    <p className='font-semibold text-blue-900'>
                      Existing Inspection Found
                    </p>
                    <p className='text-sm text-blue-700'>
                      Created{' '}
                      {new Date(existingInspection.createdAt).toLocaleString()}
                      {existingInspection.staff?.name &&
                        ` by ${existingInspection.staff.name}`}
                    </p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  {isViewMode && !isEditMode && (
                    <>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleEnableEditMode}
                        disabled={isSubmitting}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={handleDeleteInspection}
                        disabled={isSubmitting || user?.role !== 'ADMIN'}
                        title={
                          user?.role !== 'ADMIN' ? 'Only admins can delete' : ''
                        }
                      >
                        🗑️ Delete
                      </Button>
                    </>
                  )}
                  {isEditMode && (
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      ✖️ Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {loadingInspection && (
            <div className='p-4 border rounded-lg md:col-span-3 bg-gray-50'>
              <p className='text-sm text-gray-600'>
                Loading inspection data...
              </p>
            </div>
          )}

          {booking && (
            <div className='grid grid-cols-1 gap-4 p-4 border rounded md:col-span-3 md:grid-cols-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Customer</p>
                <p className='font-medium'>
                  {booking.user?.name || booking.renter?.name || ''}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Vehicle</p>
                <p className='font-medium'>
                  {booking.vehicle?.name || booking.vehicle?.licensePlate || ''}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Start Time</p>
                <p className='font-medium'>
                  {booking.startTime
                    ? new Date(booking.startTime).toLocaleString()
                    : ''}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Deposit</p>
                <p className='font-medium'>
                  {formatCurrency(
                    booking?.depositAmount ?? booking?.amount?.deposit ?? 0
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ✨ Contract Status Warning */}
          {booking && (
            <div className='md:col-span-3'>
              {loadingContract ? (
                <div className='p-4 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    ⏳ Checking contract status...
                  </p>
                </div>
              ) : !bookingHasContract ? (
                <div className='p-4 border-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800'>
                  <p className='mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100'>
                    ⚠️ Contract Required
                  </p>
                  <p className='text-sm text-amber-700 dark:text-amber-300'>
                    Please create contract and have customer sign it before
                    check-in.
                    <button
                      type='button'
                      onClick={() => setShowContractModal(true)}
                      className='ml-1 font-medium underline transition-colors hover:text-amber-900 dark:hover:text-amber-100'
                    >
                      Upload Contract Now
                    </button>
                  </p>
                </div>
              ) : existingContract?.status === 'CREATED' ? (
                <div className='p-4 border-2 border-blue-300 rounded-lg dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'>
                  <p className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                    📄 Contract Created
                  </p>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Contract {existingContract.contractNumber} is waiting for
                    signed file upload.
                    <button
                      type='button'
                      onClick={() => setShowContractModal(true)}
                      className='ml-1 font-medium underline transition-colors hover:text-blue-900 dark:hover:text-blue-100'
                    >
                      Upload Now
                    </button>
                  </p>
                </div>
              ) : existingContract?.status === 'COMPLETED' ? (
                <div className='p-4 border-2 border-green-300 rounded-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20'>
                  <p className='mb-1 text-sm font-semibold text-green-900 dark:text-green-100'>
                    ✅ Contract Completed
                  </p>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Contract {existingContract.contractNumber} is signed and
                    ready. You can proceed with check-in.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inspection Checklist</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Station Info - Display only (from booking) */}
          <div>
            <Label className='block mb-2'>
              Check-In Station <span className='text-red-500'>*</span>
            </Label>
            <div className='p-3 border rounded-md bg-muted/50'>
              {booking?.station ? (
                <div>
                  <p className='font-medium'>{booking.station.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {booking.station.address}
                  </p>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Select a booking first
                </p>
              )}
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Station is determined by the booking and cannot be changed
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label className='block mb-2'>
                Exterior Condition <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={exteriorCondition}
                onValueChange={setExteriorCondition}
                disabled={isFieldsDisabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOD'>Good</SelectItem>
                  <SelectItem value='FAIR'>Fair</SelectItem>
                  <SelectItem value='POOR'>Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='block mb-2'>
                Interior Condition <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={interiorCondition}
                onValueChange={setInteriorCondition}
                disabled={isFieldsDisabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOD'>Good</SelectItem>
                  <SelectItem value='FAIR'>Fair</SelectItem>
                  <SelectItem value='POOR'>Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='block mb-2'>
                Tire Condition <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={tireCondition}
                onValueChange={setTireCondition}
                disabled={isFieldsDisabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOD'>Good</SelectItem>
                  <SelectItem value='FAIR'>Fair</SelectItem>
                  <SelectItem value='POOR'>Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className='block mb-2'>
              Accessories Status <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={accessories}
              onValueChange={setAccessories}
              disabled={isFieldsDisabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL_PRESENT'>All Present</SelectItem>
                <SelectItem value='MISSING_ITEMS'>Missing Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label className='block mb-2'>
                Battery Level (%) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='number'
                min='0'
                max='100'
                value={batteryLevel}
                onChange={handleBatteryLevelChange}
                placeholder='0-100'
                disabled={isFieldsDisabled}
                className={
                  validationErrors.batteryLevel ? 'border-red-500' : ''
                }
              />
              {validationErrors.batteryLevel && (
                <p className='mt-1 text-xs text-red-500'>
                  {validationErrors.batteryLevel}
                </p>
              )}
            </div>
            <div>
              <Label className='block mb-2'>
                Odometer Reading (km) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='number'
                min='0'
                value={mileage}
                onChange={handleMileageChange}
                placeholder='e.g., 12500'
                disabled={isFieldsDisabled}
                className={validationErrors.mileage ? 'border-red-500' : ''}
              />
              {validationErrors.mileage && (
                <p className='mt-1 text-xs text-red-500'>
                  {validationErrors.mileage}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label className='block mb-2'>Upload Vehicle Images</Label>
              <Input
                type='file'
                multiple
                accept='image/*'
                onChange={handleFiles}
                disabled={isFieldsDisabled}
              />
              {!!inspectionPreviews.length && (
                <div className='grid grid-cols-2 gap-2 mt-3 md:grid-cols-3'>
                  {inspectionPreviews.map((p, idx) => (
                    <div
                      key={idx}
                      className='relative overflow-hidden border rounded group'
                    >
                      {/* ✨ Badge to indicate existing vs new image */}
                      {p.isExisting && (
                        <div className='absolute top-1 left-1 z-10 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow'>
                          Existing
                        </div>
                      )}
                      {!p.isExisting && (
                        <div className='absolute top-1 left-1 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow'>
                          New
                        </div>
                      )}
                      <img
                        src={p.url}
                        alt={p.name}
                        className='object-cover w-full h-24'
                      />
                      <div className='p-2 text-xs truncate'>{p.name}</div>
                      {!isFieldsDisabled && (
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(idx)}
                          className='absolute p-1 text-white transition-opacity bg-red-500 rounded-full shadow-lg opacity-0 top-1 right-1 hover:bg-red-600 group-hover:opacity-100'
                          title={
                            p.isExisting
                              ? 'Remove from view (will keep existing)'
                              : 'Remove new image'
                          }
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className='mt-1 text-xs text-muted-foreground'>
                {inspectionPreviews.filter(p => p.isExisting).length} existing +{' '}
                {inspectionFiles.length} new ={' '}
                {inspectionPreviews.filter(p => p.isExisting).length +
                  inspectionFiles.length}
                /10 images • Max 10MB per image
              </p>
            </div>
            <div>
              <Label className='block mb-2'>Damage Notes (if any)</Label>
              <Textarea
                rows={4}
                value={damageNotes}
                onChange={handleDamageNotesChange}
                placeholder='Describe any existing damages...'
                disabled={isFieldsDisabled}
                className={validationErrors.damageNotes ? 'border-red-500' : ''}
              />
              {validationErrors.damageNotes && (
                <p className='mt-1 text-xs text-red-500'>
                  {validationErrors.damageNotes}
                </p>
              )}
              <p className='mt-1 text-xs text-muted-foreground'>
                {damageNotes.length}/1000 characters
              </p>
            </div>
          </div>

          <div>
            <Label className='block mb-2'>Additional Notes</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={handleNotesChange}
              placeholder='Any other notes for this check-in...'
              disabled={isFieldsDisabled}
              className={validationErrors.notes ? 'border-red-500' : ''}
            />
            {validationErrors.notes && (
              <p className='mt-1 text-xs text-red-500'>
                {validationErrors.notes}
              </p>
            )}
            <p className='mt-1 text-xs text-muted-foreground'>
              {notes.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Document Verification</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {loadingDocuments && (
            <div className='text-sm text-slate-500'>
              Loading customer documents...
            </div>
          )}

          {customerDocuments && (
            <div className='p-4 mb-4 border rounded bg-slate-50 dark:bg-slate-900/30'>
              <h4 className='mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                📄 Customer Documents (Approved)
              </h4>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {customerDocuments.identityCard && (
                  <div className='p-4 bg-white border rounded-lg shadow-sm dark:bg-slate-800'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='flex items-center justify-center w-8 h-8 rounded bg-slate-100 dark:bg-slate-700'>
                        <span className='text-lg'>📄</span>
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                          ID Card
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          Uploaded: 10/9/2025
                        </p>
                      </div>
                      <span className='inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 rounded-full bg-green-50 dark:bg-green-900/30 dark:text-green-400'>
                        <svg
                          className='w-3 h-3'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Approved
                      </span>
                    </div>

                    <div className='relative w-full h-56 mb-3 overflow-hidden rounded-lg bg-linear-to-br from-muted/30 to-muted/50'>
                      {customerDocuments.identityCard ? (
                        <img
                          src={customerDocuments.identityCard}
                          alt='Customer ID Card'
                          className='object-contain w-full h-full'
                          onLoad={e => {
                            console.log(
                              '✅ ID Card loaded successfully:',
                              e.target.naturalWidth,
                              'x',
                              e.target.naturalHeight
                            );
                          }}
                          onError={e => {
                            console.error(
                              '❌ Failed to load ID Card:',
                              customerDocuments.identityCard
                            );
                            e.target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className =
                              'flex items-center justify-center w-full h-full';
                            errorDiv.innerHTML =
                              '<p class="text-red-500 text-sm">Failed to load image</p>';
                            e.target.parentElement.appendChild(errorDiv);
                          }}
                        />
                      ) : (
                        <div className='flex items-center justify-center w-full h-full'>
                          <p className='text-sm text-gray-500'>No image</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        window.open(customerDocuments.identityCard, '_blank')
                      }
                      className='flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                      View
                    </button>
                  </div>
                )}

                {customerDocuments.drivingLicense && (
                  <div className='p-4 bg-white border rounded-lg shadow-sm dark:bg-slate-800'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='flex items-center justify-center w-8 h-8 rounded bg-slate-100 dark:bg-slate-700'>
                        <span className='text-lg'>📄</span>
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                          Driver's License
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          Uploaded: 10/9/2025
                        </p>
                      </div>
                      <span className='inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 rounded-full bg-green-50 dark:bg-green-900/30 dark:text-green-400'>
                        <svg
                          className='w-3 h-3'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Approved
                      </span>
                    </div>

                    <div className='relative w-full h-56 mb-3 overflow-hidden rounded-lg bg-linear-to-br from-muted/30 to-muted/50'>
                      {customerDocuments.drivingLicense ? (
                        <img
                          src={customerDocuments.drivingLicense}
                          alt='Customer Driving License'
                          className='object-contain w-full h-full'
                          onLoad={e => {
                            console.log(
                              '✅ Driving License loaded successfully:',
                              e.target.naturalWidth,
                              'x',
                              e.target.naturalHeight
                            );
                          }}
                          onError={e => {
                            console.error(
                              '❌ Failed to load Driving License:',
                              customerDocuments.drivingLicense
                            );
                            e.target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className =
                              'flex items-center justify-center w-full h-full';
                            errorDiv.innerHTML =
                              '<p class="text-red-500 text-sm">Failed to load image</p>';
                            e.target.parentElement.appendChild(errorDiv);
                          }}
                        />
                      ) : (
                        <div className='flex items-center justify-center w-full h-full'>
                          <p className='text-sm text-gray-500'>No image</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        window.open(customerDocuments.drivingLicense, '_blank')
                      }
                      className='flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                      View
                    </button>
                  </div>
                )}

                {customerDocuments.passport && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>🛂 Passport</p>
                    <div className='relative overflow-hidden transition-colors border-2 rounded-lg cursor-pointer bg-card hover:border-primary group min-h-48'>
                      {customerDocuments.passport ? (
                        <>
                          <img
                            src={customerDocuments.passport}
                            alt='Customer Passport'
                            className='object-contain w-full h-48 bg-white'
                            onClick={() =>
                              window.open(customerDocuments.passport, '_blank')
                            }
                            onError={e => {
                              console.error(
                                'Failed to load Passport image:',
                                customerDocuments.passport
                              );
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23f0f0f0" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className='absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 group-hover:bg-opacity-10'>
                            <span className='text-sm font-medium text-white opacity-0 group-hover:opacity-100'>
                              Click to enlarge
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className='flex items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-800'>
                          <p className='text-sm text-gray-500'>No image URL</p>
                        </div>
                      )}
                    </div>
                    <p className='text-xs text-gray-500 break-all'>
                      URL: {customerDocuments.passport?.substring(0, 50)}...
                    </p>
                  </div>
                )}

                {!customerDocuments.identityCard &&
                  !customerDocuments.drivingLicense &&
                  !customerDocuments.passport && (
                    <div className='col-span-2 p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
                      <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                        ⚠️ No approved documents
                      </p>
                      <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                        Customer has not uploaded or verified documents yet.
                      </p>
                    </div>
                  )}

                {/* ⚠️ Smart Warning: Missing ID_CARD or DRIVERS_LICENSE */}
                {(customerDocuments.identityCard ||
                  customerDocuments.drivingLicense) &&
                  (!customerDocuments.identityCard ||
                    !customerDocuments.drivingLicense) && (
                    <div className='col-span-2 p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
                      <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
                        ⚠️ Missing Required Document
                      </p>
                      <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                        {!customerDocuments.identityCard &&
                          customerDocuments.drivingLicense && (
                            <>
                              Please upload <strong>ID Card (CCCD)</strong>{' '}
                              before check-in.
                            </>
                          )}
                        {customerDocuments.identityCard &&
                          !customerDocuments.drivingLicense && (
                            <>
                              Please upload{' '}
                              <strong>Driver's License (GPLX)</strong> before
                              check-in.
                            </>
                          )}
                      </p>

                      {/* 📤 Upload Form for Missing Document */}
                      <div className='p-3 mt-3 space-y-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'>
                        <p className='text-xs font-semibold text-blue-600 dark:text-blue-400'>
                          📤 Upload Missing Document
                        </p>
                        <div className='flex flex-col gap-3'>
                          <div className='flex items-center gap-2'>
                            <label className='w-32 text-xs font-medium text-gray-700 dark:text-gray-300'>
                              Document Type:
                            </label>
                            <select
                              value={docType}
                              onChange={e => setDocType(e.target.value)}
                              className='flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800'
                            >
                              <option value='ID_CARD'>ID Card / CCCD</option>
                              <option value='DRIVERS_LICENSE'>
                                Driver's License / GPLX
                              </option>
                              <option value='PASSPORT'>Passport</option>
                            </select>
                          </div>
                          <div className='flex items-center gap-2'>
                            <label className='w-32 text-xs font-medium text-gray-700 dark:text-gray-300'>
                              Choose File:
                            </label>
                            <input
                              type='file'
                              accept='image/jpeg,image/jpg,image/png,image/webp'
                              onChange={e =>
                                setDocFile(e.target.files?.[0] || null)
                              }
                              className='flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200'
                            />
                          </div>
                          {docFile && (
                            <p className='text-xs text-green-600 dark:text-green-400'>
                              ✓ Selected: {docFile.name} (
                              {(docFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          <Button
                            size='sm'
                            onClick={handleUploadCustomerDocument}
                            disabled={!docFile || loadingDocuments}
                            className='w-full'
                          >
                            {loadingDocuments
                              ? 'Uploading...'
                              : '📤 Upload & Auto-Verify'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {!customerDocuments && !loadingDocuments && booking && (
            <div className='p-4 mb-4 border rounded-lg bg-muted/50'>
              <p className='text-sm font-medium'>📂 No documents found</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                This customer hasn't uploaded any documents yet.
              </p>

              {/* ⚠️ Smart Missing Document Warning */}
              <div className='p-3 mt-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
                <p className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
                  ⚠️ Required Documents Missing
                </p>
                <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
                  Please upload both <strong>ID Card (CCCD)</strong> and{' '}
                  <strong>Driver's License (GPLX)</strong> before check-in.
                </p>
              </div>

              {/* ✅ ENABLED - Staff can upload documents on behalf of customer */}
              {needsDocumentUpload && (
                <div className='mt-4 space-y-3'>
                  <p className='text-xs font-semibold text-blue-600 dark:text-blue-400'>
                    📤 Upload customer documents
                  </p>
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center gap-2'>
                      <label className='w-32 text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Document Type:
                      </label>
                      <select
                        value={docType}
                        onChange={e => setDocType(e.target.value)}
                        className='flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800'
                      >
                        <option value='ID_CARD'>ID Card / CCCD</option>
                        <option value='DRIVERS_LICENSE'>
                          Driver's License / GPLX
                        </option>
                        <option value='PASSPORT'>Passport</option>
                      </select>
                    </div>
                    <div className='flex items-center gap-2'>
                      <label className='w-32 text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Choose File:
                      </label>
                      <input
                        type='file'
                        accept='image/jpeg,image/jpg,image/png,image/webp'
                        onChange={e => setDocFile(e.target.files?.[0] || null)}
                        className='flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                      />
                    </div>
                    {docFile && (
                      <p className='text-xs text-green-600 dark:text-green-400'>
                        ✓ Selected: {docFile.name} (
                        {(docFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <Button
                      size='sm'
                      onClick={handleUploadCustomerDocument}
                      disabled={!docFile || loadingDocuments}
                      className='w-full'
                    >
                      {loadingDocuments
                        ? 'Uploading...'
                        : '📤 Upload & Auto-Verify'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Staff instruction */}
              <div className='p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'>
                <p className='text-sm font-semibold text-blue-900 dark:text-blue-200'>
                  📋 Staff Instructions
                </p>
                <p className='mt-1 text-xs text-blue-700 dark:text-blue-300'>
                  Upload customer's ID/License documents above. The document
                  will be automatically verified after upload.
                </p>
              </div>
            </div>
          )}

          {/* ✅ Chỉ hiện checkbox nếu customer ĐÃ CÓ approved documents */}
          {customerDocuments && (
            <>
              <div className='flex items-center gap-2 text-sm'>
                <input
                  id='doc_verified'
                  type='checkbox'
                  checked={documentVerified}
                  onChange={handleToggleDocumentVerified}
                  disabled={isFieldsDisabled || loadingDocuments}
                />
                <Label htmlFor='doc_verified' className='cursor-pointer'>
                  I have verified customer's ID and driving license{' '}
                  <span className='text-red-500'>*</span>
                </Label>
              </div>
              <p className='text-xs text-muted-foreground'>
                Required: Check customer's identity documents before handing
                over vehicle.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode
              ? 'Update Inspection'
              : isViewMode
              ? 'View Inspection'
              : 'Complete Check-In'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* ⚠️ Validation Status Warning */}
          {!isEditMode && !isViewMode && validationErrorsCount > 0 && (
            <div className='p-4 border-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'>
              <div className='flex items-start gap-3'>
                <span className='text-2xl'>⚠️</span>
                <div className='flex-1'>
                  <p className='font-semibold text-amber-900 dark:text-amber-200'>
                    {validationErrorsCount} Required{' '}
                    {validationErrorsCount === 1 ? 'Field' : 'Fields'} Missing
                  </p>
                  <p className='mt-1 text-sm text-amber-700 dark:text-amber-300'>
                    Please complete all required fields before proceeding with
                    check-in. Click "Complete Check-In" to see detailed
                    validation errors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Ready to Check-In Status */}
          {!isEditMode &&
            !isViewMode &&
            validationErrorsCount === 0 &&
            booking && (
              <div className='p-4 border-2 border-green-300 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700'>
                <div className='flex items-start gap-3'>
                  <span className='text-2xl'>✅</span>
                  <div className='flex-1'>
                    <p className='font-semibold text-green-900 dark:text-green-200'>
                      Ready to Check-In
                    </p>
                    <p className='mt-1 text-sm text-green-700 dark:text-green-300'>
                      All required fields are complete. You can now proceed with
                      vehicle check-in.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1'>
              <p className='text-sm text-muted-foreground'>
                {isEditMode
                  ? 'Modify the inspection details and save changes.'
                  : isViewMode
                  ? 'Viewing existing inspection record. Click Edit to modify.'
                  : 'Review all information and complete vehicle check-in process.'}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={resetAllFields}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              {!isViewMode && (
                <Button
                  onClick={handleCreateInspection}
                  disabled={isSubmitDisabled}
                  className={
                    validationErrorsCount > 0 && !isEditMode ? 'relative' : ''
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className='mr-2'>⏳</span>
                      Processing...
                    </>
                  ) : isEditMode ? (
                    'Save Changes'
                  ) : (
                    <>
                      {validationErrorsCount > 0 && (
                        <span className='inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-white bg-red-500 rounded-full'>
                          {validationErrorsCount}
                        </span>
                      )}
                      Complete Check-In
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={checkInSummaryOpen} onOpenChange={setCheckInSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Inspection Created</DialogTitle>
            <DialogDescription>
              Vehicle inspection record has been created successfully.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {checkInSummary?.customerName && (
              <div>
                <p className='text-sm text-muted-foreground'>Customer</p>
                <p className='font-medium'>{checkInSummary.customerName}</p>
              </div>
            )}
            {checkInSummary?.vehicleLabel && (
              <div>
                <p className='text-sm text-muted-foreground'>Vehicle</p>
                <p className='font-medium'>{checkInSummary.vehicleLabel}</p>
              </div>
            )}
            {(checkInSummary?.staffInfo?.name || user?.name) && (
              <div>
                <p className='text-sm text-muted-foreground'>Inspected by</p>
                <p className='font-medium'>
                  {checkInSummary?.staffInfo?.name || user?.name}
                </p>
              </div>
            )}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Odometer Reading
                </p>
                <p className='font-medium'>
                  {checkInSummary?.mileage?.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Battery Level</p>
                <p className='font-medium'>{checkInSummary?.batteryLevel}%</p>
              </div>
            </div>
            {checkInSummary?.actualStartTime && (
              <div>
                <p className='text-sm text-muted-foreground'>Inspection Time</p>
                <p className='font-medium'>
                  {new Date(checkInSummary.actualStartTime).toLocaleString()}
                </p>
              </div>
            )}
            <div className='pt-2 border-t'>
              <p className='text-sm text-green-600'>
                Inspection record created successfully
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCheckInSummaryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ⚠️ Contract Upload Modal */}
      <CreateContractModal
        booking={booking}
        existingContract={existingContract}
        isOpen={showContractModal}
        onClose={() => {
          setShowContractModal(false);
          // Don't reset booking - keep it selected so user can continue check-in
        }}
        onSuccess={async () => {
          // Refresh contract status
          if (bookingId) {
            await fetchBookingContracts(bookingId);
          }
          setShowContractModal(false);

          // Continue with check-in setup after contract upload
          if (booking) {
            const renterId =
              booking?.renters?.id ||
              booking?.renters ||
              booking?.user?.id ||
              booking?.userId;
            if (renterId) {
              await fetchCustomerDocuments(renterId);
            }
          }

          toast.success('Contract uploaded! You can now proceed with check-in');
        }}
      />
    </div>
  );
}
