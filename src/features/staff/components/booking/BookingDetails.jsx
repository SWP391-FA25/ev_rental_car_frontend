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

export function BookingDetails({ open, onOpenChange, booking }) {
  const { t } = useTranslation();
  // State for inspections (hooks must be unconditional)
  const [inspections, setInspections] = useState([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [inspectionsError, setInspectionsError] = useState('');

  useEffect(() => {
    const fetchInspections = async () => {
      if (!booking?.vehicle?.id || !open) return;
      setLoadingInspections(true);
      setInspectionsError('');
      try {
        const res = await apiClient.get(
          endpoints.inspections.getByVehicle(booking.vehicle.id)
        );
        const data = res?.data;
        // Backend returns: { success: true, data: { inspections: [...] } }
        const list = Array.isArray(data?.inspections)
          ? data.inspections
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        const sorted = [...list].sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );
        const latest = sorted[0] || null;
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
  }, [booking?.vehicle?.id, open, t]);

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
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
    const n = Number(val);
    if (Number.isNaN(n)) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (n >= 70) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (n >= 30) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getConditionBadgeClass = value => {
    const v = (value || '').toString().toUpperCase();
    if (!v) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (v === 'GOOD' || v === 'EXCELLENT')
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (v === 'FAIR' || v === 'AVERAGE')
      return 'bg-amber-100 text-amber-800 border-amber-200';
    if (v === 'POOR' || v === 'BAD')
      return 'bg-rose-100 text-rose-700 border-rose-200';
    if (v === 'N/A' || v === 'NA')
      return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getDocBadgeClass = val => {
    if (typeof val !== 'boolean')
      return 'bg-gray-100 text-gray-600 border-gray-200';
    return val
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
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
              <h3 className='text-lg font-semibold'>{t('booking.details.notes.title')}</h3>
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
              <div className='p-2 border rounded-md bg-red-50 text-red-600 min-h-[40px] flex items-center'>
                {t('booking.details.inspections.loadFailed')}: {inspectionsError}
              </div>
            )}

            {!loadingInspections && !inspectionsError && inspections.length === 0 && (
              <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                {t('booking.details.inspections.empty')}
              </div>
            )}

            {!loadingInspections && !inspectionsError && inspections.length > 0 && (
              <div className='space-y-3'>
                {inspections.map(item => {
                  const type = item?.inspectionType || item?.type || '';
                  const statusText = item?.isCompleted
                    ? t('booking.details.inspections.status.completed')
                    : t('booking.details.inspections.status.pending');
                  const odometer = item?.mileage ?? item?.odometer ?? null;
                  const stationName =
                    item?.station?.name || item?.stationName || booking?.station?.name || '';
                  const staffName = item?.staff?.name || item?.staffName || '';
                  const time = item?.createdAt || item?.time || item?.updatedAt || '';
                  const damageNotes =
                    item?.damageNotes || item?.incidentNotes || item?.notes || '';
                  const battery = item?.batteryLevel ?? null;
                  const exteriorCondition = item?.exteriorCondition || '';
                  const interiorCondition = item?.interiorCondition || '';
                  const tireCondition = item?.tireCondition || '';
                  // Robustly normalize image URLs and make absolute when needed
                  const makeAbsoluteUrl = (url) => {
                    if (!url) return null;
                    const s = String(url);
                    if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
                    const base = env.apiBaseUrl.replace(/\/+$/, '');
                    const path = s.startsWith('/') ? s : `/${s}`;
                    return `${base}${path}`;
                  };
                  const rawImages = item?.images;
                  const imageUrls = Array.isArray(rawImages)
                    ? Array.from(
                        new Set(
                          rawImages
                            .map((img) => {
                              const candidate =
                                typeof img === 'string'
                                  ? img
                                  : img?.url ||
                                    img?.thumbnailUrl ||
                                    img?.data?.url ||
                                    img?.data?.thumbnailUrl ||
                                    null;
                              return makeAbsoluteUrl(candidate);
                            })
                            .filter(Boolean)
                        )
                      )
                    : [];
                  const noIncident = !damageNotes && imageUrls.length === 0 && exteriorCondition === 'GOOD' && interiorCondition === 'GOOD' && tireCondition === 'GOOD';

                  return (
                    <div
                      key={item?.id || `${type}-${time}`}
                      className='p-3 border rounded-md bg-muted/30'
                    >
                      <div className='flex flex-wrap justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>
                            {t('booking.details.inspections.item.id')}#{
                              (item?.id || '')
                                .toString()
                                .substring(0, 8)
                            }
                          </Badge>
                          <Badge variant='secondary'>
                            {t('booking.details.inspections.item.type')}:&nbsp;
                            {type === 'CHECK_OUT'
                              ? t('booking.details.inspections.type.checkout')
                              : type === 'CHECK_IN'
                              ? t('booking.details.inspections.type.checkin')
                              : type || t('booking.details.na')}
                          </Badge>
                        </div>
                        <Badge variant='default'>
                          {t('booking.details.inspections.item.status')}: {statusText}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                        <div className='space-y-1'>
                          <Label>{t('booking.details.inspections.item.odometer')}</Label>
                          <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                            {typeof odometer === 'number' ? odometer : t('booking.details.na')}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <Label>{t('booking.details.inspections.item.station')}</Label>
                          <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                            {stationName || t('booking.details.na')}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <Label>{t('booking.details.inspections.item.staff')}</Label>
                          <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                            {staffName || t('booking.details.na')}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <Label>{t('booking.details.inspections.item.time')}</Label>
                          <div className='p-2 border rounded-md bg-muted/50 min-h-[36px] flex items-center'>
                            {time ? formatDate(time) : t('booking.details.na')}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2 mt-3'>
                        <Label>{t('booking.details.inspections.item.damageNotes')}</Label>
                        <div className='p-2 border rounded-md bg-muted/50 min-h-[36px]'>
                          {damageNotes
                            ? damageNotes
                            : (!damageNotes && imageUrls.length === 0 && exteriorCondition === 'GOOD' && interiorCondition === 'GOOD' && tireCondition === 'GOOD'
                              ? t('booking.details.inspections.item.noIncidentAfterReturn')
                              : t('booking.details.na'))}
                        </div>
                      </div>

                      {/* Inspection summary */}
                      {(battery !== null || exteriorCondition || interiorCondition || tireCondition) && (
                        <div className='space-y-2 mt-3'>
                          <Label>{t('booking.details.inspections.item.checklist')}</Label>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                              <span>{t('booking.details.inspections.item.battery')}</span>
                              <Badge variant='outline' className={getBatteryBadgeClass(battery)}>
                                {battery !== null ? `${battery}%` : t('booking.details.na')}
                              </Badge>
                            </div>
                            <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                              <span>{t('booking.details.inspections.item.exteriorCondition')}</span>
                              <Badge variant='outline' className={getConditionBadgeClass(exteriorCondition)}>
                                {exteriorCondition || t('booking.details.na')}
                              </Badge>
                            </div>
                            <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                              <span>{t('booking.details.inspections.item.interiorCondition')}</span>
                              <Badge variant='outline' className={getConditionBadgeClass(interiorCondition)}>
                                {interiorCondition || t('booking.details.na')}
                              </Badge>
                            </div>
                            <div className='p-2 border rounded-md bg-muted/40 flex items-center justify-between'>
                              <span>{t('booking.details.inspections.item.tireCondition')}</span>
                              <Badge variant='outline' className={getConditionBadgeClass(tireCondition)}>
                                {tireCondition || t('booking.details.na')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Inspection images */}
                      {!noIncident && (
                        <div className='space-y-2 mt-3'>
                          <Label>{t('booking.details.inspections.item.images') || 'Inspection Images'}</Label>
                          {imageUrls.length > 0 ? (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                              {imageUrls.map((url, idx) => (
                                <div key={`${item?.id || 'img'}-${idx}`} className='rounded-md overflow-hidden border bg-muted/40'>
                                  <img
                                    src={url}
                                    alt={`inspection-${idx + 1}`}
                                    className='w-full h-24 object-cover'
                                    loading='lazy'
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
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              {t('booking.details.pricing.title')}
            </h3>

            <div className='space-y-2'>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.basePrice')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.basePrice)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.insurance')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.insuranceAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.tax')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.taxAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.discount')}:</span>
                <span className='font-medium text-green-600'>
                  -{formatPrice(booking.discountAmount)}
                </span>
              </div>
              <div className='flex justify-between p-2 border rounded-md bg-muted/50 font-bold'>
                <span>{t('booking.details.pricing.totalAmount')}:</span>
                <span>{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className='flex justify-between p-2 border rounded-md'>
                <span>{t('booking.details.pricing.deposit')}:</span>
                <span className='font-medium'>
                  {formatPrice(booking.depositAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('booking.details.paymentHistory')}</h3>
              <div className='space-y-2'>
                {booking.payments.map(payment => (
                  <div
                    key={payment.id}
                    className='flex justify-between items-center p-3 border rounded-md'
                  >
                    <div>
                      <p className='font-medium'>
                        {t('booking.details.payment')} #
                        {payment.id.substring(0, 8)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {t('booking.details.status')}: {payment.status}
                      </p>
                    </div>
                    <p className='font-medium'>{formatPrice(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
