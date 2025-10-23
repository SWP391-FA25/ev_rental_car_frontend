import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  const {
    loading: bookingLoading,
    getAllBookings,
    getBookingById,
  } = useBooking();
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
  // Payload lưu lại để hoàn tất sau khi thanh toán
  const [pendingCompletionPayload, setPendingCompletionPayload] = useState(null);
  // Return details per schema
  const [returnOdometer, setReturnOdometer] = useState('');
  // Actual return station selection
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedReturnStationId, setSelectedReturnStationId] = useState('');
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
  }, []);

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

  const handleFetchBooking = async () => {
    if (!bookingId) {
      setBookingError(t('staffReturnCar.toast.enterBookingId'));
      return;
    }
    try {
      const res = await getBookingById(bookingId);
      const b = res?.booking || res?.data?.booking || null;
      setBooking(b);
      // Initialize totalAmount from booking if available
      setTotalAmount(
        typeof b?.totalAmount !== 'undefined' ? b.totalAmount : null
      );
      const defaultStationId = b?.pickupStation?.id
        ? String(b.pickupStation.id)
        : '';
      setSelectedReturnStationId(defaultStationId);
      setBookingError('');
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
      setCompleteError('');
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
        } catch { }
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
  };

  // Inline validation helper cho Odo
  const getOdoError = (value, currentBooking) => {
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
  };

  // Đồng bộ lỗi odo khi giá trị hoặc booking thay đổi
  useEffect(() => {
    setOdoError(getOdoError(returnOdometer, booking));
  }, [returnOdometer, booking]);

  // Convert selected image files to base64 strings for API payload
  const filesToBase64 = async files => {
    const imageFiles = (files || []).filter(
      f => f && f.type && f.type.startsWith('image/')
    );
    if (!imageFiles.length) return [];
    const toBase64 = file =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    return Promise.all(imageFiles.map(f => toBase64(f)));
  };

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
      const vehicleId = booking?.vehicle?.id || booking?.vehicleId;

      if (vehicleId) {
        // Prefer uploading via vehicle images endpoint (supports multiple files)
        const fd = new FormData();
        for (const f of validFiles) {
          fd.append('images', f);
        }
        try {
          const res = await apiClient.post(
            endpoints.vehicles.uploadImage(vehicleId),
            fd,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          const imgs = res?.data?.data?.images ?? res?.data?.images ?? [];
          for (const it of imgs) {
            uploadResults.push({
              url: it?.url,
              thumbnailUrl: it?.thumbnailUrl,
              fileId: it?.imageKitFileId,
              fileName: it?.fileName,
            });
          }
        } catch (uploadErr) {
          console.warn('Vehicle images upload failed:', uploadErr?.message || uploadErr);
        }
      } else {
        // Fallback: upload to inspection endpoint one by one
        for (const file of validFiles) {
          try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await apiClient.post(
              endpoints.inspections.uploadImage(inspectionId),
              fd,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            const base = res?.data?.data ?? res?.data;
            uploadResults.push({
              url: base?.url,
              thumbnailUrl: base?.thumbnailUrl,
              fileId: base?.fileId,
              fileName: file.name,
            });
          } catch (uploadError) {
            console.warn('Upload inspection image failed:', uploadError?.message || uploadError);
          }
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
              m => (ni.fileId && m.fileId === ni.fileId) || (!ni.fileId && m.url === ni.url)
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

  // Delete an image from the inspection by index using new API
  const deleteInspectionImage = async (inspectionId, imageIndex) => {
    try {
      if (!inspectionId || typeof imageIndex !== 'number') return false;
      await apiClient.delete(
        endpoints.inspections.deleteImage(inspectionId, imageIndex)
      );
      return true;
    } catch (err) {
      console.warn('Delete inspection image error:', err?.message || err);
      return false;
    }
  };

  const handleCompleteReturn = async () => {
    if (!booking && !bookingId) {
      setBookingError(t('staffReturnCar.toast.selectBooking'));
      return;
    }

    const actualEndTime = new Date().toISOString();
    // Derive location string from selected station
    const selectedStation = stations.find(
      s => String(s.id) === String(selectedReturnStationId)
    );
    const normalizedLocation = selectedStation
      ? (
        selectedStation.address ||
        selectedStation.name ||
        String(selectedStation.id)
      ).trim()
      : '';

    // Frontend validation to match backend requirements
    setShowOdoValidation(true);
    const odo = Number(returnOdometer);
    if (!normalizedLocation || normalizedLocation.length < 3) {
      setLocationError(t('staffReturnCar.toast.invalidReturnLocation'));
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
      setBatteryError('Mức pin phải từ 0 đến 100');
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
          inspectionType: 'CHECK_IN',
          mileage: odo,
          batteryLevel: Math.min(100, Math.max(0, Math.round(batteryLevelNum))),
          // ✅ FIX: Logic rõ ràng hơn
          exteriorCondition: hasIncident && !checklist.exterior ? 'POOR' : 'GOOD',
          interiorCondition: hasIncident && !checklist.interior ? 'POOR' : 'GOOD',
          tireCondition: tireCondition || undefined,
          damageNotes: hasIncident ? incidentNotes || undefined : undefined,
          notes: notes || undefined,
          documentVerified: false,
        };

        const inspRes = await apiClient.post(
          endpoints.inspections.create(),
          inspectionPayload
        );
        const createdInspection =
          inspRes?.data?.inspection || inspRes?.data || null;
        const inspectionId =
          createdInspection?.id ||
          createdInspection?.inspectionId ||
          createdInspection?.data?.id;

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
              console.warn('Fetch current inspection images error:', e?.message || e);
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
                m => (ni.fileId && m.fileId === ni.fileId) || (!ni.fileId && m.url === ni.url)
              );
              if (!exists) merged.push(ni);
            }

            await apiClient.put(endpoints.inspections.update(inspectionId), {
              images: merged,
              isCompleted: true,
            });
            setInspectionImages(merged);
          } catch (err) {
            console.warn('Update inspection images error:', err?.message || err);
            // Nếu lỗi, vẫn cố gắng đánh dấu hoàn tất
            try {
              await apiClient.put(endpoints.inspections.update(inspectionId), {
                isCompleted: true,
              });
            } catch (err2) {
              console.warn('Mark inspection completed error:', err2?.message || err2);
            }
          }
        } else if (inspectionId) {
          try {
            await apiClient.put(endpoints.inspections.update(inspectionId), {
              isCompleted: true,
            });
          } catch (err) {
            console.warn('Mark inspection completed error:', err?.message || err);
          }
        }
      } catch (err) {
        console.warn('Create inspection error:', err?.message || err);
        // Không chặn luồng; vẫn tiến hành hoàn tất đơn thuê
      }

      // Lưu payload để hoàn tất sau khi thanh toán
      setPendingCompletionPayload(payload);

      // Chuẩn bị dữ liệu cho modal thanh toán trước khi hoàn tất
      const vehiclePricing = booking?.vehicle?.pricing || null;
      const vehicleLabel =
        booking?.vehicle?.name ||
        booking?.vehicle?.licensePlate ||
        '';
      const payable = booking?.totalAmount ?? 0;
      setReturnSummary({
        bookingId: id,
        vehicleLabel,
        totalAmount: payable,
        vehiclePricing,
      });
      setReturnSummaryOpen(true);

      setCompleteError('');

      // KHÔNG cập nhật danh sách booking ở đây vì chưa hoàn tất
      // Người dùng sẽ thanh toán trước, sau đó bấm "Mark Completed" để đổi trạng thái

      // Không reset form ngay để giữ lại dữ liệu cho bước hoàn tất

      // Chờ thanh toán trước khi hoàn tất đơn thuê
      // (Danh sách booking sẽ được refresh sau khi bấm "Mark Completed")
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
        } catch { }
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
      // Persist completion payload for success page to use
      try {
        localStorage.setItem(
          `completePayload:${returnSummary.bookingId}`,
          JSON.stringify(pendingCompletionPayload || {})
        );
      } catch { }

      const response = await paymentService.createRentalFeePayment(
        returnSummary.bookingId,
        returnSummary.totalAmount,
        `Rental Fee ${returnSummary.bookingId.slice(-8)}`
      );

      if (response?.paymentUrl) {
        // Redirect to PayOS payment page
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      // You can add toast notification here if needed
    } finally {
      setPaymentLoading(false);
    }
  };

  // Mark booking completed after payment
  const handleMarkCompleted = async () => {
    const id = booking?.id || bookingId;
    if (!id || !pendingCompletionPayload) return;

    try {
      const res = await bookingService.completeBooking(id, pendingCompletionPayload);
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
    } catch (e) {
      const status = e?.status ?? e?.response?.status;
      const serverMsg = e?.response?.data?.message || e?.message;
      setCompleteError(serverMsg || t('staffReturnCar.toast.completeFail'));
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
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='col-span-2'>
            <Label className='block mb-2'>
              {t('staffReturnCar.booking.selectLabel')}
            </Label>
            <Combobox
              value={bookingId}
              onValueChange={handleSelectBooking}
              placeholder={t('staffReturnCar.booking.selectPlaceholder')}
              searchPlaceholder='Tìm kiếm booking...'
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
            <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 border rounded p-4'>
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
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
              <p className='text-xs text-red-600 mt-1'>{odoError}</p>
            )}
            <div className='text-xs text-muted-foreground mt-1'>
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
              searchPlaceholder='Tìm kiếm trạm...'
              className={
                locationError ? 'border-red-500 focus:ring-red-500' : ''
              }
              disabled={loadingStations}
              options={stations.map(station => ({
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Dropdown chọn kết quả kiểm tra */}
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

            {/* Mức pin (%) */}
            <div>
              <Label className='block mb-2'>Mức pin (%)</Label>
              <Input
                type='number'
                min={0}
                max={100}
                value={batteryLevel}
                onChange={e => {
                  setBatteryLevel(e.target.value);
                  setBatteryError('');
                }}
                placeholder='Nhập phần trăm pin (0–100)'
                aria-invalid={!!batteryError}
                className={
                  batteryError
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
              {batteryError && (
                <p className='text-xs text-red-600 mt-1'>{batteryError}</p>
              )}
            </div>

            {/* Tình trạng lốp */}
            <div>
              <Label className='block mb-2'>Tình trạng lốp</Label>
              <Select
                value={tireCondition || ''}
                onValueChange={val => setTireCondition(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn tình trạng' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOD'>Tốt</SelectItem>
                  <SelectItem value='FAIR'>Trung bình</SelectItem>
                  <SelectItem value='POOR'>Kém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checklist chỉ hiển thị khi có sự cố */}
            {hasIncident && (
              <div className='md:col-span-3 grid grid-cols-2 gap-3'>
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

          {/* Upload ảnh & ghi chú sự cố: chỉ hiển thị khi có sự cố */}
          {hasIncident && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                  <div className='mt-3 grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {incidentPreviews.map((p, idx) => (
                      <div
                        key={idx}
                        className='border rounded overflow-hidden relative'
                      >
                        <button
                          type='button'
                          onClick={() => removeIncidentImage(p.index)}
                          className='absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white text-xs px-2 py-1 rounded'
                          aria-label={t('common.delete')}
                        >
                          {t('common.delete')}
                        </button>
                        <img
                          src={p.url}
                          alt={p.name}
                          className='w-full h-24 object-cover'
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

      {/* Modal hiển thị tổng tiền & pricing của xe sau khi hoàn tất trả xe */}
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
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setReturnSummaryOpen(false)}
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={handlePayment}
              disabled={paymentLoading || !returnSummary?.totalAmount}
              className="flex items-center gap-2"
            >
              {paymentLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {formatCurrency(returnSummary?.totalAmount ?? 0, 'VND')}
                </>
              )}
            </Button>
            <Button
              variant="default"
              onClick={handleMarkCompleted}
              disabled={!pendingCompletionPayload}
            >
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
