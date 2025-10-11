import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../shared/lib/apiClient';
import { endpoints } from '../../../shared/lib/endpoints';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../../../shared/components/ui/select';
import { ImageIcon, UploadIcon, TrashIcon } from 'lucide-react';

export default function CarForm({ stations = [], onCreated, onCancel, loading = false }) {
    const { t } = useTranslation();
    const [serverErrors, setServerErrors] = useState({});
    const [tempImages, setTempImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    const FUEL_TYPES = [
        { value: 'ELECTRIC', label: t('vehicle.fuel.electric') },
        { value: 'HYBRID', label: t('vehicle.fuel.hybrid') },
    ];

    const VEHICLE_TYPES = [
        { value: 'SEDAN', label: t('vehicle.types.sedan') },
        { value: 'SUV', label: t('vehicle.types.suv') },
        { value: 'HATCHBACK', label: t('vehicle.types.hatchback') },
        { value: 'COUPE', label: t('vehicle.types.coupe') },
    ];

    const VEHICLE_STATUS = [
        { value: 'AVAILABLE', label: t('vehicle.status.available') || 'Available' },
        { value: 'RENTED', label: t('vehicle.status.rented') || 'Rented' },
        { value: 'MAINTENANCE', label: t('vehicle.status.maintenance') || 'Maintenance' },
        { value: 'OUT_OF_SERVICE', label: t('vehicle.status.outOfService') || 'Out of Service' },
    ];

    const validationSchema = Yup.object({
        stationId: Yup.string().required(t('vehicle.validation.required')),
        type: Yup.string().required(t('vehicle.validation.required')),
        brand: Yup.string().required(t('vehicle.validation.required')),
        model: Yup.string().required(t('vehicle.validation.required')),
        year: Yup.number()
            .typeError(t('vehicle.validation.invalidYear') || 'Must be a valid year')
            .required(t('vehicle.validation.required'))
            .integer('Must be a whole number')
            .min(1990, t('vehicle.validation.invalidYear'))
            .max(new Date().getFullYear(), t('vehicle.validation.invalidYear') || `Maximum year is ${new Date().getFullYear()}`),
        fuelType: Yup.string().required(t('vehicle.validation.required')),
        baseRate: Yup.number().required(t('vehicle.validation.required')).positive(),
        hourlyRate: Yup.number().required(t('vehicle.validation.required')).positive(),
        depositAmount: Yup.number().required(t('vehicle.validation.required')).positive(),
        batteryLevel: Yup.number()
            .nullable()
            .transform((v, o) => (o === '' ? null : v))
            .min(0, t('vehicle.validation.invalidBattery'))
            .max(100, t('vehicle.validation.invalidBattery')),
        seats: Yup.number()
            .nullable()
            .transform((v, o) => (o === '' ? null : v))
            .min(1, 'Must be at least 1'),
        weeklyRate: Yup.number()
            .nullable()
            .transform((v, o) => (o === '' ? null : v))
            .min(0, 'Must be >= 0'),
        monthlyRate: Yup.number()
            .nullable()
            .transform((v, o) => (o === '' ? null : v))
            .min(0, 'Must be >= 0'),
        insuranceRate: Yup.number()
            .nullable()
            .transform((v, o) => (o === '' ? null : v))
            .min(0, 'Must be >= 0')
            .max(1, 'Must be <= 1'),
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
        validateOnChange: false, // Only validate on blur for better UX
        validateOnMount: false,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setServerErrors({});
                // Build payload: only convert known numeric fields to Number.
                const numericFields = [
                    'year',
                    'seats',
                    'batteryLevel',
                    'baseRate',
                    'hourlyRate',
                    'weeklyRate',
                    'monthlyRate',
                    'depositAmount',
                    'insuranceRate'
                ];

                const payload = Object.entries(values).reduce((acc, [k, v]) => {
                    // treat empty string as undefined (omit)
                    if (v === '' || v === null || v === undefined) return acc;

                    // keep strings trimmed for string fields
                    if (!numericFields.includes(k)) {
                        acc[k] = typeof v === 'string' ? v.trim() : v;
                        return acc;
                    }

                    // numeric fields: try to convert, otherwise keep original (client-side validation should prevent)
                    const num = Number(v);
                    acc[k] = Number.isFinite(num) ? num : v;
                    return acc;
                }, {});

                const response = await apiClient.post(endpoints.vehicles.create(), payload);
                const success = response?.success ?? (response?.status === 200 || response?.status === 201);

                if (success) {
                    const createdVehicle = response?.data?.vehicle ?? response?.data;

                    // Upload images if any
                    if (tempImages.length > 0 && createdVehicle?.id) {
                        await uploadImagesForVehicle(createdVehicle.id);
                    }

                    toast.success(t('vehicle.messages.createSuccess') || 'Vehicle created');
                    onCreated?.(createdVehicle);
                    onCancel?.();
                    resetForm();
                    setTempImages([]);
                } else {
                    const errors = response?.data?.errors ?? response?.data?.validationErrors ?? null;
                    if (errors && typeof errors === 'object') {
                        setServerErrors(errors);
                    } else {
                        setServerErrors({ _form: response?.data?.message || 'Create failed' });
                    }
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
            } finally {
                setSubmitting(false);
            }
        },
    });

    const uploadImagesForVehicle = async (vehicleId) => {
        try {
            setImageLoading(true);
            const uploadPromises = tempImages.map(async (imageFile) => {
                const formData = new FormData();
                formData.append('images', imageFile);
                return apiClient.post(
                    endpoints.vehicles.uploadImage(vehicleId),
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            });

            const results = await Promise.allSettled(uploadPromises);
            const failedCount = results.filter(r => r.status === 'rejected').length;

            if (failedCount > 0) {
                toast.warning(`${tempImages.length - failedCount}/${tempImages.length} images uploaded successfully`);
            } else {
                toast.success(`All ${tempImages.length} images uploaded successfully`);
            }
        } catch (error) {
            console.error('Failed to upload images:', error);
            toast.error('Some images failed to upload');
        } finally {
            setImageLoading(false);
        }
    };

    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setTempImages(prev => [...prev, ...validFiles]);
            toast.success(`${validFiles.length} image(s) added`);
        }

        // Reset input
        event.target.value = '';
    };

    const handleRemoveTempImage = (index) => {
        setTempImages(prev => prev.filter((_, i) => i !== index));
        toast.success('Image removed');
    };

    const renderError = (field) =>
        (formik.touched[field] && formik.errors[field]) || serverErrors[field] ? (
            <p className='text-red-500 text-sm mt-1'>{formik.errors[field] || serverErrors[field]}</p>
        ) : null;

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className='space-y-6'>
                {/* Basic Information */}
                <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Basic Information</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='brand'>{t('vehicle.fields.brand')} *</Label>
                            <Input
                                id='brand'
                                name='brand'
                                value={formik.values.brand}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.brandPlaceholder')}
                                className={formik.errors.brand && formik.touched.brand ? 'border-red-500' : ''}
                            />
                            {renderError('brand')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='model'>{t('vehicle.fields.model')} *</Label>
                            <Input
                                id='model'
                                name='model'
                                value={formik.values.model}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.modelPlaceholder')}
                                className={formik.errors.model && formik.touched.model ? 'border-red-500' : ''}
                            />
                            {renderError('model')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='type'>{t('vehicle.fields.type')} *</Label>
                            <Select
                                value={formik.values.type}
                                onValueChange={(v) => formik.setFieldValue('type', v)}
                                disabled={loading}
                            >
                                <SelectTrigger className={formik.errors.type && formik.touched.type ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('vehicle.fields.typePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {VEHICLE_TYPES.map((x) => (
                                        <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError('type')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='year'>{t('vehicle.fields.year')} *</Label>
                            <Input
                                id='year'
                                type='number'
                                name='year'
                                min='1990'
                                max={new Date().getFullYear()}
                                value={formik.values.year}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.yearPlaceholder')}
                                className={formik.errors.year && formik.touched.year ? 'border-red-500' : ''}
                            />
                            {renderError('year')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='color'>{t('vehicle.fields.color')}</Label>
                            <Input
                                id='color'
                                name='color'
                                value={formik.values.color}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.colorPlaceholder')}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='seats'>{t('vehicle.fields.seats')}</Label>
                            <Input
                                id='seats'
                                type='number'
                                name='seats'
                                value={formik.values.seats}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.seatsPlaceholder')}
                                className={formik.errors.seats && formik.touched.seats ? 'border-red-500' : ''}
                            />
                            {renderError('seats')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='licensePlate'>{t('vehicle.fields.licensePlate')}</Label>
                            <Input
                                id='licensePlate'
                                name='licensePlate'
                                value={formik.values.licensePlate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.licensePlatePlaceholder')}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='fuelType'>{t('vehicle.fields.fuelType')} *</Label>
                            <Select
                                value={formik.values.fuelType}
                                onValueChange={(v) => formik.setFieldValue('fuelType', v)}
                                disabled={loading}
                            >
                                <SelectTrigger className={formik.errors.fuelType && formik.touched.fuelType ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('vehicle.fields.fuelTypePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {FUEL_TYPES.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError('fuelType')}
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Technical Details</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='batteryLevel'>{t('vehicle.fields.batteryLevel')} (%)</Label>
                            <Input
                                id='batteryLevel'
                                type='number'
                                name='batteryLevel'
                                min='0'
                                max='100'
                                value={formik.values.batteryLevel}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('vehicle.fields.batteryLevelPlaceholder')}
                                className={formik.errors.batteryLevel && formik.touched.batteryLevel ? 'border-red-500' : ''}
                            />
                            {renderError('batteryLevel')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='status'>{t('vehicle.fields.status')}</Label>
                            <Select
                                value={formik.values.status}
                                onValueChange={(v) => formik.setFieldValue('status', v)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('vehicle.fields.statusPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {VEHICLE_STATUS.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='stationId'>{t('vehicle.fields.station')} *</Label>
                            <Select
                                value={formik.values.stationId}
                                onValueChange={(v) => formik.setFieldValue('stationId', v)}
                                disabled={loading}
                            >
                                <SelectTrigger className={formik.errors.stationId && formik.touched.stationId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('vehicle.fields.stationPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {stations.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError('stationId')}
                        </div>
                    </div>
                </div>

                {/* Pricing Information */}
                <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Pricing Information</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='baseRate'>Base Rate (Daily) *</Label>
                            <Input
                                id='baseRate'
                                type='number'
                                name='baseRate'
                                step='0.01'
                                min='0'
                                value={formik.values.baseRate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='200.00'
                                className={formik.errors.baseRate && formik.touched.baseRate ? 'border-red-500' : ''}
                            />
                            {renderError('baseRate')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='hourlyRate'>Hourly Rate *</Label>
                            <Input
                                id='hourlyRate'
                                type='number'
                                name='hourlyRate'
                                step='0.01'
                                min='0'
                                value={formik.values.hourlyRate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='15.00'
                                className={formik.errors.hourlyRate && formik.touched.hourlyRate ? 'border-red-500' : ''}
                            />
                            {renderError('hourlyRate')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='weeklyRate'>Weekly Rate</Label>
                            <Input
                                id='weeklyRate'
                                type='number'
                                name='weeklyRate'
                                step='0.01'
                                min='0'
                                value={formik.values.weeklyRate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='1200.00'
                                className={formik.errors.weeklyRate && formik.touched.weeklyRate ? 'border-red-500' : ''}
                            />
                            {renderError('weeklyRate')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='monthlyRate'>Monthly Rate</Label>
                            <Input
                                id='monthlyRate'
                                type='number'
                                name='monthlyRate'
                                step='0.01'
                                min='0'
                                value={formik.values.monthlyRate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='4500.00'
                                className={formik.errors.monthlyRate && formik.touched.monthlyRate ? 'border-red-500' : ''}
                            />
                            {renderError('monthlyRate')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='depositAmount'>Deposit Amount *</Label>
                            <Input
                                id='depositAmount'
                                type='number'
                                name='depositAmount'
                                step='0.01'
                                min='0'
                                value={formik.values.depositAmount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='500.00'
                                className={formik.errors.depositAmount && formik.touched.depositAmount ? 'border-red-500' : ''}
                            />
                            {renderError('depositAmount')}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='insuranceRate'>Insurance Rate (%)</Label>
                            <Input
                                id='insuranceRate'
                                type='number'
                                name='insuranceRate'
                                step='0.01'
                                min='0'
                                max='1'
                                value={formik.values.insuranceRate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder='0.10 (10%)'
                                className={formik.errors.insuranceRate && formik.touched.insuranceRate ? 'border-red-500' : ''}
                            />
                            {renderError('insuranceRate')}
                        </div>
                    </div>
                </div>

                {/* Vehicle Images */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold'>Vehicle Images</h3>
                        <div className='flex items-center gap-2'>
                            <input
                                type='file'
                                accept='image/*'
                                multiple
                                onChange={handleImageSelect}
                                className='hidden'
                                id='image-upload'
                                disabled={imageLoading || formik.isSubmitting}
                            />
                            <Button
                                variant='outline'
                                size='sm'
                                type='button'
                                onClick={() => document.getElementById('image-upload').click()}
                                disabled={imageLoading || formik.isSubmitting}
                            >
                                <UploadIcon className='mr-2 h-4 w-4' />
                                {imageLoading ? 'Uploading...' : 'Select Images'}
                            </Button>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {tempImages.length > 0 ? (
                            tempImages.map((imageFile, index) => (
                                <div key={index} className='relative group'>
                                    <img
                                        src={URL.createObjectURL(imageFile)}
                                        alt={imageFile.name}
                                        className='w-full h-32 object-cover rounded-lg border'
                                    />
                                    <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
                                        <Button
                                            size='sm'
                                            variant='destructive'
                                            type='button'
                                            onClick={() => handleRemoveTempImage(index)}
                                            disabled={formik.isSubmitting}
                                        >
                                            <TrashIcon className='h-4 w-4' />
                                        </Button>
                                    </div>
                                    <div className='absolute top-2 left-2'>
                                        <span className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded'>
                                            {Math.round(imageFile.size / 1024)}KB
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='col-span-full text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg'>
                                <ImageIcon className='mx-auto h-12 w-12 mb-2 opacity-50' />
                                <p className='text-sm'>No images selected</p>
                                <p className='text-xs mt-1'>Click "Select Images" to add photos (max 5MB each)</p>
                            </div>
                        )}
                    </div>

                    {tempImages.length > 0 && (
                        <p className='text-sm text-muted-foreground'>
                            {tempImages.length} image(s) will be uploaded after vehicle creation
                        </p>
                    )}
                </div>
            </div>

            {serverErrors._form && <div className='text-red-600 text-sm mt-3'>{serverErrors._form}</div>}

            <div className='flex flex-col sm:flex-row justify-end gap-2 pt-4'>
                <Button
                    variant='outline'
                    type='button'
                    onClick={() => onCancel?.()}
                    disabled={loading || formik.isSubmitting}
                    className='w-full sm:w-auto'
                >
                    {t('vehicle.actions.cancel')}
                </Button>
                <Button type='submit' disabled={loading || formik.isSubmitting || imageLoading} className='w-full sm:w-auto'>
                    {formik.isSubmitting
                        ? t('vehicle.actions.creating') || 'Creating...'
                        : t('vehicle.actions.create')}
                </Button>
            </div>
        </form>
    );
}
