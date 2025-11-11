import { Calendar, Car, CreditCard, User, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Label } from '../../../shared/components/ui/label';
import { formatCurrency, formatDate } from '../../../shared/lib/utils';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../shared/lib/apiClient';
import { endpoints } from '../../../shared/lib/endpoints';
import { env } from '../../../shared/lib/env';

const Row = ({ label, value, valueClass = 'text-foreground' }) => (
  <div className='flex justify-between px-4 py-2 text-muted-foreground'>
    <span>{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export function BookingDetails({ open, onOpenChange, booking }) {
  const { t } = useTranslation();
  // State for inspections (hooks must be unconditional)
  const [inspections, setInspections] = useState([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [inspectionsError, setInspectionsError] = useState('');

  // Helper to normalize and make absolute URLs (for evidence, images, etc.)
  const makeAbsoluteUrl = url => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
    const path = s.startsWith('/')
      ? s
      : s.startsWith('uploads')
      ? `/${s}`
      : null;
    if (!path) return null;
    const base = env.apiBaseUrl.replace(/\/+$/, '');
    return `${base}${path}`;
  };

  useEffect(() => {
    const fetchInspections = async () => {
      if (!booking?.id || !open) return;
      setLoadingInspections(true);
      setInspectionsError('');
      try {
        const res = await apiClient.get(
          endpoints.inspections.getByBooking(booking.id)
        );
        const payload = res?.data;
        const list = Array.isArray(payload?.data?.inspections)
          ? payload.data.inspections
          : Array.isArray(payload?.inspections)
          ? payload.inspections
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : [];
        const sorted = [...list].sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );
        const latest = sorted[0] || null;

        // Debug log để kiểm tra dữ liệu inspection
        console.log('=== INSPECTION DEBUG ===');
        console.log('Booking ID:', booking.id);
        console.log('Raw API response:', payload);
        console.log('Extracted inspections list:', list);
        console.log('Latest inspection:', latest);
        if (latest) {
          console.log('Latest inspection images field:', latest.images);
          console.log('Latest inspection imageUrl field:', latest.imageUrl);
          console.log(
            'Latest inspection thumbnailUrl field:',
            latest.thumbnailUrl
          );
        }
        console.log('========================');

        setInspections(latest ? [latest] : []);
      } catch (err) {
        setInspectionsError(
          err?.message || t('booking.messages.detailsFailed')
        );
      } finally {
        setLoadingInspections(false);
      }
    };

    fetchInspections();
  }, [booking?.id, open, t]);

  if (!booking) return null;

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: t('booking.status.pending') },
      CONFIRMED: { variant: 'default', label: t('booking.status.confirmed') },
      IN_PROGRESS: {
        variant: 'default',
        label: t('booking.status.inProgress'),
      },
      COMPLETED: { variant: 'default', label: t('booking.status.completed') },
      CANCELLED: {
        variant: 'destructive',
        label: t('booking.status.cancelled'),
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        {config.label}
      </Badge>
    );
  };

  // Badge color helpers for inspection summary
  const getBatteryBadgeClass = val => {
    if (val === null || val === undefined) {
      return 'bg-muted/50 text-muted-foreground border-border';
    }
    const n = Number(val);
    if (Number.isNaN(n))
      return 'bg-muted/50 text-muted-foreground border-border';
    if (n >= 70)
      return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (n >= 30)
      return 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  const getConditionBadgeClass = value => {
    const v = (value || '').toString().toUpperCase();
    if (!v) return 'bg-muted/50 text-muted-foreground border-border';
    if (v === 'GOOD' || v === 'EXCELLENT')
      return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (v === 'FAIR' || v === 'AVERAGE')
      return 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (v === 'POOR' || v === 'BAD')
      return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    if (v === 'N/A' || v === 'NA')
      return 'bg-muted/50 text-muted-foreground border-border';
    return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  };

  const getDocBadgeClass = val => {
    if (typeof val !== 'boolean')
      return 'bg-muted/50 text-muted-foreground border-border';
    return val
      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  // Format currency
  const formatPrice = amount => {
    return formatCurrency(amount, 'VND');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('booking.details.title')}</DialogTitle>
          <DialogDescription>
            {t('booking.details.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Customer Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <User className='h-5 w-5' />
              {t('booking.details.customerInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.name')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.email')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.email}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.customerInfo.phone')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.user.phone || t('booking.details.na')}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Car className='h-5 w-5' />
              {t('booking.details.vehicleInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.vehicle')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.brand} {booking.vehicle.model}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.licensePlate')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.licensePlate || t('booking.details.na')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.type')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.vehicle.type || t('booking.details.na')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.vehicleInfo.status')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  <Badge variant='outline'>{booking.vehicle.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              {t('booking.details.bookingInfo.title')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.bookingId')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center font-mono text-sm'>
                  {booking.id}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.status')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.startTime')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.startTime)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.endTime')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.endTime
                    ? formatDate(booking.endTime)
                    : t('booking.details.notSet')}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.station')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {booking.station.name}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('booking.details.bookingInfo.created')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(booking.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Notes */}
          {booking.notes && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>
                {t('booking.details.notes.title')}
              </h3>
              <div className='p-3 border rounded-md bg-muted/50'>
                {booking.notes}
              </div>
            </div>
          )}

          {/* Vehicle Inspections */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <ClipboardList className='h-5 w-5' />
              {t('booking.details.inspections.title')}
            </h3>

            {loadingInspections && (
              <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                {t('booking.details.inspections.loading')}
              </div>
            )}

            {!loadingInspections && inspectionsError && (
              <div className='p-2 border rounded-md bg-destructive/10 text-destructive min-h-[40px] flex items-center'>
                {t('booking.details.inspections.loadFailed')}:{' '}
                {inspectionsError}
              </div>
            )}

            {!loadingInspections &&
              !inspectionsError &&
              inspections.length === 0 && (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {t('booking.details.inspections.empty')}
                </div>
              )}

            {!loadingInspections &&
              !inspectionsError &&
              inspections.length > 0 && (
                <div className='space-y-3'>
                  {inspections.map(item => {
                    const type = item?.inspectionType || item?.type || '';
                    const statusText = item?.isCompleted
                      ? t('booking.details.inspections.status.completed')
                      : t('booking.details.inspections.status.pending');
                    const odometer = item?.mileage ?? item?.odometer ?? null;
                    const stationName =
                      item?.station?.name ||
                      item?.stationName ||
                      booking?.station?.name ||
                      '';
                    const staffName =
                      item?.staff?.name || item?.staffName || '';
                    const time =
                      item?.createdAt || item?.time || item?.updatedAt || '';
                    const damageNotes =
                      item?.damageNotes ||
                      item?.incidentNotes ||
                      item?.notes ||
                      '';
                    const battery = item?.batteryLevel ?? null;
                    const exteriorCondition = item?.exteriorCondition || '';
                    const interiorCondition = item?.interiorCondition || '';
                    const tireCondition = item?.tireCondition || '';
                    // Robustly normalize image URLs and make absolute when needed
                    const makeAbsoluteUrl = url => {
                      if (!url) return null;
                      const s = String(url).trim();
                      if (!s) return null;
                      if (/^https?:\/\//i.test(s) || s.startsWith('data:'))
                        return s;
                      // Accept only paths that look like files (starts with '/' or 'uploads')
                      const path = s.startsWith('/')
                        ? s
                        : s.startsWith('uploads')
                        ? `/${s}`
                        : null;
                      if (!path) return null;
                      const base = env.apiBaseUrl.replace(/\/+$/, '');
                      return `${base}${path}`;
                    };

                    // Collect all possible image URLs from different fields
                    const allImageCandidates = [];

                    // 1) From images array (Json field) — prefer original URL over thumbnail
                    const rawImages = item?.images;
                    if (Array.isArray(rawImages)) {
                      rawImages.forEach(img => {
                        let candidate = null;
                        if (typeof img === 'string') {
                          candidate = img;
                        } else if (img && typeof img === 'object') {
                          candidate =
                            img.url ||
                            img.data?.url ||
                            img.path ||
                            img.filePath ||
                            img.imageUrl ||
                            null;
                          // Only fall back to thumbnail when no original URL exists
                          if (!candidate) {
                            candidate =
                              img.thumbnailUrl ||
                              img.data?.thumbnailUrl ||
                              null;
                          }
                        }
                        if (candidate) allImageCandidates.push(candidate);
                      });
                    }

                    // 2) From top-level imageUrl (String) — primary
                    if (item?.imageUrl) {
                      allImageCandidates.push(item.imageUrl);
                    } else if (item?.thumbnailUrl) {
                      // 3) Fallback to top-level thumbnailUrl only when imageUrl is absent
                      allImageCandidates.push(item.thumbnailUrl);
                    }

                    // Process and deduplicate URLs
                    const imageUrls = Array.from(
                      new Set(
                        allImageCandidates
                          .map(candidate => makeAbsoluteUrl(candidate))
                          .filter(Boolean)
                      )
                    );
                    const noIncident =
                      !damageNotes &&
                      imageUrls.length === 0 &&
                      exteriorCondition === 'GOOD' &&
                      interiorCondition === 'GOOD' &&
                      tireCondition === 'GOOD';

                    return (
                      <div
                        key={item?.id || `${type}-${time}`}
                        className='p-3 border rounded-md bg-muted/30'
                      >
                        <div className='flex flex-wrap justify-between gap-2'>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline'>
                              {t('booking.details.inspections.item.id')}#
                              {(item?.id || '').toString().substring(0, 8)}
                            </Badge>
                            <Badge variant='secondary'>
                              {t('booking.details.inspections.item.type')}
                              :&nbsp;
                              {type === 'CHECK_OUT'
                                ? t('booking.details.inspections.type.checkout')
                                : type === 'CHECK_IN'
                                ? t('booking.details.inspections.type.checkin')
                                : type || t('booking.details.na')}
                            </Badge>
                          </div>
                          <Badge variant='default'>
                            {t('booking.details.inspections.item.status')}:{' '}
                            {statusText}
                          </Badge>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                          <div className='space-y-1'>
                            <Label>
                              {t('booking.details.inspections.item.odometer')}
                            </Label>
                            <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                              {typeof odometer === 'number'
                                ? odometer
                                : t('booking.details.na')}
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <Label>
                              {t('booking.details.inspections.item.station')}
                            </Label>
                            <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                              {stationName || t('booking.details.na')}
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <Label>
                              {t('booking.details.inspections.item.staff')}
                            </Label>
                            <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                              {staffName || t('booking.details.na')}
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <Label>
                              {t('booking.details.inspections.item.time')}
                            </Label>
                            <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                              {time
                                ? formatDate(time)
                                : t('booking.details.na')}
                            </div>
                          </div>
                        </div>

                        <div className='space-y-2 mt-3'>
                          <Label>
                            {t('booking.details.inspections.item.damageNotes')}
                          </Label>
                          <div className='p-2 border rounded-md bg-muted/50 min-h-[36px]'>
                            {damageNotes
                              ? damageNotes
                              : !damageNotes &&
                                imageUrls.length === 0 &&
                                exteriorCondition === 'GOOD' &&
                                interiorCondition === 'GOOD' &&
                                tireCondition === 'GOOD'
                              ? t(
                                  'booking.details.inspections.item.noIncidentAfterReturn'
                                )
                              : t('booking.details.na')}
                          </div>
                        </div>

                        {/* Inspection summary */}
                        {(battery !== null ||
                          exteriorCondition ||
                          interiorCondition ||
                          tireCondition) && (
                          <div className='space-y-2 mt-3'>
                            <Label>
                              {t('booking.details.inspections.item.checklist')}
                            </Label>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                              <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                                <span>
                                  {t(
                                    'booking.details.inspections.item.battery'
                                  )}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={getBatteryBadgeClass(battery)}
                                >
                                  {battery !== null
                                    ? `${battery}%`
                                    : t('booking.details.na')}
                                </Badge>
                              </div>
                              <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                                <span>
                                  {t(
                                    'booking.details.inspections.item.exteriorCondition'
                                  )}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={getConditionBadgeClass(
                                    exteriorCondition
                                  )}
                                >
                                  {exteriorCondition || t('booking.details.na')}
                                </Badge>
                              </div>
                              <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                                <span>
                                  {t(
                                    'booking.details.inspections.item.interiorCondition'
                                  )}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={getConditionBadgeClass(
                                    interiorCondition
                                  )}
                                >
                                  {interiorCondition || t('booking.details.na')}
                                </Badge>
                              </div>
                              <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                                <span>
                                  {t(
                                    'booking.details.inspections.item.tireCondition'
                                  )}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={getConditionBadgeClass(
                                    tireCondition
                                  )}
                                >
                                  {tireCondition || t('booking.details.na')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inspection images */}
                        {!noIncident && (
                          <div className='space-y-2 mt-3'>
                            <Label>
                              {t('booking.details.inspections.item.images') ||
                                'Inspection Images'}
                            </Label>
                            {imageUrls.length > 0 ? (
                              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                                {imageUrls.map((url, idx) => (
                                  <div
                                    key={`${item?.id || 'img'}-${idx}`}
                                    className='rounded-md overflow-hidden border bg-muted/40'
                                  >
                                    <img
                                      src={url}
                                      alt={`inspection-${idx + 1}`}
                                      className='w-full h-24 object-cover'
                                      loading='lazy'
                                      onError={e => {
                                        // Hide broken images gracefully
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                                {t('booking.details.na')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* Pricing */}
          <h3 className='font-semibold'>
            {t('booking.details.pricing.title')}
          </h3>
          <div className='border border-green-200 dark:border-green-800 rounded-2xl overflow-hidden shadow-sm bg-card'>
            {/* Body */}
            <div className='divide-y divide-green-100 dark:divide-green-800'>
              <Row label='Base Price' value={formatPrice(booking.basePrice)} />
              <Row
                label='Insurance'
                value={formatPrice(booking.insuranceAmount)}
              />
              <Row label='Tax' value={formatPrice(booking.taxAmount)} />
              <Row
                label='Discount'
                value={`-${formatPrice(booking.discountAmount)}`}
                valueClass='text-green-600 dark:text-green-400 font-semibold'
              />
            </div>

            {/* Deposit */}
            <div className='flex justify-between px-4 py-2 border-t border-green-100 dark:border-green-800'>
              <span className='text-muted-foreground'>Deposit (Paid)</span>
              <span className='text-foreground font-medium'>
                {formatPrice(booking.depositAmount)}
              </span>
            </div>

            {/* Total Amount */}
            <div className='px-4 py-3 bg-green-100 dark:bg-green-950/50 flex justify-between items-center'>
              <span className='text-green-800 dark:text-green-300 font-semibold text-base'>
                {t('booking.details.pricing.totalAmount')}
              </span>
              <span className='text-green-700 dark:text-green-400 text-lg font-bold'>
                {formatPrice(booking.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {booking.payments &&
            booking.payments.length > 0 &&
            (() => {
              const list = Array.isArray(booking.payments)
                ? booking.payments
                : [];
              const latest = [...list].sort((a, b) => {
                const da = new Date(
                  a?.paymentDate || a?.updatedAt || a?.createdAt || 0
                ).getTime();
                const db = new Date(
                  b?.paymentDate || b?.updatedAt || b?.createdAt || 0
                ).getTime();
                return db - da;
              })[0];
              if (!latest) return null;
              const payment = latest;

              const getStatusStyle = status => {
                switch (status?.toUpperCase()) {
                  case 'PAID':
                  case 'COMPLETED':
                    return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
                  case 'PENDING':
                    return 'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
                  case 'FAILED':
                    return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
                  default:
                    return 'bg-muted/50 text-muted-foreground border-border';
                }
              };

              return (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold'>
                    {t('booking.details.paymentHistory')}
                  </h3>

                  <div className='bg-card border border-green-200 dark:border-green-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 px-4 py-3 flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-white/20 dark:bg-white/10 p-1.5 rounded-lg'>
                          <CreditCard className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <p className='text-white font-semibold text-sm'>
                            {t('booking.details.payment')} #
                            {payment.id.substring(0, 8)}
                          </p>
                          <p className='text-white/80 text-xs'>
                            {payment.paymentDate
                              ? formatDate(payment.paymentDate)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </div>
                    </div>

                    {/* Body */}
                    <div className='p-4 space-y-3'>
                      <div className='bg-green-50 dark:bg-green-950/50 rounded-xl p-4 flex justify-between items-center'>
                        <span className='text-sm text-green-700 dark:text-green-400 font-medium'>
                          Total Amount:
                        </span>
                        <span className='text-2xl font-bold text-green-800 dark:text-green-300'>
                          {formatPrice(payment.amount)}
                        </span>
                      </div>

                      {/* Method & Type */}
                      <div className='grid grid-cols-2 gap-3'>
                        {payment.paymentMethod && (
                          <div className='bg-green-50 dark:bg-green-950/50 rounded-lg p-3 border border-green-100 dark:border-green-800'>
                            <p className='text-xs text-green-700 dark:text-green-400 mb-1'>
                              Method
                            </p>
                            <p className='text-sm font-semibold text-green-900 dark:text-green-200'>
                              {payment.paymentMethod.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}
                        {payment.paymentType && (
                          <div className='bg-green-50 dark:bg-green-950/50 rounded-lg p-3 border border-green-100 dark:border-green-800'>
                            <p className='text-xs text-green-700 dark:text-green-400 mb-1'>
                              Type
                            </p>
                            <p className='text-sm font-semibold text-green-900 dark:text-green-200'>
                              {payment.paymentType.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end pt-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto'
          >
            {t('booking.details.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
