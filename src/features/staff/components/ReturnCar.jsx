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
import { Textarea } from '../../shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
// Location selection removed per requirement: return at pickup location

/**
 * Staff Return Car UI
 * Implements the swimlane: Inspect car → (Upload incident | Refund deposit) → Calculate deposit/refund → Update booking & car
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
  const [fees, setFees] = useState({
    damage: 0,
    cleaning: 0,
    late: 0,
    other: 0,
  });
  // Return details per schema
  const [returnOdometer, setReturnOdometer] = useState('');
  const [actualReturnLocation, setActualReturnLocation] = useState(null);
  const [notes, setNotes] = useState('');

  const totalDeductions = useMemo(
    () =>
      Number(fees.damage) +
      Number(fees.cleaning) +
      Number(fees.late) +
      Number(fees.other),
    [fees]
  );
  const refundAmount = useMemo(
    () => Math.max(Number(deposit) - totalDeductions, 0),
    [deposit, totalDeductions]
  );

  // Fetch eligible bookings: COMPLETED or IN_PROGRESS with endTime due
  useEffect(() => {
    const fetchEligible = async () => {
      try {
        setLoadingBookings(true);
        const resData = await getAllBookings({ limit: 100 });
        const list = (resData?.bookings || resData || []).filter(b => {
          const status = b.status || b.bookingStatus || '';
          // Eligible for return: rentals currently in progress; allow confirmed if policy permits early return.
          return status === 'IN_PROGRESS' || status === 'CONFIRMED';
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
      const defaultLocation =
        b?.pickupLocation ||
        b?.pickupStation?.address ||
        b?.pickupStation?.name ||
        '';
      setActualReturnLocation(defaultLocation);
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
      const defaultLocation =
        b?.pickupLocation ||
        b?.pickupStation?.address ||
        b?.pickupStation?.name ||
        '';
      setActualReturnLocation(defaultLocation);
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

  const handleCompleteReturn = async () => {
    if (!booking && !bookingId) {
      toast.warning(t('staffReturnCar.toast.selectBooking'));
      return;
    }

    const actualEndTime = new Date().toISOString();
    const normalizedLocation =
      typeof actualReturnLocation === 'string'
        ? actualReturnLocation
        : actualReturnLocation?.address || actualReturnLocation?.label || '';

    const payload = {
      returnDetails: {
        actualEndTime,
        actualReturnLocation: normalizedLocation,
        returnOdometer: returnOdometer ? Number(returnOdometer) : undefined,
        notes,
      },
      inspection: {
        result: inspectionResult,
        checklist,
        notes: incidentNotes,
        attachments: incidentFiles.map(f => ({ name: f.name, size: f.size })), // metadata only
      },
      settlement: {
        deposit: Number(deposit),
        deductions: { ...fees },
        refund: refundAmount,
      },
    };

    try {
      const id = booking?.id || bookingId;
      const res = await bookingService.completeBooking(id, payload);
      if (res?.success || res?.message === 'Booking completed') {
        toast.success(t('staffReturnCar.toast.completeSuccess'));
      } else {
        toast.info(res?.message || t('staffReturnCar.toast.completeQueued'));
      }
    } catch (e) {
      toast.error(e?.message || t('staffReturnCar.toast.completeFail'));
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

      {/* Step 1: Chọn đơn thuê / xe */}
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
                    {b.user?.name || b.customer?.name || '—'} •{' '}
                    {b.vehicle?.licensePlate || b.vehicle?.name || '—'}
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
                  {booking.user?.name || booking.renter?.name || '—'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.booking.vehicle')}
                </p>
                <p className='font-medium'>
                  {booking.vehicle?.name ||
                    booking.vehicle?.licensePlate ||
                    '—'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('staffReturnCar.booking.time')}
                </p>
                <p className='font-medium'>
                  {booking.startTime
                    ? new Date(booking.startTime).toLocaleString()
                    : '—'}{' '}
                  →
                  {booking.endTime
                    ? ' ' + new Date(booking.endTime).toLocaleString()
                    : ''}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2b: Thông tin trả xe theo schema */}
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
            <Input
              value={
                typeof actualReturnLocation === 'string'
                  ? actualReturnLocation || ''
                  : actualReturnLocation?.address ||
                    actualReturnLocation?.label ||
                    ''
              }
              readOnly
              disabled
            />
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

      {/* Step 2: Kiểm tra xe */}
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

      {/* Step 3: Tính toán cọc và hoàn tiền */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffReturnCar.deposit.title')}</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.deposit.damage')}
            </Label>
            <Input
              type='number'
              value={fees.damage}
              onChange={e => setFees({ ...fees, damage: e.target.value })}
            />
          </div>
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.deposit.cleaning')}
            </Label>
            <Input
              type='number'
              value={fees.cleaning}
              onChange={e => setFees({ ...fees, cleaning: e.target.value })}
            />
          </div>
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.deposit.late')}
            </Label>
            <Input
              type='number'
              value={fees.late}
              onChange={e => setFees({ ...fees, late: e.target.value })}
            />
          </div>
          <div>
            <Label className='block mb-2'>
              {t('staffReturnCar.deposit.other')}
            </Label>
            <Input
              type='number'
              value={fees.other}
              onChange={e => setFees({ ...fees, other: e.target.value })}
            />
          </div>

          <div className='md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2'>
            <div className='border rounded p-3'>
              <p className='text-xs text-muted-foreground'>
                {t('staffReturnCar.deposit.baseDeposit')}
              </p>
              <p className='text-lg font-semibold'>
                {Number(deposit).toLocaleString(
                  i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                )}
              </p>
            </div>
            <div className='border rounded p-3'>
              <p className='text-xs text-muted-foreground'>
                {t('staffReturnCar.deposit.deductions')}
              </p>
              <p className='text-lg font-semibold'>
                {Number(totalDeductions).toLocaleString(
                  i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                )}
              </p>
            </div>
            <div className='border rounded p-3'>
              <p className='text-xs text-muted-foreground'>
                {t('staffReturnCar.deposit.refund')}
              </p>
              <p className='text-lg font-semibold text-emerald-600'>
                {Number(refundAmount).toLocaleString(
                  i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Cập nhật booking và xe */}
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
                setFees({ damage: 0, cleaning: 0, late: 0, other: 0 });
                setIncidentFiles([]);
                setIncidentNotes('');
                setInspectionResult('PASS');
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
