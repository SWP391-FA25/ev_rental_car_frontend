import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { bookingService } from '../../booking/services/bookingService';
import { useBooking } from '../../booking/hooks/useBooking';
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
import { stationService } from '../../cars/services/stationService';
import { formatCurrency } from '@/features/shared/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
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
    accessories: false,
  });
  const [incidentFiles, setIncidentFiles] = useState([]);
  const [incidentPreviews, setIncidentPreviews] = useState([]);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(null);
  // Modal hiển thị tổng tiền và pricing của xe sau khi hoàn tất
  const [returnSummaryOpen, setReturnSummaryOpen] = useState(false);
  const [returnSummary, setReturnSummary] = useState(null);
  // Return details per schema
  const [returnOdometer, setReturnOdometer] = useState('');
  // Actual return station selection
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedReturnStationId, setSelectedReturnStationId] = useState('');
  const [notes, setNotes] = useState('');
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

  const handleSelectBooking = async value => {
    setBookingId(value);
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
    } catch (e) {
      toast.error(e?.message || t('staffReturnCar.toast.loadBookingFail'));
    }
  };

  const handleFetchBooking = async () => {
    if (!bookingId) {
      toast.warning(t('staffReturnCar.toast.enterBookingId'));
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
      toast.success(t('staffReturnCar.toast.loadBookingSuccess'));
    } catch (e) {
      toast.error(e?.message || t('staffReturnCar.toast.loadBookingFail'));
    }
  };

  const handleChecklistChange = key => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFiles = e => {
    const files = Array.from(e.target.files || []);
    setIncidentFiles(prev => [...prev, ...files]);
  };

  // Generate preview URLs for selected images
  useEffect(() => {
    const urls = incidentFiles
      .filter(f => f && f.type && f.type.startsWith('image/'))
      .map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setIncidentPreviews(urls);
    return () => {
      urls.forEach(u => {
        try {
          URL.revokeObjectURL(u.url);
        } catch {}
      });
    };
  }, [incidentFiles]);

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
        toast.error(t('staffReturnCar.toast.loadStationsFail'));
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
      accessories: false,
    });
    setIncidentFiles([]);
    setIncidentNotes('');
    setReturnOdometer('');
    setSelectedReturnStationId('');
    setNotes('');
    setTotalAmount(null);
  };

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

  // Upload incident images to vehicle image endpoint to obtain URLs
  const uploadIncidentImages = async vehicleId => {
    try {
      const imageFiles = (incidentFiles || []).filter(
        f => f && f.type && f.type.startsWith('image/')
      );
      if (!vehicleId || !imageFiles.length) return [];

      // Warn for oversize to reduce server errors (backend caps ~5MB/file)
      const MAX_SIZE = 5 * 1024 * 1024;
      const validFiles = imageFiles.filter(f => {
        if (f.size > MAX_SIZE) {
          toast.warning(
            t('staffReturnCar.toast.imageTooLarge', { name: f.name })
          );
          return false;
        }
        return true;
      });

      const uploadPromises = validFiles.map(async file => {
        const formData = new FormData();
        formData.append('images', file);
        const res = await apiClient.post(
          endpoints.vehicles.uploadImage(vehicleId),
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const images = res?.data?.images || [];
        return images.map(img => img.url).filter(Boolean);
      });

      const settled = await Promise.allSettled(uploadPromises);
      const urls = [];
      settled.forEach(r => {
        if (r.status === 'fulfilled') {
          const list = Array.isArray(r.value) ? r.value : [];
          urls.push(...list);
        } else {
          console.warn('Upload image failed:', r.reason);
        }
      });
      return urls;
    } catch (err) {
      console.warn('Upload incident images error:', err?.message || err);
      return [];
    }
  };

  const handleCompleteReturn = async () => {
    if (!booking && !bookingId) {
      toast.warning(t('staffReturnCar.toast.selectBooking'));
      return;
    }

    if (isOverdue) {
      toast.info(t('staffReturnCar.toast.overdueProceed'));
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
    const odo = Number(returnOdometer);
    if (!normalizedLocation || normalizedLocation.length < 3) {
      toast.error(t('staffReturnCar.toast.invalidReturnLocation'));
      return;
    }
    if (!returnOdometer || Number.isNaN(odo) || odo < 0) {
      toast.error(t('staffReturnCar.toast.invalidReturnOdometer'));
      return;
    }

    // Flatten payload per backend completeBooking schema
    const payload = {
      actualEndTime,
      actualReturnLocation: normalizedLocation,
      returnOdometer: odo,
      notes,
      // Optional fields such as batteryLevel or rating can be added here if needed
    };

    try {
      const id = booking?.id || bookingId;
      // Tạo inspection (CHECK_OUT) trước khi hoàn tất đơn thuê
      try {
        if (!user?.id) {
          toast.error(t('staffReturnCar.toast.missingStaff'));
          return;
        }

        // Upload files to get URLs, avoid large JSON payload (base64)
        const vehicleIdForUpload = booking?.vehicle?.id || booking?.vehicleId;
        const incidentImageUrls = incidentFiles.length
          ? await uploadIncidentImages(vehicleIdForUpload)
          : [];

        const inspectionPayload = {
          vehicleId: booking?.vehicle?.id || booking?.vehicleId,
          staffId: user?.id,
          bookingId: id,
          inspectionType: 'CHECK_OUT',
          mileage: odo,
          // batteryLevel is REQUIRED by Prisma schema (0-100)
          batteryLevel:
            typeof (booking?.vehicle?.batteryLevel ?? booking?.batteryLevel) ===
            'number'
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    booking?.vehicle?.batteryLevel ?? booking?.batteryLevel
                  )
                )
              : 50, // fallback to 50% if unknown
          // Prisma enum ConditionStatus requires one of: GOOD | FAIR | POOR
          exteriorCondition: checklist.exterior ? 'GOOD' : 'POOR',
          interiorCondition: checklist.interior ? 'GOOD' : 'POOR',
          // accessories is JSON; send a minimal array to reflect presence/missing
          accessories: checklist.accessories
            ? ['ALL_PRESENT']
            : ['MISSING_ITEMS'],
          damageNotes: incidentNotes || undefined,
          notes: notes || undefined,
          images: incidentImageUrls.length ? incidentImageUrls : undefined,
          documentVerified: false,
        };

        await apiClient.post(endpoints.inspections.create(), inspectionPayload);
      } catch (err) {
        console.warn('Create inspection error:', err?.message || err);
        // Không chặn luồng; vẫn tiến hành hoàn tất đơn thuê
      }

      const res = await bookingService.completeBooking(id, payload);
      // bookingService.completeBooking trả về response.data từ API:
      // { booking: ..., summary: { pricing: ... } }
      const updatedBooking = res?.booking;
      const pricing = res?.summary?.pricing;

      // Cập nhật booking và totalAmount
      if (updatedBooking) setBooking(updatedBooking);
      if (pricing && typeof pricing.totalAmount !== 'undefined') {
        setTotalAmount(pricing.totalAmount);
      } else if (typeof updatedBooking?.totalAmount !== 'undefined') {
        setTotalAmount(updatedBooking.totalAmount);
      }

      // Chuẩn bị dữ liệu cho modal hiển thị sau khi hoàn tất
      const vehiclePricing =
        updatedBooking?.vehicle?.pricing || booking?.vehicle?.pricing || null;
      const vehicleLabel =
        updatedBooking?.vehicle?.name ||
        updatedBooking?.vehicle?.licensePlate ||
        booking?.vehicle?.name ||
        booking?.vehicle?.licensePlate ||
        '';
      const payable =
        (pricing && typeof pricing.totalAmount !== 'undefined'
          ? pricing.totalAmount
          : updatedBooking?.totalAmount) ?? 0;
      setReturnSummary({
        bookingId: id,
        vehicleLabel,
        totalAmount: payable,
        vehiclePricing,
      });
      setReturnSummaryOpen(true);

      toast.success(t('staffReturnCar.toast.completeSuccess'));
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

      // Reset form chỉ khi hoàn tất thành công
      resetAllFields();
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
        const msgs = [locErr, odoErr, timeErr].filter(Boolean);
        if (msgs.length) {
          msgs.forEach(m => toast.error(m));
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
            toast.error(t('staffReturnCar.toast.invalidEndTime'));
            return;
          }
        } catch {}
        // Fallback chung cho lỗi 400
        toast.error(serverMsg || t('staffReturnCar.toast.validationFailed'));
        return;
      }

      // Trường hợp 409: thao tác đã được thực hiện trước đó (idempotent)
      if (status === 409) {
        toast.info(t('staffReturnCar.toast.alreadyCompleted'));
        return;
      }

      // Mặc định
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
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='col-span-2'>
            <Label className='block mb-2'>
              {t('staffReturnCar.booking.selectLabel')}
            </Label>
            <Select value={bookingId} onValueChange={handleSelectBooking}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('staffReturnCar.booking.selectPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {loadingBookings && (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    {t('common.loading')}
                  </div>
                )}
                {eligibleBookings.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.user?.name || b.customer?.name || ''}{' '}
                    {b.vehicle?.licensePlate || b.vehicle?.name || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {booking.startTime
                    ? new Date(booking.startTime).toLocaleString()
                    : ''}{' '}
                  {booking.endTime
                    ? ' ' + new Date(booking.endTime).toLocaleString()
                    : ''}
                  {isOverdue && (
                    <Badge variant='destructive' className='ml-2'>
                      {t('staffReturnCar.booking.overdue')}
                    </Badge>
                  )}
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
              onChange={e => setReturnOdometer(e.target.value)}
              placeholder={t(
                'staffReturnCar.returnDetails.odometerPlaceholder'
              )}
            />
          </div>
          <div className='md:col-span-2'>
            <Label className='block mb-2'>
              {t('staffReturnCar.returnDetails.location')}
            </Label>
            <Select
              value={selectedReturnStationId}
              onValueChange={setSelectedReturnStationId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('staffReturnCar.returnDetails.locationPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {loadingStations && (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    {t('staffReturnCar.loadingStations')}
                  </div>
                )}
                {stations.map(station => (
                  <SelectItem key={station.id} value={String(station.id)}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.incident.title')}
              </Label>
              <Input
                type='file'
                multiple
                accept='image/*'
                onChange={handleFiles}
              />
              {!!incidentPreviews.length && (
                <div className='mt-3 grid grid-cols-2 md:grid-cols-3 gap-2'>
                  {incidentPreviews.map((p, idx) => (
                    <div key={idx} className='border rounded overflow-hidden'>
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
        </CardContent>
      </Card>

      {/* Step 3 removed per request: b? t�nh to�n c?c v� ho�n ti?n */}

      {/* Step 4: C?p nh?t booking v� xe */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.complete.title')}</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-between gap-3'>
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
          <DialogFooter>
            <Button onClick={() => setReturnSummaryOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
