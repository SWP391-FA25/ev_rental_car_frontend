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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { stationService } from '../../cars/services/stationService';

/**
 * Staff Return Car UI
 * Implements the swimlane: Inspect car  (Upload incident | Refund deposit)  Calculate deposit/refund  Update booking & car
 * This is UI-focused with mock-friendly API calls.
 */
export default function ReturnCar() {
  const { t, i18n } = useTranslation();
  const {
    loading: bookingLoading,
    getAllBookings,
    getBookingById,
  } = useBooking();
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [inspectionResult, setInspectionResult] = useState('PASS'); // PASS | ISSUE
  const [checklist, setChecklist] = useState({
    exterior: false,
    interior: false,
    battery: false,
    mileageRecorded: false,
    cleaningNeeded: false,
    accessories: false,
  });
  const [incidentFiles, setIncidentFiles] = useState([]);
  const [incidentPreviews, setIncidentPreviews] = useState([]);
  const [incidentNotes, setIncidentNotes] = useState('');

  const [deposit, setDeposit] = useState(0);
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
      const baseDeposit = b?.depositAmount ?? b?.amount?.deposit ?? 0;
      setDeposit(baseDeposit || 0);
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
      const baseDeposit = b?.depositAmount ?? b?.amount?.deposit ?? 0;
      setDeposit(baseDeposit || 0);
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
        toast.error(
          t('staffReturnCar.toast.loadStationsFail') ||
            'Failed to load stations'
        );
      } finally {
        setLoadingStations(false);
      }
    };
    loadStations();
  }, [t]);

  const handleCompleteReturn = async () => {
    if (!booking && !bookingId) {
      toast.warning(t('staffReturnCar.toast.selectBooking'));
      return;
    }

    if (isOverdue) {
      toast.info(
        t('staffReturnCar.toast.overdueProceed') ||
          'Đơn thuê đã quá hạn, vẫn tiến hành trả xe'
      );
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
      toast.error(
        t('staffReturnCar.toast.invalidReturnLocation') ||
          'Vui lòng chọn trạm trả hợp lệ (3-200 ký tự)'
      );
      return;
    }
    if (!returnOdometer || Number.isNaN(odo) || odo < 0) {
      toast.error(
        t('staffReturnCar.toast.invalidReturnOdometer') ||
          'Vui lòng nhập công tơ mét trả hợp lệ (>= 0)'
      );
      return;
    }

    // Flatten payload per backend completeBooking schema
    const payload = {
      actualEndTime,
      actualReturnLocation: normalizedLocation,
      returnOdometer: odo,
      notes,
      damageReport: incidentNotes || undefined,
      // Optional fields such as batteryLevel or rating can be added here if needed
    };

    try {
      const id = booking?.id || bookingId;
      const res = await bookingService.completeBooking(id, payload);
      if (res?.success) {
        toast.success(t('staffReturnCar.toast.completeSuccess'));
      } else {
        toast.info(res?.message || t('staffReturnCar.toast.completeQueued'));
      }
    } catch (e) {
      // Surface backend validation messages if available
      const serverMsg = e?.response?.data?.message;
      const serverErrors = e?.response?.data?.errors;
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
      toast.error(
        serverMsg || e?.message || t('staffReturnCar.toast.completeFail')
      );
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
                    Loading...
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
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.booking.depositLabel')}
            </Label>
            <Input
              type='number'
              value={deposit}
              onChange={e => setDeposit(e.target.value)}
            />
          </div>

          {booking && (
            <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border rounded p-4'>
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
                      {t('staffReturnCar.booking.overdue') || 'Quá hạn'}
                    </Badge>
                  )}
                </p>
              </div>
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
                  placeholder={
                    t('staffReturnCar.returnDetails.locationPlaceholder') ||
                    'Ch?n tr?m tr?'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingStations && (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    Loading stations...
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
            <div>
              <Label className='block mb-2'>
                {t('staffReturnCar.inspection.resultLabel')}
              </Label>
              <Select
                value={inspectionResult}
                onValueChange={setInspectionResult}
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
            <div className='md:col-span-2 grid grid-cols-2 gap-3'>
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
                      {key === 'battery' &&
                        t('staffReturnCar.inspection.checklist.battery')}
                      {key === 'mileageRecorded' &&
                        t(
                          'staffReturnCar.inspection.checklist.mileageRecorded'
                        )}
                      {key === 'cleaningNeeded' &&
                        t('staffReturnCar.inspection.checklist.cleaningNeeded')}
                      {key === 'accessories' &&
                        t('staffReturnCar.inspection.checklist.accessories')}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {inspectionResult === 'ISSUE' && (
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
          )}
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
                setIncidentFiles([]);
                setIncidentNotes('');
                setInspectionResult('PASS');
                setReturnOdometer('');
                // Reset station selection to pickup station if available
                setSelectedReturnStationId(
                  booking?.pickupStation?.id
                    ? String(booking.pickupStation.id)
                    : ''
                );
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
    </div>
  );
}
