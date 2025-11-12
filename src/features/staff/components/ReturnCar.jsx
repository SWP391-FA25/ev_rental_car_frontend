import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';

import { bookingService } from '../../booking/services/bookingService';
import { useBooking } from '../../booking/hooks/useBooking';
import { paymentService } from '../../payment/services/paymentService';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Badge } from '../../shared/components/ui/badge';
import { Textarea } from '../../shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { Combobox } from '@/features/shared/components/ui/combobox';
import { stationService } from '../../cars/services/stationService';
import { toast } from '../../shared/lib/toast';
import { formatCurrency } from '@/features/shared/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { CreditCard } from 'lucide-react';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

/**
 * Staff Return Car UI
 * Implements the swimlane: Inspect car  (Upload incident | Refund deposit)  Calculate deposit/refund  Update booking & car
 * This is UI-focused with mock-friendly API calls.
 */
export default function ReturnCar() {
  const { t } = useTranslation();
  const { getAllBookings, getBookingById } = useBooking();
  const { user } = useAuth();
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [checklist, setChecklist] = useState({
    exterior: false,
    interior: false,
  });
  const [incidentFiles, setIncidentFiles] = useState([]);
  const [incidentPreviews, setIncidentPreviews] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [inspectionImages, setInspectionImages] = useState([]);

  const fileInputRef = useRef(null);
  const [hasIncident, setHasIncident] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(null);
  // Modal hiển thị tổng tiền và pricing của xe sau khi hoàn tất
  const [returnSummaryOpen, setReturnSummaryOpen] = useState(false);
  const [returnSummary, setReturnSummary] = useState(null);
  // Payment loading state
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Chọn phương thức thanh toán: ONLINE hoặc CASH
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  // Dialog upload bằng chứng thanh toán tiền mặt
  const [cashEvidenceOpen, setCashEvidenceOpen] = useState(false);
  const [cashEvidenceFile, setCashEvidenceFile] = useState(null);
  const [cashPaymentLoading, setCashPaymentLoading] = useState(false);
  // Payload lưu lại để hoàn tất sau khi thanh toán
  const [pendingCompletionPayload, setPendingCompletionPayload] =
    useState(null);
  // Checkbox: đã xử lí tiền cọc
  const [depositHandled, setDepositHandled] = useState(false);
  // Return details per schema
  const [returnOdometer, setReturnOdometer] = useState('');
  // Actual return station selection
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedReturnStationId, setSelectedReturnStationId] = useState('');
  // Staff assignment-based restriction
  const [assignedStationIds, setAssignedStationIds] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [notes, setNotes] = useState('');
  const [lastRecordedOdometer, setLastRecordedOdometer] = useState(null);
  const [odoError, setOdoError] = useState('');
  const [showOdoValidation, setShowOdoValidation] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [completeError, setCompleteError] = useState('');
  // Added: battery level & tire condition states
  const [batteryLevel, setBatteryLevel] = useState('');
  const [batteryError, setBatteryError] = useState('');
  const [tireCondition, setTireCondition] = useState('');
  const MAX_ODOMETER_DIFF = 1000;
  const isOverdue = useMemo(() => {
    const deadline = booking?.endTime ? new Date(booking.endTime) : null;
    if (!deadline) return false;
    return new Date() > deadline;
  }, [booking]);

  // Fetch eligible bookings: rentals currently in progress or confirmed
  useEffect(() => {
    const fetchEligible = async () => {
      try {
        setLoadingBookings(true);
        const resData = await getAllBookings({ limit: 100 });
        const list = (resData?.bookings || resData || []).filter(b => {
          const status = b.status || b.bookingStatus || '';
          return status === 'IN_PROGRESS';
        });
        setEligibleBookings(list);
      } catch (err) {
        console.error('Fetch eligible bookings error', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchEligible();
  }, [getAllBookings]);

  // Initialize batteryLevel from booking data if available
  useEffect(() => {
    const initial = booking?.vehicle?.batteryLevel ?? booking?.batteryLevel;
    if (typeof initial === 'number' && !Number.isNaN(initial)) {
      const rounded = Math.round(Math.max(0, Math.min(100, initial)));
      setBatteryLevel(String(rounded));
      setBatteryError('');
    }
  }, [booking]);

  const handleSelectBooking = async value => {
    setBookingId(value);
    setBookingError('');
    setLocationError('');
    setCompleteError('');
    try {
      const res = await getBookingById(value);
      const b = res?.booking || res?.data?.booking || null;
      setBooking(b);
      // Initialize totalAmount from booking if available
      setTotalAmount(
        typeof b?.totalAmount !== 'undefined' ? b.totalAmount : null
      );
      // Default to pickup station if present
      const defaultStationId = b?.pickupStation?.id
        ? String(b.pickupStation.id)
        : '';
      setSelectedReturnStationId(defaultStationId);
      // Fetch last recorded odometer from inspections by vehicle
      try {
        const vehId = b?.vehicle?.id || b?.vehicleId;
        if (vehId) {
          const inspRes = await apiClient.get(
            endpoints.inspections.getByVehicle(vehId)
          );
          const data = inspRes?.data;
          const list = Array.isArray(data?.inspections)
            ? data.inspections
            : Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          const sorted = [...list].sort(
            (a, c) => new Date(c?.createdAt || 0) - new Date(a?.createdAt || 0)
          );
          const latest = sorted.find(
            i =>
              typeof i?.mileage === 'number' || typeof i?.odometer === 'number'
          );
          const latestOdo =
            typeof latest?.mileage === 'number'
              ? latest.mileage
              : typeof latest?.odometer === 'number'
              ? latest.odometer
              : null;
          setLastRecordedOdometer(
            latestOdo != null
              ? latestOdo
              : typeof b?.pickupOdometer === 'number'
              ? b.pickupOdometer
              : null
          );
        } else {
          setLastRecordedOdometer(
            typeof b?.pickupOdometer === 'number' ? b.pickupOdometer : null
          );
        }
      } catch {
        setLastRecordedOdometer(
          typeof b?.pickupOdometer === 'number' ? b.pickupOdometer : null
        );
      }
    } catch (e) {
      setBookingError(e?.message || t('staffReturnCar.toast.loadBookingFail'));
    }
  };

  const handleChecklistChange = key => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFiles = e => {
    const files = Array.from(e.target.files || []);
    setIncidentFiles(prev => [...prev, ...files]);
    setImageUploadError('');
  };

  // Add: remove selected incident image (client-side)
  const removeIncidentImage = idx => {
    setIncidentFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Generate preview URLs for selected images
  useEffect(() => {
    const previews = [];
    (incidentFiles || []).forEach((f, i) => {
      if (f && f.type && f.type.startsWith('image/')) {
        previews.push({ url: URL.createObjectURL(f), name: f.name, index: i });
      }
    });
    setIncidentPreviews(previews);
    return () => {
      previews.forEach(p => {
        try {
          URL.revokeObjectURL(p.url);
        } catch (e) {
          console.error('Error revoking URL for preview:', p.url, e);
        }
      });
    };
  }, [incidentFiles]);

  // Reset dữ liệu sự cố khi người dùng chọn "không có hư hại"
  useEffect(() => {
    if (!hasIncident) {
      setIncidentFiles([]);
      setIncidentPreviews([]);
      setIncidentNotes('');
      setImageUploadError('');
      setChecklist({ exterior: false, interior: false });
      // setLastRecordedOdometer(null); // removed: giữ lại Odo gần nhất theo booking
    }
  }, [hasIncident]);

  // Load stations for dropdown
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoadingStations(true);
        const response = await stationService.getAllStations();
        const list = response?.data?.stations || response?.data || [];
        setStations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load stations:', err);
        setLocationError(t('staffReturnCar.toast.loadStationsFail'));
      } finally {
        setLoadingStations(false);
      }
    };
    loadStations();
  }, [t]);

  // Load staff assignments to enforce allowed stations
  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      try {
        setLoadingAssignments(true);
        const res = await apiClient.get(
          endpoints.assignments.getByStaffId(user.id)
        );
        const payload = res?.data;
        // Support both list and single assignment response shapes
        let raw = [];
        if (Array.isArray(payload?.assignments)) {
          raw = payload.assignments;
        } else if (
          payload?.assignment &&
          typeof payload.assignment === 'object'
        ) {
          raw = [payload.assignment];
        } else if (Array.isArray(payload)) {
          raw = payload;
        } else if (Array.isArray(payload?.items)) {
          raw = payload.items;
        }

        const ids = raw
          .map(a => a?.station?.id ?? a?.stationId)
          .filter(Boolean)
          .map(id => String(id));
        const uniqueIds = Array.from(new Set(ids));
        setAssignedStationIds(uniqueIds);

        if (!uniqueIds.length) {
          setLocationError(
            'Bạn chưa được phân công trạm. Vui lòng liên hệ quản trị.'
          );
        } else {
          setLocationError('');
        }
        setAssignmentError('');
      } catch (err) {
        console.error('Failed to load staff assignments:', err);
        setAssignmentError('Unable to load staff station assignments');
      } finally {
        setLoadingAssignments(false);
      }
    };
    loadAssignments();
  }, [user?.id]);

  // Derive allowed station list from assignments
  const allowedStations = useMemo(() => {
    const base = Array.isArray(stations) ? stations : [];
    if (!assignedStationIds?.length) return [];
    return base.filter(s => assignedStationIds.includes(String(s.id)));
  }, [stations, assignedStationIds]);

  // Keep selection valid within allowed stations
  useEffect(() => {
    if (!allowedStations.length) {
      setSelectedReturnStationId('');
      return;
    }
    const isSelectedAllowed = allowedStations.some(
      s => String(s.id) === String(selectedReturnStationId)
    );
    if (!isSelectedAllowed) {
      // Prefer booking's pickup station if allowed, else first allowed
      const pickupId = booking?.pickupStation?.id
        ? String(booking.pickupStation.id)
        : '';
      const fallback = allowedStations[0]?.id
        ? String(allowedStations[0].id)
        : '';
      const nextId = allowedStations.some(s => String(s.id) === pickupId)
        ? pickupId
        : fallback;
      setSelectedReturnStationId(nextId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedStations, booking?.pickupStation?.id]);

  // Helper: reset all fields to initial state
  const resetAllFields = () => {
    setBookingId('');
    setBooking(null);
    setEligibleBookings(prev => prev.filter(b => b.status === 'IN_PROGRESS'));
    setChecklist({
      exterior: false,
      interior: false,
    });
    setIncidentFiles([]);
    setIncidentNotes('');
    setReturnOdometer('');
    setSelectedReturnStationId('');
    setNotes('');
    setTotalAmount(null);
    setLastRecordedOdometer(null);
    setOdoError('');
    setShowOdoValidation(false);
    setBookingError('');
    setLocationError('');
    setCompleteError('');
    setBatteryLevel('');
    setBatteryError('');
    setTireCondition('');
    setDepositHandled(false);
  };

  // Inline validation helper cho Odo
  const getOdoError = useCallback(
    (value, currentBooking) => {
      const odo = Number(value);
      if (!value || Number.isNaN(odo) || odo < 0) {
        return t('staffReturnCar.toast.invalidReturnOdometer');
      }
      const pickup = Number(currentBooking?.pickupOdometer);
      const baseMin =
        typeof lastRecordedOdometer === 'number'
          ? lastRecordedOdometer
          : Number.isFinite(pickup)
          ? pickup
          : undefined;

      if (typeof baseMin === 'number') {
        if (odo < baseMin) {
          return t('staffReturnCar.toast.invalidReturnOdometerMin', {
            pickup: baseMin,
          });
        }
        const diffBase = Number.isFinite(pickup) ? pickup : baseMin;
        if (odo - diffBase > MAX_ODOMETER_DIFF) {
          return t('staffReturnCar.toast.invalidReturnOdometerRange', {
            max: MAX_ODOMETER_DIFF,
          });
        }
      }
      return '';
    },
    [t, lastRecordedOdometer]
  );
  // Đồng bộ lỗi odo khi giá trị hoặc booking thay đổi
  useEffect(() => {
    setOdoError(getOdoError(returnOdometer, booking));
  }, [returnOdometer, booking, getOdoError]);

  // Upload incident images directly to the inspection using new API
  const uploadInspectionImages = async inspectionId => {
    try {
      const imageFiles = (incidentFiles || []).filter(
        f => f && f.type && f.type.startsWith('image/')
      );
      if (!inspectionId || !imageFiles.length) return [];

      // Warn for oversize to reduce server errors (backend caps ~5MB/file)
      const MAX_SIZE = 5 * 1024 * 1024;
      const validFiles = imageFiles.filter(f => {
        if (f.size > MAX_SIZE) {
          setImageUploadError(
            t('staffReturnCar.toast.imageTooLarge', { name: f.name })
          );

          return false;
        }
        return true;
      });

      const uploadResults = [];

      console.log(inspectionId);

      // Upload to inspection endpoint, one file per request
      for (const file of validFiles) {
        try {
          const fd = new FormData();
          fd.append('image', file);
          const res = await apiClient.post(
            endpoints.inspections.uploadImage(inspectionId),
            fd,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          const imgs = res?.data?.images ?? [];
          for (const it of imgs) {
            uploadResults.push({
              url: it?.url,
              thumbnailUrl: it?.thumbnailUrl,
              fileId: it?.fileId || it?.imageKitFileId,
              fileName: it?.fileName || file.name,
            });
          }
        } catch (uploadError) {
          console.warn(
            'Upload inspection image failed:',
            uploadError?.message || uploadError
          );
        }
      }

      // Cập nhật state inspectionImages với kết quả upload
      const normalized = (uploadResults || [])
        .map(u => {
          const base = u?.data ? u.data : u;
          return {
            url: base?.url,
            thumbnailUrl: base?.thumbnailUrl,
            fileId: base?.fileId,
          };
        })
        .filter(x => x && (x.url || x.thumbnailUrl));
      if (normalized.length) {
        setInspectionImages(prev => {
          const next = [...prev];
          for (const ni of normalized) {
            const exists = next.some(
              m =>
                (ni.fileId && m.fileId === ni.fileId) ||
                (!ni.fileId && m.url === ni.url)
            );
            if (!exists) next.push(ni);
          }
          return next;
        });
      }
      return uploadResults;
    } catch (err) {
      console.warn('Upload inspection images error:', err?.message || err);
      return [];
    }
  };

  const handleCompleteReturn = async () => {
    if (!booking && !bookingId) {
      setBookingError(t('staffReturnCar.toast.selectBooking'));
      return;
    }

    const actualEndTime = new Date().toISOString();
    // Derive location string from selected station (match by id)
    const selectedStation = stations.find(
      s => String(s.id) === String(selectedReturnStationId)
    );
    // Gửi tên trạm hoặc id (backend hỗ trợ cả hai)
    const normalizedLocation = selectedStation
      ? String(selectedStation.name)
      : '';

    // Frontend validation to match backend requirements
    setShowOdoValidation(true);
    const odo = Number(returnOdometer);
    if (!normalizedLocation || normalizedLocation.length < 3) {
      setLocationError(t('staffReturnCar.toast.invalidReturnLocation'));
      return;
    }
    // Enforce staff can only return at assigned stations
    if (!assignedStationIds.includes(String(selectedReturnStationId))) {
      setLocationError('Bạn chỉ có thể trả xe tại các trạm được phân công');
      return;
    }
    const odoErr = getOdoError(returnOdometer, booking);
    if (odoErr) {
      setOdoError(odoErr);
      return;
    }
    setOdoError('');

    // Battery level validation 0-100
    const batteryLevelNum = Number(batteryLevel);
    if (
      batteryLevel === '' ||
      Number.isNaN(batteryLevelNum) ||
      batteryLevelNum < 0 ||
      batteryLevelNum > 100
    ) {
      setBatteryError('Battery level must be between 0 and 100');
      return;
    }
    setBatteryError('');

    // Require incident images if selected incident
    if (hasIncident && incidentFiles.length === 0) {
      setImageUploadError(t('staffReturnCar.incident.imagesRequired'));
      return;
    }

    // Flatten payload per backend completeBooking schema
    const payload = {
      actualEndTime,
      actualReturnLocation: normalizedLocation,
      returnOdometer: odo,
      notes,
      batteryLevel: Math.min(100, Math.max(0, Math.round(batteryLevelNum))),
    };

    try {
      const id = booking?.id || bookingId;
      // Tạo inspection (CHECK_IN) trước khi hoàn tất đơn thuê
      try {
        if (!user?.id) {
          setCompleteError(t('staffReturnCar.toast.missingStaff'));
          return;
        }

        // Create inspection first, then upload images via new API
        const inspectionPayload = {
          vehicleId: booking?.vehicle?.id || booking?.vehicleId,
          staffId: user?.id,
          bookingId: id,
          inspectionType: 'CHECK_OUT',
          mileage: odo,
          batteryLevel: Math.min(100, Math.max(0, Math.round(batteryLevelNum))),
          // ✅ FIX: Logic rõ ràng hơn
          exteriorCondition:
            hasIncident && !checklist.exterior ? 'POOR' : 'GOOD',
          interiorCondition:
            hasIncident && !checklist.interior ? 'POOR' : 'GOOD',
          tireCondition: tireCondition || undefined,
          damageNotes: hasIncident ? incidentNotes || undefined : undefined,
          notes: notes || undefined,
          documentVerified: false,
        };

        const inspRes = await apiClient.post(
          endpoints.inspections.create(),
          inspectionPayload
        );

        // Backend returns: { success: true, data: inspection, message: '...' }
        const createdInspection =
          inspRes?.data?.data ||
          inspRes?.data?.inspection ||
          inspRes?.data ||
          null;
        const inspectionId = createdInspection?.id;

        console.log('Inspection creation response:', inspRes?.data);
        console.log('Created inspection:', createdInspection);
        console.log('Extracted inspectionId:', inspectionId);

        if (hasIncident && incidentFiles.length && inspectionId) {
          const uploaded = await uploadInspectionImages(inspectionId);
          try {
            // Lấy images hiện có để tránh trùng lặp
            let currentImages = [];
            try {
              const getRes = await apiClient.get(
                endpoints.inspections.getById(inspectionId)
              );
              const rawImages =
                getRes?.data?.inspection?.images ??
                getRes?.data?.images ??
                getRes?.images ??
                [];
              currentImages = Array.isArray(rawImages) ? rawImages : [];
            } catch (e) {
              console.warn(
                'Fetch current inspection images error:',
                e?.message || e
              );
            }

            const normalize = imgs =>
              (Array.isArray(imgs) ? imgs : [])
                .map(img => {
                  if (typeof img === 'string') return { url: img };
                  const base = img?.data ? img.data : img;
                  return {
                    url: base?.url,
                    thumbnailUrl: base?.thumbnailUrl,
                    fileId: base?.fileId,
                    fileName: base?.fileName,
                  };
                })
                .filter(x => x && (x.url || x.thumbnailUrl));

            const merged = [...normalize(currentImages)];
            for (const ni of normalize(uploaded)) {
              const exists = merged.some(
                m =>
                  (ni.fileId && m.fileId === ni.fileId) ||
                  (!ni.fileId && m.url === ni.url)
              );
              if (!exists) merged.push(ni);
            }

            await apiClient.put(endpoints.inspections.update(inspectionId), {
              images: merged,
              isCompleted: true,
            });
            setInspectionImages(merged);
          } catch (err) {
            console.warn(
              'Update inspection images error:',
              err?.message || err
            );
            // Nếu lỗi, vẫn cố gắng đánh dấu hoàn tất
            try {
              await apiClient.put(endpoints.inspections.update(inspectionId), {
                isCompleted: true,
              });
            } catch (err2) {
              console.warn(
                'Mark inspection completed error:',
                err2?.message || err2
              );
            }
          }
        } else if (inspectionId) {
          try {
            await apiClient.put(endpoints.inspections.update(inspectionId), {
              isCompleted: true,
            });
          } catch (err) {
            console.warn(
              'Mark inspection completed error:',
              err?.message || err
            );
          }
        }
      } catch (err) {
        console.warn('Create inspection error:', err?.message || err);
        // Không chặn luồng; vẫn tiến hành hoàn tất đơn thuê
      }

      // TÍNH TỔNG TIỀN VÀ PHÍ TRẢ TRỄ TRƯỚC, KHÔNG GỌI completeBooking
      // Giữ payload để hoàn tất sau khi thanh toán
      setPendingCompletionPayload(payload);

      const vehiclePricing = booking?.vehicle?.pricing || null;
      const vehicleLabel =
        booking?.vehicle?.name || booking?.vehicle?.licensePlate || '';

      // Tính thời lượng thực tế và kế hoạch
      const actualStartDate = new Date(
        booking?.actualStartTime || booking?.startTime
      );
      const actualEndDate = new Date(actualEndTime);
      const actualDurationHours = Math.ceil(
        (actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60)
      );
      const plannedDurationMs = booking?.endTime
        ? new Date(booking.endTime).getTime() -
          new Date(booking.startTime).getTime()
        : 24 * 60 * 60 * 1000;
      const plannedDurationHours = Math.ceil(
        plannedDurationMs / (1000 * 60 * 60)
      );

      let overtimeHours = 0;
      let overtimeAmount = 0;
      if (actualDurationHours > plannedDurationHours && vehiclePricing) {
        overtimeHours = actualDurationHours - plannedDurationHours;
        // Tính basePrice cho số giờ overtime (daily + hourly)
        const fullDays = Math.floor(overtimeHours / 24);
        const remainingHours = overtimeHours % 24;
        const dailyCost = (vehiclePricing.baseRate || 0) * fullDays;
        const hourlyCost = (vehiclePricing.hourlyRate || 0) * remainingHours;
        const basePrice = dailyCost + hourlyCost;
        const effectiveHourly =
          overtimeHours > 0 ? basePrice / overtimeHours : 0;
        const OVERTIME_MULTIPLIER = 1.5; // khớp mặc định backend
        overtimeAmount =
          Math.round(
            effectiveHourly * OVERTIME_MULTIPLIER * overtimeHours * 100
          ) / 100;
      }

      const depositAmount = Number(
        (vehiclePricing && vehiclePricing.depositAmount) ??
          booking?.depositAmount ??
          0
      );
      const payable = Math.max(
        0,
        (booking?.totalAmount ?? 0) + overtimeAmount - depositAmount
      );
      setTotalAmount(payable);

      const overtime = { hours: overtimeHours, amount: overtimeAmount };
      setReturnSummary({
        bookingId: id,
        vehicleLabel,
        totalAmount: payable,
        vehiclePricing,
        depositApplied: depositAmount,
        overtime,
      });
      setReturnSummaryOpen(true);

      setCompleteError('');

      // Không reset form ngay để giữ lại dữ liệu cho bước thanh toán
    } catch (e) {
      // Hiển thị thông báo lỗi rõ ràng cho các trường hợp 400 (Validation) và 409 (Idempotent)
      const status = e?.status ?? e?.response?.status;
      const serverMsg = e?.response?.data?.message || e?.message;
      const serverErrors = e?.response?.data?.errors;

      // Nếu backend trả về chi tiết lỗi theo từng trường, hiển thị cụ thể
      if (serverErrors) {
        const locErr = serverErrors.actualReturnLocation?.msg;
        const odoErr = serverErrors.returnOdometer?.msg;
        const timeErr = serverErrors.actualEndTime?.msg;
        if (locErr) setLocationError(locErr);
        if (odoErr) {
          setOdoError(odoErr);
          setShowOdoValidation(true);
        }
        if (timeErr) setCompleteError(timeErr);
        if (locErr || odoErr || timeErr) {
          return;
        }
      }

      // Trường hợp 400 nhưng không có errors chi tiết: suy luận và hiển thị thông báo thân thiện
      if (status === 400) {
        try {
          const refStart = new Date(
            booking?.actualStartTime || booking?.startTime || 0
          );
          const end = new Date(actualEndTime);
          if (
            refStart instanceof Date &&
            !Number.isNaN(refStart.getTime()) &&
            end instanceof Date &&
            !Number.isNaN(end.getTime()) &&
            end <= refStart
          ) {
            setCompleteError(t('staffReturnCar.toast.invalidEndTime'));
            return;
          }
        } catch (e) {
          console.warn('Validate return time error:', e?.message || e);
        }
        // Fallback chung cho lỗi 400
        setCompleteError(
          serverMsg || t('staffReturnCar.toast.validationFailed')
        );
        return;
      }

      // Trường hợp 409: thao tác đã được thực hiện trước đó (idempotent)
      if (status === 409) {
        setCompleteError(t('staffReturnCar.toast.alreadyCompleted'));
        return;
      }

      // Mặc định
      setCompleteError(serverMsg || t('staffReturnCar.toast.completeFail'));
    }
  };

  // Handle payment for total amount
  const handlePayment = async () => {
    if (!returnSummary?.bookingId || !returnSummary?.totalAmount) {
      return;
    }

    try {
      setPaymentLoading(true);

      const response = await paymentService.createRentalFeePayment(
        returnSummary.bookingId,
        returnSummary.totalAmount,
        `Rental Fee ${returnSummary.bookingId.slice(-8)}`
      );
      // Support multiple response shapes from backend
      const payUrl =
        response?.checkoutUrl ||
        response?.paymentUrl ||
        response?.data?.data?.checkoutUrl ||
        response?.data?.paymentUrl;

      if (payUrl) {
        // Persist completion context so we can auto-complete after successful payment
        try {
          localStorage.setItem('completeAfterPay', '1');
          localStorage.setItem(
            'completionBookingId',
            String(returnSummary.bookingId)
          );
          // Persist basic payment context for success/cancel pages
          localStorage.setItem('lastPaymentType', 'RENTAL_FEE');
          localStorage.setItem(
            'lastBookingId',
            String(returnSummary.bookingId)
          );
          const pid =
            response?.paymentId ||
            response?.data?.data?.paymentId ||
            response?.data?.paymentId ||
            response?.id;
          if (pid) {
            localStorage.setItem('lastPaymentId', String(pid));
          }
          if (pendingCompletionPayload) {
            localStorage.setItem(
              'completionPayload',
              JSON.stringify(pendingCompletionPayload)
            );
          }
        } catch (e) {
          console.warn('localStorage unavailable:', e);
        }

        // Redirect to PayOS payment page
        window.location.href = payUrl;
      } else {
        // No payment URL returned — surface error to user
        const msg =
          response?.message ||
          response?.data?.message ||
          'Không nhận được link thanh toán từ máy chủ';
        toast.error(
          `${msg}. Please try again or check your login permissions.`
        );
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      const serverMsg = error?.response?.data?.message || error?.message;
      toast.error(
        `Tạo link thanh toán thất bại: ${serverMsg || 'Lỗi không xác định'}`
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Xử lý thanh toán tiền mặt: tạo payment và upload bằng chứng
  const handleCashSubmitEvidence = async () => {
    if (!returnSummary?.bookingId || !returnSummary?.totalAmount) {
      return;
    }
    try {
      setCashPaymentLoading(true);
      const res = await paymentService.createCashPayment(
        returnSummary.bookingId,
        returnSummary.totalAmount,
        `Rental Fee ${returnSummary.bookingId.slice(-8)}`
      );
      const paymentId =
        res?.paymentId || res?.data?.paymentId || res?.payment?.id || res?.id;

      if (paymentId && cashEvidenceFile) {
        await paymentService.uploadCashPaymentEvidence(
          paymentId,
          cashEvidenceFile
        );
        // Sau khi upload bằng chứng thành công, tiến hành hoàn tất đơn thuê
        await handleMarkCompleted();
      }

      setCashEvidenceOpen(false);
      setCashEvidenceFile(null);
    } catch (error) {
      console.error('Cash payment failed:', error);
    } finally {
      setCashPaymentLoading(false);
    }
  };

  // Mark booking completed after payment
  const handleMarkCompleted = async () => {
    const id = booking?.id || bookingId;
    if (!id || !pendingCompletionPayload) return;

    try {
      const res = await bookingService.completeBooking(id, {
        ...pendingCompletionPayload,
        depositHandled,
      });
      const updatedBooking = res?.booking;
      const pricing = res?.summary?.pricing;

      if (updatedBooking) setBooking(updatedBooking);
      if (pricing && typeof pricing.totalAmount !== 'undefined') {
        setTotalAmount(pricing.totalAmount);
      } else if (typeof updatedBooking?.totalAmount !== 'undefined') {
        setTotalAmount(updatedBooking.totalAmount);
      }

      setReturnSummaryOpen(false);
      setPendingCompletionPayload(null);
      setCompleteError('');

      // Refresh eligible bookings list to remove completed booking
      try {
        setLoadingBookings(true);
        const resData = await getAllBookings({ limit: 100 });
        const list = (resData?.bookings || resData || []).filter(b => {
          const status = b.status || b.bookingStatus || '';
          return status === 'IN_PROGRESS';
        });
        setEligibleBookings(list);
      } catch (err) {
        console.error('Refresh eligible bookings error', err);
      } finally {
        setLoadingBookings(false);
      }

      // Reset form sau khi hoàn tất
      resetAllFields();

      // Toast báo hoàn tất thành công
      toast.success(t('staffReturnCar.toast.completeSuccess'));
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message;
      setCompleteError(serverMsg || t('staffReturnCar.toast.completeFail'));
      // Toast báo lỗi khi hoàn tất thất bại
      toast.error(serverMsg || t('staffReturnCar.toast.completeFail'));
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-xl font-semibold'>{t('staffReturnCar.title')}</h2>
        <p className='text-sm text-muted-foreground'>
          {t('staffReturnCar.subtitle')}
        </p>
      </div>

      {/* Step 1: Ch?n don thu� / xe */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.booking.title')}</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='col-span-2'>
            <Label className='block mb-2'>
              {t('staffReturnCar.booking.selectLabel')}
            </Label>
            <Combobox
              value={bookingId}
              onValueChange={handleSelectBooking}
              placeholder={t('staffReturnCar.booking.selectPlaceholder')}
              searchPlaceholder={t('staffReturnCar.booking.searchPlaceholder')}
              className={
                bookingError ? 'border-red-500 focus:ring-red-500' : ''
              }
              disabled={loadingBookings}
              options={eligibleBookings.map(b => ({
                value: String(b.id),
                label: `${b.user?.name || b.customer?.name || ''} → ${t(
                  'staffReturnCar.booking.vehicle'
                )}: ${b.vehicle?.licensePlate || b.vehicle?.name || ''}`,
                searchText: [
                  b.user?.name,
                  b.customer?.name,
                  b.vehicle?.licensePlate,
                  b.vehicle?.name,
                  String(b.id),
                ]
                  .filter(Boolean)
                  .join(' '),
              }))}
            />
            {bookingError && (
              <p className='mt-1 text-xs text-red-600'>{bookingError}</p>
            )}
          </div>
          {booking && (
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.booking.depositLabel')}
              </Label>
              <Input
                type='text'
                value={formatCurrency(
                  booking?.depositAmount ?? booking?.amount?.deposit ?? 0
                )}
                readOnly
                disabled
              />
            </div>
          )}

          {booking && (
            <div className='grid grid-cols-1 gap-4 p-4 border rounded md:col-span-3 md:grid-cols-4'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.booking.customer')}
                </p>
                <p className='font-medium'>
                  {booking.user?.name || booking.renter?.name || ''}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.booking.vehicle')}
                </p>
                <p className='font-medium'>
                  {booking.vehicle?.name || booking.vehicle?.licensePlate || ''}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.booking.time')}
                </p>
                <p className='font-medium'>
                  {(() => {
                    const startStr = booking.startTime
                      ? new Date(booking.startTime).toLocaleString()
                      : '';
                    const endStr = booking.endTime
                      ? new Date(booking.endTime).toLocaleString()
                      : '';
                    const [sPre, sRest] = (() => {
                      const parts = startStr.split(',');
                      return [
                        parts[0] || '',
                        parts.length > 1 ? parts.slice(1).join(',').trim() : '',
                      ];
                    })();
                    const [ePre, eRest] = (() => {
                      const parts = endStr.split(',');
                      return [
                        parts[0] || '',
                        parts.length > 1 ? parts.slice(1).join(',').trim() : '',
                      ];
                    })();
                    const arrowPrefix =
                      (sPre.length >= ePre.length ? sPre : ePre) + ', ';
                    return (
                      <>
                        {startStr && (
                          <>
                            <span>
                              {sPre}
                              {sRest ? ', ' + sRest : ''}
                            </span>
                            <br />
                            <span className='inline-block'>
                              <span className='invisible'>{arrowPrefix}</span>↓
                            </span>
                            <br />
                          </>
                        )}
                        <span>
                          {ePre}
                          {eRest ? ', ' + eRest : ''}
                        </span>
                        {isOverdue && (
                          <Badge variant='destructive' className='ml-2'>
                            {t('staffReturnCar.booking.overdue')}
                          </Badge>
                        )}
                      </>
                    );
                  })()}
                </p>
              </div>
              {(totalAmount ?? booking?.totalAmount) != null && (
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('staffReturnCar.booking.totalLabel')}
                  </p>
                  <p className='font-medium'>
                    {formatCurrency(totalAmount ?? booking?.totalAmount ?? 0)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2b: Th�ng tin tr? xe theo schema */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.returnDetails.title')}</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.returnDetails.odometer')}
            </Label>
            <Input
              type='number'
              value={returnOdometer}
              onChange={e => {
                const v = e.target.value;
                setReturnOdometer(v);
                setOdoError(getOdoError(v, booking));
              }}
              placeholder={t(
                'staffReturnCar.returnDetails.odometerPlaceholder'
              )}
              aria-invalid={showOdoValidation && !!odoError}
              className={
                showOdoValidation && odoError
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
              }
            />
            {showOdoValidation && odoError && (
              <p className='mt-1 text-xs text-red-600'>{odoError}</p>
            )}
            <div className='mt-1 text-xs text-muted-foreground'>
              {t('staffReturnCar.returnDetails.lastRecordedLabel', {
                value:
                  typeof lastRecordedOdometer === 'number'
                    ? lastRecordedOdometer
                    : t('booking.details.na'),
              })}
            </div>
          </div>
          <div className='md:col-span-2'>
            <Label className='block mb-2'>
              {t('staffReturnCar.returnDetails.location')}
            </Label>
            <Combobox
              value={selectedReturnStationId}
              onValueChange={value => {
                setSelectedReturnStationId(value);
                setLocationError('');
                setCompleteError('');
              }}
              placeholder={t(
                'staffReturnCar.returnDetails.locationPlaceholder'
              )}
              searchPlaceholder={t(
                'staffReturnCar.returnDetails.searchStationPlaceholder'
              )}
              className={
                locationError ? 'border-red-500 focus:ring-red-500' : ''
              }
              disabled={loadingStations || loadingAssignments}
              options={allowedStations.map(station => ({
                value: String(station.id),
                label: station.name || station.address || String(station.id),
                searchText: [
                  station.name,
                  station.address,
                  station.code,
                  station.city,
                  station.district,
                  station.province,
                  String(station.id),
                ]
                  .filter(Boolean)
                  .join(' '),
              }))}
            />
            {locationError && (
              <p className='mt-1 text-xs text-red-600'>{locationError}</p>
            )}
            {assignmentError && (
              <p className='mt-1 text-xs text-red-600'>{assignmentError}</p>
            )}
          </div>
          <div className='md:col-span-3'>
            <Label className='block mb-2'>
              {t('staffReturnCar.returnDetails.notes')}
            </Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('staffReturnCar.returnDetails.notesPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Ki?m tra xe */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.inspection.title')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Dropdown ch?n k?t qu?a ki?m tra */}
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.inspection.resultLabel')}
              </Label>
              <Select
                value={hasIncident ? 'ISSUE' : 'PASS'}
                onValueChange={val => setHasIncident(val === 'ISSUE')}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'staffReturnCar.inspection.resultPlaceholder'
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PASS'>
                    {t('staffReturnCar.inspection.pass')}
                  </SelectItem>
                  <SelectItem value='ISSUE'>
                    {t('staffReturnCar.inspection.issue')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* M?c pin (%) */}
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.inspection.batteryLabel')} (%)
              </Label>
              <Input
                type='number'
                min={0}
                max={100}
                value={batteryLevel}
                onChange={e => {
                  setBatteryLevel(e.target.value);
                  setBatteryError('');
                }}
                placeholder={t('staffReturnCar.inspection.batteryPlaceholder')}
                aria-invalid={!!batteryError}
                className={
                  batteryError
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
              {batteryError && (
                <p className='mt-1 text-xs text-red-600'>{batteryError}</p>
              )}
            </div>

            {/* T?nh tr?ng l?p */}
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.inspection.tireLabel')}
              </Label>
              <Select
                value={tireCondition || ''}
                onValueChange={val => setTireCondition(val)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('staffReturnCar.inspection.tirePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOD'>
                    {t('staffReturnCar.inspection.tireGood')}
                  </SelectItem>
                  <SelectItem value='FAIR'>
                    {t('staffReturnCar.inspection.tireFair')}
                  </SelectItem>
                  <SelectItem value='POOR'>
                    {t('staffReturnCar.inspection.tirePoor')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checklist ch? hi?n th?n th? khi c? s? c?o */}
            {hasIncident && (
              <div className='grid grid-cols-2 gap-3 md:col-span-3'>
                {Object.entries(checklist).map(([key, val]) => {
                  const id = `chk_${key}`;
                  return (
                    <div key={key} className='flex items-center gap-2 text-sm'>
                      <input
                        id={id}
                        type='checkbox'
                        checked={val}
                        onChange={() => handleChecklistChange(key)}
                      />
                      <Label htmlFor={id} className='cursor-pointer'>
                        {key === 'exterior' &&
                          t('staffReturnCar.inspection.checklist.exterior')}
                        {key === 'interior' &&
                          t('staffReturnCar.inspection.checklist.interior')}
                        {key === 'accessories' &&
                          t('staffReturnCar.inspection.checklist.accessories')}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upload ?nh?n & ghi ch? s? c?o: ch? hi?n th?n khi c? s? c?o */}
          {hasIncident && (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label className='block mb-2'>
                  {t('staffReturnCar.incident.title')}
                </Label>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleFiles}
                  className='hidden'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('staffReturnCar.incident.selectFilesButton')}
                </Button>
                {imageUploadError && (
                  <p className='mt-1 text-xs text-red-600'>
                    {imageUploadError}
                  </p>
                )}
                {!!incidentFiles.length && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {t('staffReturnCar.incident.selectedCount', {
                      count: incidentFiles.length,
                    })}
                  </p>
                )}
                {!!incidentPreviews.length && (
                  <div className='grid grid-cols-2 gap-2 mt-3 md:grid-cols-3'>
                    {incidentPreviews.map((p, idx) => (
                      <div
                        key={idx}
                        className='relative overflow-hidden border rounded'
                      >
                        <button
                          type='button'
                          onClick={() => removeIncidentImage(p.index)}
                          className='absolute px-2 py-1 text-xs text-white rounded top-1 right-1 bg-red-600/90 hover:bg-red-600'
                          aria-label={t('common.delete')}
                        >
                          {t('common.delete')}
                        </button>
                        <img
                          src={p.url}
                          alt={p.name}
                          className='object-cover w-full h-24'
                        />
                        <div className='p-2 text-xs truncate'>{p.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className='block mb-2'>
                  {t('staffReturnCar.incident.notesLabel')}
                </Label>
                <Textarea
                  rows={4}
                  value={incidentNotes}
                  onChange={e => setIncidentNotes(e.target.value)}
                  placeholder={t('staffReturnCar.incident.notesPlaceholder')}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3 removed per request: b? t�nh to�n c?c v� ho�n ti�n */}

      {/* Step 4: C?p nh?t booking v� xe */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.complete.title')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-sm text-muted-foreground'>
              {t('staffReturnCar.complete.description')}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  resetAllFields();
                }}
              >
                {t('staffReturnCar.complete.reset')}
              </Button>
              <Button onClick={handleCompleteReturn}>
                {t('staffReturnCar.complete.confirm')}
              </Button>
            </div>
          </div>
          {completeError && (
            <p className='text-xs text-red-600'>{completeError}</p>
          )}
        </CardContent>
      </Card>

      {/* Modal hi?n th?n t?ng ti?n & pricing c?a xe sau khi ho?n t?t tr? xe */}
      <Dialog open={returnSummaryOpen} onOpenChange={setReturnSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('staffReturnCar.modal.title')}</DialogTitle>
            <DialogDescription>
              {t('staffReturnCar.modal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {returnSummary?.vehicleLabel && (
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.modal.vehicle')}
                </p>
                <p className='font-medium'>{returnSummary.vehicleLabel}</p>
              </div>
            )}
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('staffReturnCar.modal.payableVND')}
              </p>
              <p className='text-2xl font-bold'>
                {formatCurrency(returnSummary?.totalAmount ?? 0, 'VND')}
              </p>
            </div>
            {returnSummary?.overtime &&
              (returnSummary.overtime.hours > 0 ||
                returnSummary.overtime.amount > 0) && (
                <div className='pt-2 border-t'>
                  <p className='text-sm font-medium'>
                    {t('staffReturnCar.modal.overtime.title', {
                      defaultValue: 'Phí trả trễ',
                    })}
                  </p>
                  <div className='mt-2 space-y-1 text-sm'>
                    {returnSummary.overtime.hours > 0 && (
                      <div className='flex justify-between'>
                        <span>
                          {t('staffReturnCar.modal.overtime.hours', {
                            defaultValue: 'Giờ trễ',
                          })}
                        </span>
                        <span className='font-medium'>
                          {returnSummary.overtime.hours}
                        </span>
                      </div>
                    )}
                    {returnSummary.overtime.amount > 0 && (
                      <div className='flex justify-between'>
                        <span>
                          {t('staffReturnCar.modal.overtime.amount', {
                            defaultValue: 'Số tiền trễ',
                          })}
                        </span>
                        <span className='font-medium'>
                          {formatCurrency(returnSummary.overtime.amount, 'VND')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            <div className='pt-2 border-t'>
              <p className='text-sm font-medium'>
                {t('staffReturnCar.modal.payment.methodTitle', {
                  defaultValue: 'Payment method',
                })}
              </p>
              <div className='mt-2'>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className='w-full'>
                    <SelectValue
                      placeholder={t(
                        'staffReturnCar.modal.payment.methodPlaceholder',
                        {
                          defaultValue: 'Select method',
                        }
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ONLINE'>
                      {t('staffReturnCar.modal.payment.method.online', {
                        defaultValue: 'Online (PayOS)',
                      })}
                    </SelectItem>
                    <SelectItem value='CASH'>
                      {t('staffReturnCar.modal.payment.method.cash', {
                        defaultValue: 'Cash',
                      })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2 mt-3'>
                <input
                  id='depositHandled'
                  type='checkbox'
                  checked={depositHandled}
                  onChange={e => setDepositHandled(e.target.checked)}
                />
                <Label
                  htmlFor='depositHandled'
                  className='text-sm cursor-pointer'
                >
                  {t('staffReturnCar.modal.depositHandled', {
                    defaultValue: 'Đã xử lí tiền cọc',
                  })}
                </Label>
              </div>
            </div>
            <div className='pt-2 border-t'>
              <p className='text-sm font-medium'>
                {t('staffReturnCar.modal.pricingTitle')}
              </p>
              <div className='mt-2 space-y-1 text-sm'>
                {returnSummary?.vehiclePricing?.hourlyRate != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.hourly')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.hourlyRate,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.vehiclePricing?.baseRate != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.daily')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.baseRate,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.vehiclePricing?.weeklyRate != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.weekly')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.weeklyRate,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.vehiclePricing?.monthlyRate != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.monthly')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.monthlyRate,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.vehiclePricing?.insuranceRate != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.insurance')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.insuranceRate,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.vehiclePricing?.depositAmount != null && (
                  <div className='flex justify-between'>
                    <span>{t('staffReturnCar.modal.pricing.deposit')}</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        returnSummary.vehiclePricing.depositAmount,
                        'VND'
                      )}
                    </span>
                  </div>
                )}
                {returnSummary?.depositApplied > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-amber-600'>
                      {t('staffReturnCar.modal.pricing.depositApplied', {
                        defaultValue: 'Đã trừ tiền cọc',
                      })}
                    </span>
                    <span className='font-medium text-amber-600'>
                      {formatCurrency(
                        -Math.abs(returnSummary.depositApplied),
                        'VND'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => setReturnSummaryOpen(false)}
            >
              {t('common.close')}
            </Button>
            {paymentMethod === 'ONLINE' ? (
              <Button
                onClick={handlePayment}
                disabled={paymentLoading || !returnSummary?.totalAmount}
                className='flex items-center gap-2'
              >
                {paymentLoading ? (
                  <>
                    <div className='w-4 h-4 border-b-2 border-white rounded-full animate-spin'></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className='w-4 h-4' />
                    Pay {formatCurrency(returnSummary?.totalAmount ?? 0, 'VND')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Close summary dialog before opening evidence dialog to avoid aria-hidden focus conflict
                  setReturnSummaryOpen(false);
                  setTimeout(() => setCashEvidenceOpen(true), 10);
                }}
                disabled={cashPaymentLoading || !returnSummary?.totalAmount}
                className='flex items-center gap-2'
                variant='secondary'
              >
                {cashPaymentLoading ? (
                  <>
                    <div className='w-4 h-4 border-b-2 border-white rounded-full animate-spin'></div>
                    Processing...
                  </>
                ) : (
                  <>Mark Completed</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog upload bằng chứng thanh toán tiền mặt */}
      <Dialog open={cashEvidenceOpen} onOpenChange={setCashEvidenceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('staffReturnCar.modal.cashEvidenceTitle', {
                defaultValue: 'Payment Evidence (file)',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('staffReturnCar.modal.cashEvidenceDesc', {
                defaultValue: 'Select an image or PDF as cash payment proof.',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <Label className='text-sm'>
              {t('staffReturnCar.modal.cashEvidenceLabel', {
                defaultValue: 'Choose evidence file',
              })}
            </Label>
            <Input
              type='file'
              accept='image/*,.pdf'
              onChange={e => {
                const file = e.target.files?.[0] || null;
                if (!file) {
                  setCashEvidenceFile(null);
                  return;
                }
                const isValidType =
                  file.type?.startsWith('image/') ||
                  file.type === 'application/pdf';
                const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
                if (!isValidType) {
                  alert(
                    t('staffReturnCar.modal.cashEvidence.invalidFileType', {
                      defaultValue:
                        'Invalid file type. Only images or PDF are allowed.',
                    })
                  );
                  e.target.value = '';
                  setCashEvidenceFile(null);
                  return;
                }
                if (!isValidSize) {
                  alert(
                    t('staffReturnCar.modal.cashEvidence.fileTooLarge', {
                      defaultValue:
                        'File too large (max 5MB). Please choose another file.',
                    })
                  );
                  e.target.value = '';
                  setCashEvidenceFile(null);
                  return;
                }
                setCashEvidenceFile(file);
              }}
            />
            {!cashEvidenceFile && (
              <p className='text-xs text-muted-foreground'>
                {t('staffReturnCar.modal.cashEvidenceHint', {
                  defaultValue:
                    'Please select an evidence file before confirming.',
                })}
              </p>
            )}
          </div>
          <DialogFooter className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => setCashEvidenceOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCashSubmitEvidence}
              disabled={cashPaymentLoading || !cashEvidenceFile}
            >
              {cashPaymentLoading
                ? t('staffReturnCar.modal.cashEvidenceConfirming', {
                    defaultValue: 'Uploading evidence...',
                  })
                : t('staffReturnCar.modal.cashEvidenceConfirm', {
                    defaultValue: 'Upload evidence',
                  })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
