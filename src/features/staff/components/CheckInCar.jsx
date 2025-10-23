import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useBooking } from '../../booking/hooks/useBooking';
import { Button } from '../../shared/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../shared/components/ui/select';
import { Textarea } from '../../shared/components/ui/textarea';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';
import { formatCurrency } from '../../shared/lib/utils';

export default function CheckInCar() {
    const { t } = useTranslation();
    const { getAllBookings, getBookingById } = useBooking();
    const { user } = useAuth();

    const [bookingId, setBookingId] = useState('');
    const [booking, setBooking] = useState(null);
    const [availableBookings, setAvailableBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const inspectionType = 'CHECK_IN';
    const [exteriorCondition, setExteriorCondition] = useState('GOOD');
    const [interiorCondition, setInteriorCondition] = useState('GOOD');
    const [tireCondition, setTireCondition] = useState('GOOD');
    const [accessories, setAccessories] = useState('ALL_PRESENT');

    const [batteryLevel, setBatteryLevel] = useState('');
    const [mileage, setMileage] = useState('');
    const [damageNotes, setDamageNotes] = useState('');
    const [notes, setNotes] = useState('');
    const [documentVerified, setDocumentVerified] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        batteryLevel: '',
        mileage: '',
        damageNotes: '',
        notes: '',
    });

    const [inspectionFiles, setInspectionFiles] = useState([]);
    const [inspectionPreviews, setInspectionPreviews] = useState([]);

    const [checkInSummaryOpen, setCheckInSummaryOpen] = useState(false);
    const [checkInSummary, setCheckInSummary] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerDocuments, setCustomerDocuments] = useState(null);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    useEffect(() => {
        const fetchEligibleBookings = async () => {
            try {
                setLoadingBookings(true);
                const resData = await getAllBookings({ limit: 100 });
                const list = (resData?.bookings || resData || []).filter(b => {
                    const status = b.status || b.bookingStatus || '';
                    return status === 'CONFIRMED';
                });
                setAvailableBookings(list);
            } catch (err) {
                console.error('Fetch eligible bookings error', err);
            } finally {
                setLoadingBookings(false);
            }
        };
        fetchEligibleBookings();
    }, [getAllBookings]);

    const handleSelectBooking = async value => {
        setBookingId(value);
        try {
            const res = await getBookingById(value);
            const b = res?.booking || res?.data?.booking || null;
            setBooking(b);
            if (b?.vehicle?.mileage) {
                setMileage(String(b.vehicle.mileage));
            }

            // Fetch customer documents
            if (b?.renters?.id || b?.renters) {
                await fetchCustomerDocuments(b.renters?.id || b.renters);
            }
        } catch (e) {
            toast.error(e?.message || 'Failed to load booking');
        }
    };

    // Fetch customer documents by userId (renterId)
    const fetchCustomerDocuments = async (rentersId) => {
        if (!rentersId) return;

        try {
            setLoadingDocuments(true);
            // Staff fetches customer's documents using /all endpoint with renterId query
            const response = await apiClient.get(`/api/documents/all?renterId=${rentersId}`);
            const docs = response?.data?.documents || response?.data || null;
            setCustomerDocuments(docs);
            console.debug('Customer documents:', docs);
        } catch (err) {
            console.warn('Failed to fetch customer documents:', err);
            toast.warning('Could not load customer documents');
            setCustomerDocuments(null);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleBatteryLevelChange = (e) => {
        const value = e.target.value;
        setBatteryLevel(value);
        const num = Number(value);
        if (!value) {
            setValidationErrors(prev => ({ ...prev, batteryLevel: 'Battery level is required' }));
        } else if (isNaN(num) || num < 0 || num > 100) {
            setValidationErrors(prev => ({ ...prev, batteryLevel: 'Battery level must be 0-100%' }));
        } else {
            setValidationErrors(prev => ({ ...prev, batteryLevel: '' }));
        }
    };

    const handleMileageChange = (e) => {
        const value = e.target.value;
        setMileage(value);
        const num = Number(value);
        if (!value) {
            setValidationErrors(prev => ({ ...prev, mileage: 'Odometer reading is required' }));
        } else if (isNaN(num) || num < 0) {
            setValidationErrors(prev => ({ ...prev, mileage: 'Odometer must be a positive number' }));
        } else if (num > 999999) {
            setValidationErrors(prev => ({ ...prev, mileage: 'Odometer reading seems unrealistic' }));
        } else {
            setValidationErrors(prev => ({ ...prev, mileage: '' }));
        }
    };

    const handleDamageNotesChange = (e) => {
        const value = e.target.value;
        setDamageNotes(value);
        if (value.length > 1000) {
            setValidationErrors(prev => ({ ...prev, damageNotes: 'Damage notes must not exceed 1000 characters' }));
        } else {
            setValidationErrors(prev => ({ ...prev, damageNotes: '' }));
        }
    };

    const handleNotesChange = (e) => {
        const value = e.target.value;
        setNotes(value);
        if (value.length > 500) {
            setValidationErrors(prev => ({ ...prev, notes: 'Notes must not exceed 500 characters' }));
        } else {
            setValidationErrors(prev => ({ ...prev, notes: '' }));
        }
    };

    const handleFiles = e => {
        const files = Array.from(e.target.files || []);
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(f => !validTypes.includes(f.type));

        if (invalidFiles.length > 0) {
            toast.error(`Invalid file type. Only JPG, PNG, WebP are allowed.`);
            return;
        }

        const currentCount = inspectionFiles.length;
        const newCount = currentCount + files.length;

        if (newCount > 10) {
            toast.error(`Maximum 10 images allowed. You have ${currentCount}, trying to add ${files.length}`);
            return;
        }

        const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error(`Files exceed 5MB`);
            return;
        }

        setInspectionFiles(prev => [...prev, ...files]);
    };

    useEffect(() => {
        const urls = inspectionFiles
            .filter(f => f && f.type && f.type.startsWith('image/'))
            .map(f => ({ url: URL.createObjectURL(f), name: f.name }));
        setInspectionPreviews(urls);
        return () => {
            urls.forEach(u => {
                try {
                    URL.revokeObjectURL(u.url);
                } catch { }
            });
        };
    }, [inspectionFiles]);

    const uploadInspectionImages = async inspectionId => {
        try {
            const imageFiles = (inspectionFiles || []).filter(
                f => f && f.type && f.type.startsWith('image/')
            );
            if (!inspectionId || !imageFiles.length) return [];

            const MAX_SIZE = 5 * 1024 * 1024;
            const validFiles = imageFiles.filter(f => f.size <= MAX_SIZE);

            const uploadPromises = validFiles.map(async file => {
                const formData = new FormData();
                formData.append('images', file);
                const res = await apiClient.post(
                    endpoints.inspections.uploadImage(inspectionId),
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
                }
            });
            return urls;
        } catch (err) {
            console.warn('Upload inspection images error:', err);
            return [];
        }
    };

    const resetAllFields = () => {
        setBookingId('');
        setBooking(null);
        setExteriorCondition('GOOD');
        setInteriorCondition('GOOD');
        setTireCondition('GOOD');
        setAccessories('ALL_PRESENT');
        setBatteryLevel('');
        setMileage('');
        setDamageNotes('');
        setNotes('');
        setDocumentVerified(false);
        setInspectionFiles([]);
    };

    // Separate submission logic to avoid re-running all validations
    const performCheckInSubmission = async () => {
        const batteryNum = Number(batteryLevel);
        const mileageNum = Number(mileage);
        const id = booking?.id || bookingId;

        const inspectionPayload = {
            vehicleId: booking?.vehicle?.id || booking?.vehicleId,
            staffId: user?.id,
            bookingId: id,
            inspectionType: inspectionType,
            batteryLevel: batteryNum,
            mileage: mileageNum,
            // ✅ FIX: Sử dụng giá trị thực từ state
            exteriorCondition: exteriorCondition,
            interiorCondition: interiorCondition,
            tireCondition: tireCondition,
            accessories: accessories === 'ALL_PRESENT' ? ['ALL_PRESENT'] : ['MISSING_ITEMS'],
            damageNotes: damageNotes || undefined,
            notes: notes || undefined,
            documentVerified: documentVerified,
            isCompleted: true,
            images: [],
        };

        let createdInspection = null;
        let uploadedImageUrls = [];

        try {
            setIsSubmitting(true);

            // Create inspection record first
            try {
                const inspectionRes = await apiClient.post(
                    endpoints.inspections.create(),
                    inspectionPayload
                );
                createdInspection = inspectionRes?.data?.inspection || inspectionRes?.data || null;
                console.debug('inspection create response:', inspectionRes?.data || inspectionRes);
                if (createdInspection && createdInspection.id) {
                    toast.info(`Inspection created (id=${createdInspection.id})`);
                } else {
                    toast.warn('Inspection creation returned no id');
                }
            } catch (insErr) {
                console.warn('Inspection creation failed:', insErr);
                toast.warn('Failed to create inspection record (server may reject). Proceeding to check-in attempt.');
                // continue; we still try to perform check-in to avoid blocking staff flow
            }

            // Upload images if inspection was created and we have files
            if (inspectionFiles.length && createdInspection?.id) {
                try {
                    uploadedImageUrls = await uploadInspectionImages(createdInspection.id);
                    console.debug('uploaded image urls for inspection', createdInspection.id, uploadedImageUrls);
                    if (!uploadedImageUrls.length) {
                        toast.info('No images were uploaded (server may have rejected them)');
                    }
                } catch (uploadErr) {
                    console.warn('uploadInspectionImages failed:', uploadErr);
                    toast.warn('Image upload failed (check network / server).');
                }
            }

            // Proceed with booking check-in
            const checkInPayload = {
                actualStartTime: new Date().toISOString(),
                actualPickupLocation:
                    booking?.station?.address ||
                    booking?.pickupStation?.address ||
                    booking?.station?.name ||
                    booking?.pickupStation?.name ||
                    'Station location',
                pickupOdometer: mileageNum,
                batteryLevel: batteryNum,
            };

            const checkInRes = await apiClient.post(
                endpoints.bookings.checkIn(id),
                checkInPayload
            );

            console.debug('checkIn response:', checkInRes?.data || checkInRes);

            const checkInSummaryData = checkInRes?.data?.checkInSummary || {};
            const vehicleLabel =
                booking?.vehicle?.name ||
                booking?.vehicle?.licensePlate ||
                '';
            const customerName =
                booking?.user?.name ||
                booking?.renter?.name ||
                '';

            setCheckInSummary({
                bookingId: id,
                vehicleLabel,
                customerName,
                mileage: mileageNum,
                batteryLevel: batteryNum,
                actualStartTime: checkInSummaryData.actualStartTime || new Date().toISOString(),
                staffInfo: checkInSummaryData.staffInfo || { name: user?.name || 'Current staff' },
            });
            setCheckInSummaryOpen(true);

            toast.success('Check-in completed successfully');

            // refresh bookings list
            try {
                setLoadingBookings(true);
                const resData = await getAllBookings({ limit: 100 });
                const list = (resData?.bookings || resData || []).filter(b => {
                    const status = b.status || b.bookingStatus || '';
                    return status === 'CONFIRMED';
                });
                setAvailableBookings(list);
            } catch (err) {
                console.error('Refresh bookings error', err);
            } finally {
                setLoadingBookings(false);
            }

            // debug: if inspection was not created, help troubleshooting
            if (!createdInspection || !createdInspection.id) {
                console.warn('Inspection record not present after check-in. Verify server endpoint:', endpoints.inspections.create());
                toast.info('Note: inspection record was not created. Check server logs or network requests.');
            }

            resetAllFields();
        } catch (e) {
            const status = e?.status ?? e?.response?.status;
            const serverMsg = e?.response?.data?.message || e?.message;

            if (status === 400) {
                toast.error(serverMsg || 'Validation failed');
                return;
            }

            if (status === 409) {
                toast.info('Booking already checked in');
                return;
            }

            toast.error(serverMsg || 'Check-in failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteCheckIn = async () => {

        // Basic validations 
        if (!booking) {
            toast.warning('Please select a booking');
            return;
        }

        if (!user?.id) {
            toast.error('Staff information is missing');
            return;
        }

        const batteryNum = Number(batteryLevel);
        const mileageNum = Number(mileage);

        if (!batteryLevel || isNaN(batteryNum) || batteryNum < 0 || batteryNum > 100) {
            toast.error('Invalid battery level (0-100%)');
            return;
        }

        if (!mileage || isNaN(mileageNum) || mileageNum < 0) {
            toast.error('Invalid odometer reading');
            return;
        }

        if (!documentVerified) {
            toast.warning('Please verify customer documents');
            return;
        }

        if (inspectionFiles.length === 0) {
            toast.warning('Please upload at least 1 vehicle image');
            return;
        }

        // Validate damage notes if condition is not GOOD
        if (exteriorCondition !== 'GOOD' || interiorCondition !== 'GOOD' || tireCondition !== 'GOOD') {
            if (!damageNotes || damageNotes.trim().length < 10) {
                toast.error('Please provide detailed damage notes (at least 10 characters) if vehicle condition is not GOOD');
                return;
            }
        }

        // Time cutoff: block check-in if more than 24 hours after scheduled start
        const plannedStartTime = booking?.startTime ? new Date(booking.startTime) : null;
        if (plannedStartTime) {
            const actualStartTime = new Date();
            const maxAllowed = new Date(plannedStartTime.getTime() + 24 * 60 * 60 * 1000);
            if (actualStartTime > maxAllowed) {
                toast.error('Cannot check-in more than 24 hours after scheduled start time');
                return;
            }
        }

        // If not late or dialog confirmed, proceed with submission
        await performCheckInSubmission();
    };

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-xl font-semibold'>Check-In Car (Staff)</h2>
                <p className='text-sm text-muted-foreground'>
                    Inspect vehicle condition and hand over keys to customer
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Booking</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='col-span-2'>
                        <Label className='block mb-2'>Choose Booking (CONFIRMED)</Label>
                        <Select value={bookingId} onValueChange={handleSelectBooking}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select a booking...' />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingBookings && (
                                    <div className='px-2 py-1 text-sm text-muted-foreground'>
                                        Loading bookings...
                                    </div>
                                )}
                                {availableBookings.map(b => (
                                    <SelectItem key={b.id} value={b.id}>
                                        {b.user?.name || b.customer?.name || ''} -{' '}
                                        {b.vehicle?.licensePlate || b.vehicle?.name || ''} (
                                        {new Date(b.startTime).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {booking && (
                        <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 border rounded p-4'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Customer</p>
                                <p className='font-medium'>
                                    {booking.user?.name || booking.renter?.name || ''}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Vehicle</p>
                                <p className='font-medium'>
                                    {booking.vehicle?.name || booking.vehicle?.licensePlate || ''}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Start Time</p>
                                <p className='font-medium'>
                                    {booking.startTime
                                        ? new Date(booking.startTime).toLocaleString()
                                        : ''}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Deposit</p>
                                <p className='font-medium'>
                                    {formatCurrency(
                                        booking?.depositAmount ?? booking?.amount?.deposit ?? 0
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Inspection Checklist</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label className='block mb-2'>Inspection Type</Label>
                        <div className="px-3 py-2 border rounded bg-slate-50 text-slate-800">
                            CHECK_IN
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div>
                            <Label className='block mb-2'>
                                Exterior Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={exteriorCondition} onValueChange={setExteriorCondition}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='GOOD'>Good</SelectItem>
                                    <SelectItem value='FAIR'>Fair</SelectItem>
                                    <SelectItem value='POOR'>Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className='block mb-2'>
                                Interior Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={interiorCondition} onValueChange={setInteriorCondition}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='GOOD'>Good</SelectItem>
                                    <SelectItem value='FAIR'>Fair</SelectItem>
                                    <SelectItem value='POOR'>Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className='block mb-2'>
                                Tire Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={tireCondition} onValueChange={setTireCondition}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='GOOD'>Good</SelectItem>
                                    <SelectItem value='FAIR'>Fair</SelectItem>
                                    <SelectItem value='POOR'>Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label className='block mb-2'>
                            Accessories Status <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={accessories} onValueChange={setAccessories}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ALL_PRESENT'>All Present</SelectItem>
                                <SelectItem value='MISSING_ITEMS'>Missing Items</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label className='block mb-2'>
                                Battery Level (%) <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='number'
                                min='0'
                                max='100'
                                value={batteryLevel}
                                onChange={handleBatteryLevelChange}
                                placeholder='0-100'
                                className={validationErrors.batteryLevel ? 'border-red-500' : ''}
                            />
                            {validationErrors.batteryLevel && (
                                <p className='text-xs text-red-500 mt-1'>{validationErrors.batteryLevel}</p>
                            )}
                        </div>
                        <div>
                            <Label className='block mb-2'>
                                Odometer Reading (km) <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='number'
                                min='0'
                                value={mileage}
                                onChange={handleMileageChange}
                                placeholder='e.g., 12500'
                                className={validationErrors.mileage ? 'border-red-500' : ''}
                            />
                            {validationErrors.mileage && (
                                <p className='text-xs text-red-500 mt-1'>{validationErrors.mileage}</p>
                            )}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label className='block mb-2'>Upload Vehicle Images</Label>
                            <Input
                                type='file'
                                multiple
                                accept='image/*'
                                onChange={handleFiles}
                            />
                            {!!inspectionPreviews.length && (
                                <div className='mt-3 grid grid-cols-2 md:grid-cols-3 gap-2'>
                                    {inspectionPreviews.map((p, idx) => (
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
                            <Label className='block mb-2'>Damage Notes (if any)</Label>
                            <Textarea
                                rows={4}
                                value={damageNotes}
                                onChange={handleDamageNotesChange}
                                placeholder='Describe any existing damages...'
                                className={validationErrors.damageNotes ? 'border-red-500' : ''}
                            />
                            {validationErrors.damageNotes && (
                                <p className='text-xs text-red-500 mt-1'>{validationErrors.damageNotes}</p>
                            )}
                            <p className='text-xs text-muted-foreground mt-1'>
                                {damageNotes.length}/1000 characters
                            </p>
                        </div>
                    </div>

                    <div>
                        <Label className='block mb-2'>Additional Notes</Label>
                        <Textarea
                            rows={3}
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder='Any other notes for this check-in...'
                            className={validationErrors.notes ? 'border-red-500' : ''}
                        />
                        {validationErrors.notes && (
                            <p className='text-xs text-red-500 mt-1'>{validationErrors.notes}</p>
                        )}
                        <p className='text-xs text-muted-foreground mt-1'>
                            {notes.length}/500 characters
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Document Verification</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                    {/* Display customer documents */}
                    {loadingDocuments && (
                        <div className='text-sm text-slate-500'>Loading customer documents...</div>
                    )}

                    {customerDocuments && (
                        <div className='mb-4 p-4 border rounded bg-slate-50'>
                            <h4 className='text-sm font-semibold text-slate-900 mb-3'>Customer Documents</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {/* ID Card Image */}
                                {customerDocuments.identityCard && (
                                    <div className='space-y-2'>
                                        <p className='text-sm font-medium text-slate-700'>ID Card</p>
                                        <div className='relative border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-colors cursor-pointer group'>
                                            <img
                                                src={customerDocuments.identityCard}
                                                alt='Customer ID Card'
                                                className='w-full h-48 object-contain'
                                                onClick={() => window.open(customerDocuments.identityCard, '_blank')}
                                            />
                                            <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center'>
                                                <span className='text-white opacity-0 group-hover:opacity-100 text-sm font-medium'>
                                                    Click to enlarge
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Driving License Image */}
                                {customerDocuments.drivingLicense && (
                                    <div className='space-y-2'>
                                        <p className='text-sm font-medium text-slate-700'>Driving License</p>
                                        <div className='relative border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-colors cursor-pointer group'>
                                            <img
                                                src={customerDocuments.drivingLicense}
                                                alt='Customer Driving License'
                                                className='w-full h-48 object-contain'
                                                onClick={() => window.open(customerDocuments.drivingLicense, '_blank')}
                                            />
                                            <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center'>
                                                <span className='text-white opacity-0 group-hover:opacity-100 text-sm font-medium'>
                                                    Click to enlarge
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* No documents warning */}
                                {(!customerDocuments.identityCard && !customerDocuments.drivingLicense) && (
                                    <div className='col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                                        <p className='text-amber-800 text-sm font-medium'>⚠️ No documents uploaded</p>
                                        <p className='text-amber-600 text-xs mt-1'>Customer has not uploaded verification documents yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className='flex items-center gap-2 text-sm'>
                        <input
                            id='doc_verified'
                            type='checkbox'
                            checked={documentVerified}
                            onChange={e => setDocumentVerified(e.target.checked)}
                        />
                        <Label htmlFor='doc_verified' className='cursor-pointer'>
                            I have verified customer's ID and driving license{' '}
                            <span className='text-red-500'>*</span>
                        </Label>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        Required: Check customer's identity documents before handing over vehicle.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Complete Check-In</CardTitle>
                </CardHeader>
                <CardContent className='flex items-center justify-between gap-3'>
                    <p className='text-sm text-muted-foreground'>
                        Review all information and hand over vehicle to customer.
                    </p>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            onClick={resetAllFields}
                            disabled={isSubmitting}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleCompleteCheckIn}
                            disabled={isSubmitting || !booking}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Check-In'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={checkInSummaryOpen} onOpenChange={setCheckInSummaryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>✅ Check-In Completed</DialogTitle>
                        <DialogDescription>
                            Vehicle has been handed over to customer successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        {checkInSummary?.customerName && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Customer</p>
                                <p className='font-medium'>{checkInSummary.customerName}</p>
                            </div>
                        )}
                        {checkInSummary?.vehicleLabel && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Vehicle</p>
                                <p className='font-medium'>{checkInSummary.vehicleLabel}</p>
                            </div>
                        )}
                        {(checkInSummary?.staffInfo?.name || user?.name) && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Processed by</p>
                                <p className='font-medium'>{checkInSummary?.staffInfo?.name || user?.name}</p>
                            </div>
                        )}
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Starting Mileage</p>
                                <p className='font-medium'>
                                    {checkInSummary?.mileage?.toLocaleString()} km
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Battery Level</p>
                                <p className='font-medium'>{checkInSummary?.batteryLevel}%</p>
                            </div>
                        </div>
                        {checkInSummary?.actualStartTime && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Check-in Time</p>
                                <p className='font-medium'>
                                    {new Date(checkInSummary.actualStartTime).toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div className='pt-2 border-t'>
                            <p className='text-sm text-green-600'>
                                Booking status updated to: <strong>IN_PROGRESS</strong>
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCheckInSummaryOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}