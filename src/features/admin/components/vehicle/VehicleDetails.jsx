import { ImageIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { apiClient } from '../../../shared/lib/apiClient';
import { endpoints } from '../../../shared/lib/endpoints';
import { formatCurrency } from '../../../shared/lib/utils';
import { Badge } from './../../../shared/components/ui/badge';

// Vehicle status options
const VEHICLE_STATUS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

// Vehicle types
const VEHICLE_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'COUPE', label: 'Coupe' },
];

// Fuel types
const FUEL_TYPES = [
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export function VehicleDetails({
  open,
  onOpenChange,
  vehicle,
  onUpdate,
  onImageUpload,
  loading = false,
}) {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const validationSchema = Yup.object({
    brand: Yup.string().required(
      t('vehicle.validation.required') || 'Required'
    ),
    model: Yup.string().required(
      t('vehicle.validation.required') || 'Required'
    ),
    type: Yup.string().required(
      t('vehicle.validation.required') || 'Required'
    ),
    year: Yup.number()
      .typeError(t('vehicle.validation.invalidYear'))
      .required(t('vehicle.validation.required') || 'Required')
      .integer(t('vehicle.validation.wholeNumber'))
      .min(1990, t('vehicle.validation.invalidYear'))
      .max(new Date().getFullYear(), t('vehicle.validation.invalidYear')),
    fuelType: Yup.string().required(
      t('vehicle.validation.required') || 'Required'
    ),
    batteryLevel: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(0, t('vehicle.validation.invalidBattery'))
      .max(100, t('vehicle.validation.invalidBattery')),
    seats: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(1, t('vehicle.validation.minSeats')),
    baseRate: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .positive(t('vehicle.validation.positive')),
    hourlyRate: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .positive(t('vehicle.validation.positive')),
    weeklyRate: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(0, t('vehicle.validation.minZero')),
    monthlyRate: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(0, t('vehicle.validation.minZero')),
    depositAmount: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(0, t('vehicle.validation.minZero')),
    insuranceRate: Yup.number()
      .nullable()
      .transform((v, o) => (o === '' ? null : v))
      .min(0, t('vehicle.validation.minZero'))
      .max(1, t('vehicle.validation.maxOne')),
  });

  const formik = useFormik({
    initialValues: {
      stationId: '',
      type: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      seats: '',
      licensePlate: '',
      batteryLevel: '',
      fuelType: '',
      status: 'AVAILABLE',
      baseRate: '',
      hourlyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      depositAmount: '',
      insuranceRate: '',
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async values => {
      try {
        setServerErrors({});
        const numericFields = [
          'year',
          'seats',
          'batteryLevel',
          'baseRate',
          'hourlyRate',
          'weeklyRate',
          'monthlyRate',
          'depositAmount',
          'insuranceRate',
        ];
        const payload = Object.entries(values).reduce((acc, [k, v]) => {
          if (v === '' || v === null || v === undefined) return acc;
          if (!numericFields.includes(k)) {
            acc[k] = typeof v === 'string' ? v.trim() : v;
            return acc;
          }
          const num = Number(v);
          acc[k] = Number.isFinite(num) ? num : v;
          return acc;
        }, {});

        const updatedVehicle = await onUpdate(vehicle.id, payload);
        setIsEditing(false);
        if (updatedVehicle) {
          formik.setValues({
            stationId: updatedVehicle.stationId || '',
            type: updatedVehicle.type || '',
            brand: updatedVehicle.brand || '',
            model: updatedVehicle.model || '',
            year: updatedVehicle.year?.toString() || '',
            color: updatedVehicle.color || '',
            seats: updatedVehicle.seats?.toString() || '',
            licensePlate: updatedVehicle.licensePlate || '',
            batteryLevel: updatedVehicle.batteryLevel?.toString() || '',
            fuelType: updatedVehicle.fuelType || '',
            status: updatedVehicle.status || 'AVAILABLE',
            baseRate: updatedVehicle.pricing?.baseRate?.toString() || '',
            hourlyRate: updatedVehicle.pricing?.hourlyRate?.toString() || '',
            weeklyRate: updatedVehicle.pricing?.weeklyRate?.toString() || '',
            monthlyRate: updatedVehicle.pricing?.monthlyRate?.toString() || '',
            depositAmount: updatedVehicle.pricing?.depositAmount?.toString() || '',
            insuranceRate: updatedVehicle.pricing?.insuranceRate?.toString() || '',
          });
        }
      } catch (err) {
        const errData = err?.response?.data;
        if (errData?.errors && typeof errData.errors === 'object') {
          setServerErrors(errData.errors);
        } else if (errData?.message) {
          setServerErrors({ _form: errData.message });
        } else {
          setServerErrors({ _form: err?.message || String(err) });
        }
      }
    },
  });

  // Update formData when vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      formik.setValues({
        stationId: vehicle.stationId || '',
        type: vehicle.type || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        seats: vehicle.seats?.toString() || '',
        licensePlate: vehicle.licensePlate || '',
        batteryLevel: vehicle.batteryLevel?.toString() || '',
        fuelType: vehicle.fuelType || '',
        status: vehicle.status || 'AVAILABLE',
        baseRate: vehicle.pricing?.baseRate?.toString() || '',
        hourlyRate: vehicle.pricing?.hourlyRate?.toString() || '',
        weeklyRate: vehicle.pricing?.weeklyRate?.toString() || '',
        monthlyRate: vehicle.pricing?.monthlyRate?.toString() || '',
        depositAmount: vehicle.pricing?.depositAmount?.toString() || '',
        insuranceRate: vehicle.pricing?.insuranceRate?.toString() || '',
      });
      loadVehicleImages(vehicle.id);
    }
  }, [
    vehicle?.id,
    vehicle?.brand,
    vehicle?.model,
    vehicle?.status,
    vehicle?.updatedAt,
  ]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setServerErrors({});
    }
  }, [open]);

  const loadVehicleImages = async vehicleId => {
    try {
      const response = await apiClient.get(endpoints.vehicles.getImages(vehicleId));
      if (response.success) {
        setVehicleImages(response.data.images || []);
      }
    } catch (error) {
      console.error('Failed to load vehicle images:', error);
    }
  };

  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('vehicle.images.notImage'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('vehicle.images.exceedsLimit'));
      return;
    }

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('images', file);

      const response = await apiClient.post(
        endpoints.vehicles.uploadImage(vehicle.id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.success) {
        toast.success(t('vehicle.images.uploadSuccess'));
        loadVehicleImages(vehicle.id);
        // Notify parent component to refresh images
        if (onImageUpload) {
          onImageUpload(vehicle.id);
        }
      }
    } catch (error) {
      toast.error(t('vehicle.images.uploadFailed') + ': ' + error.message);
      console.log(error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async imageId => {
    if (!confirm(t('vehicle.images.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiClient.delete(
        endpoints.vehicles.deleteImage(vehicle.id, imageId)
      );
      if (response.success) {
        toast.success(t('vehicle.images.deleteSuccess'));
        loadVehicleImages(vehicle.id);
        // Notify parent component to refresh images
        if (onImageUpload) {
          onImageUpload(vehicle.id);
        }
      }
    } catch (error) {
      toast.error(t('vehicle.images.deleteFailed') + ': ' + error.message);
    }
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'RENTED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'outline';
      case 'OUT_OF_SERVICE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'AVAILABLE':
        return t('vehicle.status.available');
      case 'RENTED':
        return t('vehicle.status.rented');
      case 'MAINTENANCE':
        return t('vehicle.status.maintenance');
      case 'OUT_OF_SERVICE':
        return t('vehicle.status.outOfService');
      default:
        return status;
    }
  };

  const getTypeLabel = type => {
    switch (type) {
      case 'SEDAN':
        return t('vehicle.types.sedan');
      case 'SUV':
        return t('vehicle.types.suv');
      case 'HATCHBACK':
        return t('vehicle.types.hatchback');
      case 'COUPE':
        return t('vehicle.types.coupe');
      default:
        return type;
    }
  };

  const getFuelTypeLabel = fuelType => {
    switch (fuelType) {
      case 'ELECTRIC':
        return t('vehicle.fuel.electric');
      case 'HYBRID':
        return t('vehicle.fuel.hybrid');
      default:
        return fuelType;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return t('vehicle.table.na');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('vehicle.messages.invalidDate');
    const locale = i18n?.language === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // renderError helper used by the JSX to show Formik or server errors under fields
  const renderError = field =>
    ((formik && formik.touched?.[field] && formik.errors?.[field]) ||
      serverErrors?.[field]) ? (
      <p className='text-red-500 text-sm mt-1'>
        {(formik && formik.errors?.[field]) || serverErrors[field]}
      </p>
    ) : null;

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('vehicle.details.title')}</DialogTitle>
          <DialogDescription>{t('vehicle.details.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit}>
          <div className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('vehicle.sections.basicInfo')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='brand'>{t('vehicle.fields.brand')}</Label>
                  {isEditing ? (
                    <Input
                      id='brand'
                      name='brand'
                      value={formik.values.brand}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.brand}
                    </div>
                  )}
                  {isEditing && renderError('brand')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='model'>{t('vehicle.fields.model')}</Label>
                  {isEditing ? (
                    <Input
                      id='model'
                      name='model'
                      value={formik.values.model}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.model}
                    </div>
                  )}
                  {isEditing && renderError('model')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='type'>{t('vehicle.fields.type')}</Label>
                  {isEditing ? (
                    <Select
                      value={formik.values.type}
                      onValueChange={value => formik.setFieldValue('type', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {getTypeLabel(type.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      <Badge variant='default'>
                        {getTypeLabel(vehicle.type)}
                      </Badge>
                    </div>
                  )}
                  {isEditing && renderError('type')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='year'>{t('vehicle.fields.year')}</Label>
                  {isEditing ? (
                    <Input
                      id='year'
                      name='year'
                      type='number'
                      value={formik.values.year}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.year}
                    </div>
                  )}
                  {isEditing && renderError('year')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='color'>{t('vehicle.fields.color')}</Label>
                  {isEditing ? (
                    <Input
                      id='color'
                      name='color'
                      value={formik.values.color}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.color || t('vehicle.table.na')}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='seats'>{t('vehicle.fields.seats')}</Label>
                  {isEditing ? (
                    <Input
                      id='seats'
                      name='seats'
                      type='number'
                      value={formik.values.seats}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.seats}
                    </div>
                  )}
                  {isEditing && renderError('seats')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='licensePlate'>{t('vehicle.fields.licensePlate')}</Label>
                  {isEditing ? (
                    <Input
                      id='licensePlate'
                      name='licensePlate'
                      value={formik.values.licensePlate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.licensePlate || t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('licensePlate')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='fuelType'>{t('vehicle.fields.fuelType')}</Label>
                  {isEditing ? (
                    <Select
                      value={formik.values.fuelType}
                      onValueChange={value => formik.setFieldValue('fuelType', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map(fuel => (
                          <SelectItem key={fuel.value} value={fuel.value}>
                            {getFuelTypeLabel(fuel.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      <Badge variant='outline'>
                        {getFuelTypeLabel(vehicle.fuelType)}
                      </Badge>
                    </div>
                  )}
                  {isEditing && renderError('fuelType')}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('vehicle.sections.technicalDetails')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='batteryLevel'>{t('vehicle.fields.batteryLevel')}</Label>
                  {isEditing ? (
                    <Input
                      id='batteryLevel'
                      name='batteryLevel'
                      type='number'
                      min='0'
                      max='100'
                      value={formik.values.batteryLevel}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.fuelType === 'ELECTRIC' ||
                        vehicle.fuelType === 'HYBRID'
                        ? `${vehicle.batteryLevel}%`
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('batteryLevel')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>{t('vehicle.fields.status')}</Label>
                  {isEditing ? (
                    <Select
                      value={formik.values.status}
                      onValueChange={value => formik.setFieldValue('status', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_STATUS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {getStatusLabel(status.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                        {getStatusLabel(vehicle.status)}
                      </Badge>
                    </div>
                  )}
                  {isEditing && renderError('status')}
                </div>

                <div className='space-y-2'>
                  <Label>{t('vehicle.fields.station')}</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.station?.name || t('vehicle.table.na')}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>{t('vehicle.fields.vehicleId')}</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center font-mono text-sm'>
                    {vehicle.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('vehicle.pricing.title')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='baseRate'>{t('vehicle.pricing.baseRate')}</Label>
                  {isEditing ? (
                    <Input
                      id='baseRate'
                      name='baseRate'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formik.values.baseRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.baseRate
                        ? formatCurrency(vehicle.pricing.baseRate, 'VND')
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('baseRate')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='hourlyRate'>{t('vehicle.pricing.hourlyRate')}</Label>
                  {isEditing ? (
                    <Input
                      id='hourlyRate'
                      name='hourlyRate'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formik.values.hourlyRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.hourlyRate
                        ? formatCurrency(vehicle.pricing.hourlyRate, 'VND')
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('hourlyRate')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='weeklyRate'>{t('vehicle.pricing.weeklyRate')}</Label>
                  {isEditing ? (
                    <Input
                      id='weeklyRate'
                      name='weeklyRate'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formik.values.weeklyRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.weeklyRate
                        ? formatCurrency(vehicle.pricing.weeklyRate, 'VND')
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('weeklyRate')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='monthlyRate'>{t('vehicle.pricing.monthlyRate')}</Label>
                  {isEditing ? (
                    <Input
                      id='monthlyRate'
                      name='monthlyRate'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formik.values.monthlyRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.monthlyRate
                        ? formatCurrency(vehicle.pricing.monthlyRate, 'VND')
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('monthlyRate')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='depositAmount'>{t('vehicle.pricing.depositAmount')}</Label>
                  {isEditing ? (
                    <Input
                      id='depositAmount'
                      name='depositAmount'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formik.values.depositAmount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.depositAmount
                        ? formatCurrency(vehicle.pricing.depositAmount, 'VND')
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('depositAmount')}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='insuranceRate'>{t('vehicle.pricing.insuranceRate')}</Label>
                  {isEditing ? (
                    <Input
                      id='insuranceRate'
                      name='insuranceRate'
                      type='number'
                      min='0'
                      max='1'
                      step='0.01'
                      value={formik.values.insuranceRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      {vehicle.pricing?.insuranceRate
                        ? `${(vehicle.pricing.insuranceRate * 100).toFixed(1)}%`
                        : t('vehicle.table.na')}
                    </div>
                  )}
                  {isEditing && renderError('insuranceRate')}
                </div>
              </div>
            </div>

            {/* Vehicle Images */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>{t('vehicle.images.title')}</h3>
                {isEditing && (
                  <div className='flex items-center gap-2'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                      id='image-upload'
                      disabled={imageLoading}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        document.getElementById('image-upload').click()
                      }
                      disabled={imageLoading}
                    >
                      <UploadIcon className='mr-2 h-4 w-4' />
                      {imageLoading ? t('vehicle.images.uploading') : t('vehicle.images.uploadImage')}
                    </Button>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {vehicleImages.length > 0 ? (
                  vehicleImages.map(image => (
                    <div key={image.id} className='relative group'>
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.fileName}
                        className='w-full h-32 object-cover rounded-lg border'
                      />
                      {isEditing && (
                        <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <TrashIcon className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                      <div className='absolute top-2 left-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {Math.round(image.size / 1024)}KB
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='col-span-full text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg'>
                    <ImageIcon className='mx-auto h-12 w-12 mb-2' />
                    <p>{t('vehicle.images.noImagesAvailable')}</p>
                    {!isEditing && (
                      <p className='text-sm'>
                        {t('vehicle.images.clickToUpload')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('vehicle.timeline.title')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>{t('vehicle.timeline.createdAt')}</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {formatDate(vehicle.createdAt)}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>{t('vehicle.timeline.updatedAt')}</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {formatDate(vehicle.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {serverErrors._form && (
            <div className='text-red-600 text-sm mt-3'>{serverErrors._form}</div>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-end gap-2 pt-4'>
            {isEditing ? (
              <>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => {
                    setIsEditing(false);
                    formik.resetForm();
                    setServerErrors({});
                  }}
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  {t('vehicle.actions.cancel')}
                </Button>
                <Button
                  type='submit'
                  disabled={loading || formik.isSubmitting}
                  className='w-full sm:w-auto'
                >
                  {formik.isSubmitting ? t('vehicle.actions.saving') : t('vehicle.actions.saveChanges')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => onOpenChange(false)}
                  className='w-full sm:w-auto'
                >
                  {t('vehicle.actions.close')}
                </Button>
                <Button onClick={() => setIsEditing(true)} className='w-full sm:w-auto'>
                  {t('vehicle.actions.edit')}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
