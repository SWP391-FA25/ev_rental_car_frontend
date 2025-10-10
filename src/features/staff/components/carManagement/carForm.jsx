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

// CarForm: props { stations = [], onCreated, onCancel, loading }
export default function CarForm({ stations = [], onCreated, onCancel, loading = false }) {
    const { t } = useTranslation();
    // server / form level validation errors displayed under inputs
    const [serverErrors, setServerErrors] = useState({});

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

    // ✅ Validation schema with Yup
    const validationSchema = Yup.object({
        stationId: Yup.string().required(t('vehicle.validation.required')),
        type: Yup.string().required(t('vehicle.validation.required')),
        brand: Yup.string().required(t('vehicle.validation.required')),
        model: Yup.string().required(t('vehicle.validation.required')),
        year: Yup.number()
            .required(t('vehicle.validation.required'))
            .min(1990, t('vehicle.validation.invalidYear'))
            .max(new Date().getFullYear() + 1, t('vehicle.validation.invalidYear')),
        fuelType: Yup.string().required(t('vehicle.validation.required')),
        baseRate: Yup.number().required(t('vehicle.validation.required')),
        hourlyRate: Yup.number().required(t('vehicle.validation.required')),
        depositAmount: Yup.number().required(t('vehicle.validation.required')),
        batteryLevel: Yup.number()
            .nullable()
            .min(0, t('vehicle.validation.invalidBattery'))
            .max(100, t('vehicle.validation.invalidBattery')),
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
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                // clear previous server errors before submit
                setServerErrors({});
                const payload = Object.entries(values).reduce((acc, [k, v]) => {
                    const val = v === '' ? undefined : v;
                    if (val !== undefined) acc[k] = isNaN(val) ? val : Number(val);
                    return acc;
                }, {});

                console.debug('CarForm payload:', payload);
                const response = await apiClient.post(endpoints.vehicles.create(), payload);
                console.debug('CarForm response:', response);

                const success = response?.success ?? (response?.status === 200 || response?.status === 201);
                if (success) {
                    toast.success(t('vehicle.messages.createSuccess') || 'Vehicle created');
                    const created = response?.data?.vehicle ?? response?.data ?? null;
                    onCreated?.(created);
                    onCancel?.();
                    resetForm();
                } else {
                    // if backend returns validation errors object, display under inputs
                    const errors = response?.data?.errors ?? response?.data?.validationErrors ?? null;
                    if (errors && typeof errors === 'object') {
                        setServerErrors(errors);
                    } else {
                        // fallback to show form-level error
                        setServerErrors({ _form: response?.data?.message || response?.message || 'Create failed' });
                    }
                }
            } catch (err) {
                console.error('CarForm create error', err);
                // If API returns structured errors, show them under fields; otherwise show form-level message
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

    // log when stations prop / form mounts or changes
    useEffect(() => {
        console.debug('CarForm mounted/updated, stations:', stations);
    }, [stations]);

    // helper: mark all fields touched
    const markAllTouched = () => {
        const touched = Object.keys(formik.initialValues || {}).reduce((acc, k) => (acc[k] = true, acc), {});
        formik.setTouched(touched);
        // clear previous server errors when user re-validates
        setServerErrors({});
    };

    // wrapper submit: validate first, toast if errors, otherwise submit
    const handleSubmitWithNotify = async (e) => {
        e?.preventDefault?.();
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.debug('CarForm validation errors:', errors);
            // show errors under inputs instead of toast (modal covers toast)
            setServerErrors(errors);
            markAllTouched();
            return;
        }
        // no validation errors -> proceed
        console.debug('CarForm submitting values:', formik.values);
        formik.handleSubmit();
    };

    return (
        <form onSubmit={handleSubmitWithNotify}>
            <div className='grid grid-cols-2 gap-4 py-4'>
                {/* Station */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.station')} *</Label>
                    <Select
                        value={formik.values.stationId}
                        onValueChange={(v) => formik.setFieldValue('stationId', v)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('vehicle.fields.stationPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {stations.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {formik.touched.stationId && formik.errors.stationId && (
                        <p className='text-red-500 text-sm'>{formik.errors.stationId}</p>
                    )}
                </div>

                {/* Type */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.type')} *</Label>
                    <Select
                        value={formik.values.type}
                        onValueChange={(v) => formik.setFieldValue('type', v)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('vehicle.fields.typePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {VEHICLE_TYPES.map((x) => (
                                <SelectItem key={x.value} value={x.value}>
                                    {x.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {formik.touched.type && formik.errors.type && (
                        <p className='text-red-500 text-sm'>{formik.errors.type}</p>
                    )}
                </div>

                {/* Brand */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.brand')} *</Label>
                    <Input
                        name='brand'
                        value={formik.values.brand}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('vehicle.fields.brandPlaceholder')}
                    />
                    {(formik.touched.brand && formik.errors.brand) || serverErrors.brand ? (
                        <p className='text-red-500 text-sm'>{formik.errors.brand || serverErrors.brand}</p>
                    ) : null}
                </div>

                {/* Model */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.model')} *</Label>
                    <Input
                        name='model'
                        value={formik.values.model}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('vehicle.fields.modelPlaceholder')}
                    />
                    {(formik.touched.model && formik.errors.model) || serverErrors.model ? (
                        <p className='text-red-500 text-sm'>{formik.errors.model || serverErrors.model}</p>
                    ) : null}
                </div>

                {/* Year */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.year')} *</Label>
                    <Input
                        type='number'
                        name='year'
                        value={formik.values.year}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('vehicle.fields.yearPlaceholder')}
                    />
                    {(formik.touched.year && formik.errors.year) || serverErrors.year ? (
                        <p className='text-red-500 text-sm'>{formik.errors.year || serverErrors.year}</p>
                    ) : null}
                </div>

                {/* Fuel Type */}
                <div className='space-y-2'>
                    <Label>{t('vehicle.fields.fuelType')} *</Label>
                    <Select
                        value={formik.values.fuelType}
                        onValueChange={(v) => formik.setFieldValue('fuelType', v)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('vehicle.fields.fuelTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {FUEL_TYPES.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(formik.touched.fuelType && formik.errors.fuelType) || serverErrors.fuelType ? (
                        <p className='text-red-500 text-sm'>{formik.errors.fuelType || serverErrors.fuelType}</p>
                    ) : null}
                </div>
            </div>

            {/* Pricing section */}
            <div className='border-t pt-4'>
                <h3 className='text-lg font-semibold mb-4'>
                    {t('vehicle.dialogs.create.pricingTitle') || 'Pricing Information'}
                </h3>

                <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label>Base Rate (Daily) *</Label>
                        <Input
                            type='number'
                            name='baseRate'
                            step='0.01'
                            value={formik.values.baseRate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='200.00'
                        />
                        {(formik.touched.baseRate && formik.errors.baseRate) || serverErrors.baseRate ? (
                            <p className='text-red-500 text-sm'>{formik.errors.baseRate || serverErrors.baseRate}</p>
                        ) : null}
                    </div>

                    <div className='space-y-2'>
                        <Label>Hourly Rate *</Label>
                        <Input
                            type='number'
                            name='hourlyRate'
                            step='0.01'
                            value={formik.values.hourlyRate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='15.00'
                        />
                        {(formik.touched.hourlyRate && formik.errors.hourlyRate) || serverErrors.hourlyRate ? (
                            <p className='text-red-500 text-sm'>{formik.errors.hourlyRate || serverErrors.hourlyRate}</p>
                        ) : null}
                    </div>

                    <div className='space-y-2'>
                        <Label>Deposit Amount *</Label>
                        <Input
                            type='number'
                            name='depositAmount'
                            step='0.01'
                            value={formik.values.depositAmount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='500.00'
                        />
                        {(formik.touched.depositAmount && formik.errors.depositAmount) || serverErrors.depositAmount ? (
                            <p className='text-red-500 text-sm'>{formik.errors.depositAmount || serverErrors.depositAmount}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* form-level server message (not tied to one field) */}
            {serverErrors._form && <div className='text-red-600 text-sm mt-3'>{serverErrors._form}</div>}

            <div className='flex justify-end gap-4 mt-4'>
                <Button
                    variant='outline'
                    type='button'
                    onClick={() => { console.debug('CarForm cancel clicked'); onCancel?.(); }}
                    disabled={loading || formik.isSubmitting}
                >
                    {t('vehicle.actions.cancel')}
                </Button>
                <Button type='submit' disabled={loading || formik.isSubmitting}>
                    {formik.isSubmitting
                        ? t('vehicle.actions.creating') || 'Creating...'
                        : t('vehicle.actions.create')}
                </Button>
            </div>
        </form>
    );
}
