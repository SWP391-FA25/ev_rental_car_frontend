import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useBooking } from '../../booking/hooks/useBooking';
import { useStaffBooking } from '../hooks/useStaffBooking';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Badge } from '../../shared/components/ui/badge';
import { Progress } from '../../shared/components/ui/progress';
import { Separator } from '../../shared/components/ui/separator';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';
import { cn } from '../../shared/lib/utils';
import documentService from '../../shared/services/documentService';
import { CreateContractModal } from './CreateContractModal';
import {
  Search,
  X,
  Check,
  Calendar,
  User,
  Car,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  Eye,
} from 'lucide-react';

// ==========================================
// 📦 SUB-COMPONENTS
// ==========================================

/**
 * ProgressIndicator - Display progress for 4 check-in steps
 */
function ProgressIndicator({ currentStep }) {
  const steps = [
    { id: 1, label: 'Select Booking', icon: Search },
    { id: 2, label: 'Inspect Vehicle', icon: Car },
    { id: 3, label: 'Upload Photos', icon: ImageIcon },
    { id: 4, label: 'Confirm', icon: CheckCircle2 },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className='mb-8'>
      {/* Progress Bar */}
      <div className='relative mb-4'>
        <Progress value={progressPercentage} className='h-2' />
      </div>

      {/* Steps */}
      <div className='grid grid-cols-4 gap-2'>
        {steps.map(step => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className='flex flex-col items-center text-center'
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive &&
                    'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className='w-5 h-5' />
                ) : (
                  <Icon className='w-5 h-5' />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'text-primary',
                  !isActive && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * BookingSelector - Component for selecting booking with search
 */
function BookingSelector({
  bookings,
  selectedBookingId,
  onSelectBooking,
  selectedStation,
  onStationChange,
  stations,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings;
    const query = searchQuery.toLowerCase();
    return bookings.filter(
      booking =>
        booking.id?.toLowerCase().includes(query) ||
        booking.user?.name?.toLowerCase().includes(query) ||
        booking.vehicle?.licensePlate?.toLowerCase().includes(query) ||
        booking.vehicle?.model?.toLowerCase().includes(query)
    );
  }, [bookings, searchQuery]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Search className='w-5 h-5' />
          Select Booking for Check-In
        </CardTitle>
        <CardDescription>
          Search by booking ID, customer name, or license plate
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Station Filter */}
        <div className='space-y-2'>
          <Label>Station</Label>
          <Select value={selectedStation} onValueChange={onStationChange}>
            <SelectTrigger>
              <SelectValue placeholder='Select station' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Stations</SelectItem>
              {stations.map(station => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className='relative'>
          <Search className='absolute w-4 h-4 left-3 top-3 text-muted-foreground' />
          <Input
            placeholder='Search bookings...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>

        {/* Booking List */}
        {loading ? (
          <div className='py-8 text-center text-muted-foreground'>
            Loading...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>
            <AlertCircle className='w-12 h-12 mx-auto mb-2 opacity-50' />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className='space-y-2 overflow-y-auto max-h-96'>
            {filteredBookings.map(booking => (
              <button
                key={booking.id}
                onClick={() => onSelectBooking(booking.id)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  selectedBookingId === booking.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                )}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>{booking.status}</Badge>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <User className='w-4 h-4' />
                      <span>{booking.user?.name || 'N/A'}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Car className='w-4 h-4' />
                      <span>
                        {booking.vehicle?.model || 'N/A'} -{' '}
                        {booking.vehicle?.licensePlate || 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : 'Invalid Date'}
                      </span>
                    </div>
                  </div>
                  {selectedBookingId === booking.id && (
                    <CheckCircle2 className='w-5 h-5 text-primary shrink-0' />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Booking Summary */}
        {selectedBooking && (
          <div className='p-4 mt-4 border rounded-lg bg-primary/5 border-primary/20'>
            <h4 className='flex items-center gap-2 mb-2 text-sm font-semibold'>
              <CheckCircle2 className='w-4 h-4 text-primary' />
              Booking Selected
            </h4>
            <div className='space-y-1 text-sm'>
              <p>
                <span className='text-muted-foreground'>Customer:</span>{' '}
                {selectedBooking.user?.name || 'N/A'}
              </p>
              <p>
                <span className='text-muted-foreground'>Vehicle:</span>{' '}
                {selectedBooking.vehicle?.model || 'N/A'} -{' '}
                {selectedBooking.vehicle?.licensePlate || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * VehicleInspectionForm - Form for evaluating vehicle condition
 */
function VehicleInspectionForm({
  exteriorCondition,
  setExteriorCondition,
  interiorCondition,
  setInteriorCondition,
  tireCondition,
  setTireCondition,
  accessories,
  setAccessories,
  batteryLevel,
  setBatteryLevel,
  mileage,
  setMileage,
  damageNotes,
  setDamageNotes,
  notes,
  setNotes,
  validationErrors,
}) {
  const conditionOptions = [
    { value: 'GOOD', label: 'Good', color: 'bg-green-500' },
    { value: 'FAIR', label: 'Fair', color: 'bg-yellow-500' },
    { value: 'POOR', label: 'Poor', color: 'bg-red-500' },
  ];

  const accessoriesOptions = [
    { value: 'ALL_PRESENT', label: 'All Present' },
    { value: 'MISSING_ITEMS', label: 'Missing Items' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Car className='w-5 h-5' />
          Vehicle Inspection
        </CardTitle>
        <CardDescription>
          Evaluate vehicle condition in detail before handover
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Exterior Condition */}
        <div className='space-y-2'>
          <Label className='text-base font-semibold'>
            Exterior Condition <span className='text-destructive'>*</span>
          </Label>
          <div className='grid grid-cols-3 gap-3'>
            {conditionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setExteriorCondition(option.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-center',
                  exteriorCondition === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mx-auto mb-2',
                    option.color
                  )}
                />
                <span className='text-sm font-medium'>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Interior Condition */}
        <div className='space-y-2'>
          <Label className='text-base font-semibold'>
            Interior Condition <span className='text-destructive'>*</span>
          </Label>
          <div className='grid grid-cols-3 gap-3'>
            {conditionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setInteriorCondition(option.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-center',
                  interiorCondition === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mx-auto mb-2',
                    option.color
                  )}
                />
                <span className='text-sm font-medium'>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tire Condition */}
        <div className='space-y-2'>
          <Label className='text-base font-semibold'>
            Tire Condition <span className='text-destructive'>*</span>
          </Label>
          <div className='grid grid-cols-3 gap-3'>
            {conditionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTireCondition(option.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-center',
                  tireCondition === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full mx-auto mb-2',
                    option.color
                  )}
                />
                <span className='text-sm font-medium'>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Accessories */}
        <div className='space-y-2'>
          <Label className='text-base font-semibold'>
            Accessories & Items <span className='text-destructive'>*</span>
          </Label>
          <div className='grid grid-cols-2 gap-3'>
            {accessoriesOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setAccessories(option.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-center',
                  accessories === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className='text-sm font-medium'>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Battery Level & Mileage */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='batteryLevel'>
              Battery Level (%) <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='batteryLevel'
              type='number'
              min='0'
              max='100'
              value={batteryLevel}
              onChange={e => setBatteryLevel(e.target.value)}
              placeholder='Enter battery level (0-100)'
              className={
                validationErrors.batteryLevel ? 'border-destructive' : ''
              }
            />
            {validationErrors.batteryLevel && (
              <p className='flex items-center gap-1 text-sm text-destructive'>
                <AlertCircle className='w-4 h-4' />
                {validationErrors.batteryLevel}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='mileage'>
              Mileage (km) <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='mileage'
              type='number'
              min='0'
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder='Enter mileage'
              className={validationErrors.mileage ? 'border-destructive' : ''}
            />
            {validationErrors.mileage && (
              <p className='flex items-center gap-1 text-sm text-destructive'>
                <AlertCircle className='w-4 h-4' />
                {validationErrors.mileage}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Damage Notes */}
        <div className='space-y-2'>
          <Label htmlFor='damageNotes'>Damage Notes</Label>
          <Textarea
            id='damageNotes'
            value={damageNotes}
            onChange={e => setDamageNotes(e.target.value)}
            placeholder='Describe any damages in detail (if any)...'
            rows={3}
            className={validationErrors.damageNotes ? 'border-destructive' : ''}
          />
          {validationErrors.damageNotes && (
            <p className='flex items-center gap-1 text-sm text-destructive'>
              <AlertCircle className='w-4 h-4' />
              {validationErrors.damageNotes}
            </p>
          )}
        </div>

        {/* General Notes */}
        <div className='space-y-2'>
          <Label htmlFor='notes'>General Notes</Label>
          <Textarea
            id='notes'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Other notes...'
            rows={3}
            className={validationErrors.notes ? 'border-destructive' : ''}
          />
          {validationErrors.notes && (
            <p className='flex items-center gap-1 text-sm text-destructive'>
              <AlertCircle className='w-4 h-4' />
              {validationErrors.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ImageUpload - Component for image upload with drag & drop
 */
function ImageUpload({ files, previews, onFilesChange, maxFiles = 10 }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = e => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = newFiles => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    const updatedFiles = [...files, ...validFiles];
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    const updatedPreviews = [...previews, ...newPreviews];

    onFilesChange(updatedFiles, updatedPreviews);
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = index => {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    onFilesChange(updatedFiles, updatedPreviews);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ImageIcon className='w-5 h-5' />
          Upload Inspection Photos
        </CardTitle>
        <CardDescription>
          Upload up to {maxFiles} images (max 5MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-accent'
          )}
        >
          <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
          <p className='mb-1 text-sm font-medium'>
            Drag and drop images here or click to select
          </p>
          <p className='text-xs text-muted-foreground'>
            Supports: JPG, PNG, GIF (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
          />
        </div>

        {/* Preview Grid */}
        {previews.length > 0 && (
          <div>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm font-medium'>
                {previews.length}/{maxFiles} images
              </span>
              {previews.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onFilesChange([], [])}
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Remove All
                </Button>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              {previews.map((preview, index) => (
                <div key={index} className='relative group'>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className='object-cover w-full h-32 border rounded-lg'
                  />
                  <div className='absolute inset-0 flex items-center justify-center gap-2 transition-opacity rounded-lg opacity-0 bg-black/50 group-hover:opacity-100'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        window.open(preview, '_blank');
                      }}
                      className='text-white hover:text-white hover:bg-white/20'
                    >
                      <Eye className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className='text-white hover:text-white hover:bg-white/20'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * DocumentVerification - Xác nhận tài liệu với smart validation
 */
function DocumentVerification({
  documentVerified,
  setDocumentVerified,
  customerDocuments,
  onUploadDocument,
  onViewDocument,
  loadingDocuments,
}) {
  const [uploadingDoc] = useState(null);

  const documentTypes = [
    { type: 'ID_CARD', label: 'ID Card', icon: FileText, required: true },
    {
      type: 'DRIVERS_LICENSE', // Server dùng DRIVERS_LICENSE (có S)
      label: "Driver's License",
      icon: FileText,
      required: true,
    },
  ];

  // Check completion status - Server trả về documentType, không phải document_type
  const hasIdCard = customerDocuments?.some(d => d.documentType === 'ID_CARD');
  const hasLicense = customerDocuments?.some(
    d => d.documentType === 'DRIVERS_LICENSE'
  );
  const allDocumentsPresent = hasIdCard && hasLicense;
  const missingDocs = documentTypes.filter(
    dt => !customerDocuments?.some(d => d.documentType === dt.type)
  );

  // Debug logging
  console.log('📄 Document Verification Render:', {
    loadingDocuments,
    customerDocuments,
    documentCount: customerDocuments?.length,
    hasIdCard,
    hasLicense,
    allDocumentsPresent,
    missingDocs: missingDocs.map(d => d.label),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='w-5 h-5' />
          Document Verification
        </CardTitle>
        <CardDescription>Verify and confirm customer documents</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Loading State */}
        {loadingDocuments && (
          <div className='p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'>
            <div className='flex items-start gap-3'>
              <div className='w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                  Loading Documents...
                </p>
                <p className='mt-1 text-xs text-blue-700 dark:text-blue-200'>
                  Fetching customer documents from server
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert for missing documents */}
        {!loadingDocuments && !allDocumentsPresent && (
          <div className='p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
                  Incomplete Documents
                </p>
                <p className='mt-1 text-xs text-amber-700 dark:text-amber-200'>
                  Customer has not uploaded{' '}
                  {missingDocs.map(d => d.label).join(', ')}. You can upload on
                  behalf of the customer below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document List */}
        <div className='space-y-3'>
          {documentTypes.map(
            // eslint-disable-next-line no-unused-vars
            ({ type, label, icon: IconComponent, required }) => {
              const doc = customerDocuments?.find(d => d.documentType === type);

              return (
                <div
                  key={type}
                  className={cn(
                    'p-4 border-2 rounded-lg transition-all',
                    doc
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center flex-1 gap-3'>
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                          doc
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {doc ? (
                          <CheckCircle2 className='w-5 h-5' />
                        ) : (
                          <IconComponent className='w-5 h-5' />
                        )}
                      </div>

                      {/* Document Image Preview */}
                      {doc?.fileUrl && (
                        <div className='w-20 h-20 overflow-hidden transition-transform border-2 rounded-lg border-border shrink-0 hover:scale-105'>
                          <img
                            src={doc.thumbnailUrl || doc.fileUrl}
                            alt={label}
                            className='object-cover w-full h-full cursor-pointer'
                            onClick={() => onViewDocument(doc)}
                          />
                        </div>
                      )}

                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>{label}</p>
                          {required && !doc && (
                            <span className='text-xs text-destructive'>*</span>
                          )}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {doc ? (
                            <>
                              Uploaded •{' '}
                              {new Date(doc.uploadedAt).toLocaleDateString(
                                'en-US'
                              )}
                            </>
                          ) : (
                            'Not Available'
                          )}
                        </p>
                        {/* Server auto-approve nếu staff upload */}
                        {doc?.status === 'APPROVED' && (
                          <p className='text-xs text-green-600 dark:text-green-500 mt-0.5'>
                            ✓ Verified by staff
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {doc ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onViewDocument(doc)}
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          Detail
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onUploadDocument(type)}
                          disabled={uploadingDoc === type}
                        >
                          {uploadingDoc === type ? (
                            <>
                              <div className='w-4 h-4 mr-2 border-2 border-current rounded-full border-t-transparent animate-spin' />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className='w-4 h-4 mr-2' />
                              Upload
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <Separator />

        {/* Document Status Summary */}
        <div
          className={cn(
            'p-4 rounded-lg border-2',
            allDocumentsPresent
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-muted border-border'
          )}
        >
          <div className='flex items-center gap-3'>
            {allDocumentsPresent ? (
              <>
                <CheckCircle2 className='w-5 h-5 text-green-600 dark:text-green-500 shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    Documents Complete
                  </p>
                  <p className='text-xs text-green-700 dark:text-green-300 mt-0.5'>
                    All required documents have been uploaded
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className='w-5 h-5 text-muted-foreground shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-semibold'>
                    Missing {missingDocs.length} document(s)
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Need to upload: {missingDocs.map(d => d.label).join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Verification Checkbox - Only enabled when all docs present */}
        <div className='space-y-4'>
          <div
            className={cn(
              'p-4 rounded-lg border-2 transition-all',
              allDocumentsPresent
                ? documentVerified
                  ? 'bg-primary/10 border-primary'
                  : 'bg-primary/5 border-primary/20 hover:border-primary/50'
                : 'bg-muted/50 border-muted cursor-not-allowed'
            )}
          >
            <div className='flex items-start gap-3'>
              <input
                type='checkbox'
                id='documentVerified'
                checked={documentVerified}
                onChange={e => setDocumentVerified(e.target.checked)}
                disabled={!allDocumentsPresent}
                className={cn(
                  'mt-1 cursor-pointer',
                  !allDocumentsPresent && 'cursor-not-allowed opacity-50'
                )}
              />
              <label
                htmlFor='documentVerified'
                className={cn(
                  'flex-1',
                  allDocumentsPresent ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
              >
                <span className='font-medium'>
                  I confirm that I have verified the customer's documents
                </span>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Documents include valid ID card and driver's license, are
                  clear, match registration information, and meet rental
                  requirements
                </p>
              </label>
            </div>
          </div>

          {/* Validation Messages */}
          {!allDocumentsPresent && (
            <div className='flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500'>
              <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
              <span>
                Please upload all required documents before confirming
              </span>
            </div>
          )}

          {allDocumentsPresent && !documentVerified && (
            <div className='flex items-start gap-2 text-sm text-destructive'>
              <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
              <span>
                Please confirm document verification before continuing
              </span>
            </div>
          )}

          {documentVerified && (
            <div className='flex items-start gap-2 text-sm text-green-600 dark:text-green-500'>
              <CheckCircle2 className='w-4 h-4 shrink-0 mt-0.5' />
              <span>Documents have been verified by you</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ValidationSummary - Display validation errors
 */
function ValidationSummary({ errors }) {
  const errorList = Object.entries(errors).filter(([, value]) => value);

  if (errorList.length === 0) return null;

  return (
    <Card className='border-destructive bg-destructive/5'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-destructive'>
          <AlertCircle className='w-5 h-5' />
          Please complete the following information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {errorList.map(([field, error]) => (
            <li key={field} className='flex items-start gap-2 text-sm'>
              <X className='w-4 h-4 text-destructive shrink-0 mt-0.5' />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 📱 MAIN COMPONENT
// ==========================================

export default function CheckInCar() {
  const { getBookingById } = useBooking();
  const { stations } = useStaffBooking();
  const { user } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Booking states
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedStation, setSelectedStation] = useState('all');

  // Staff assignment states
  const [assignedStationIds, setAssignedStationIds] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Inspection states
  const [exteriorCondition, setExteriorCondition] = useState('GOOD');
  const [interiorCondition, setInteriorCondition] = useState('GOOD');
  const [tireCondition, setTireCondition] = useState('GOOD');
  const [accessories, setAccessories] = useState('ALL_PRESENT');
  const [batteryLevel, setBatteryLevel] = useState('');
  const [mileage, setMileage] = useState('');
  const [damageNotes, setDamageNotes] = useState('');
  const [notes, setNotes] = useState('');

  // Image states
  const [inspectionFiles, setInspectionFiles] = useState([]);
  const [inspectionPreviews, setInspectionPreviews] = useState([]);

  // Document states
  const [documentVerified, setDocumentVerified] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('');
  const [uploadDocFile, setUploadDocFile] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});

  // Modal states
  const [checkInSummaryOpen, setCheckInSummaryOpen] = useState(false);
  const [checkInSummary, setCheckInSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createContractOpen, setCreateContractOpen] = useState(false);

  // Contract states
  const [existingContract, setExistingContract] = useState(null);

  // ==========================================
  // 🔄 EFFECTS & DERIVED STATE
  // ==========================================

  // Load staff assignments to get assigned stations
  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      try {
        setLoadingAssignments(true);
        const res = await apiClient.get(
          endpoints.assignments.getByStaffId(user.id)
        );
        // apiClient interceptor already unwraps response.data
        // So res is already the payload: { success, data: { assignments } }
        const payload = res;

        console.log('📋 Staff Assignments Response:', {
          userId: user.id,
          payload,
          hasAssignments: !!payload?.assignments,
          assignmentsLength: payload?.assignments?.length,
        });

        // Support both list and single assignment response shapes
        let raw = [];
        if (Array.isArray(payload?.assignments)) {
          raw = payload.assignments;
        } else if (
          payload?.assignment &&
          typeof payload.assignment === 'object'
        ) {
          raw = [payload.assignment];
        } else if (Array.isArray(payload?.data?.assignments)) {
          raw = payload.data.assignments;
        } else if (Array.isArray(payload)) {
          raw = payload;
        } else if (Array.isArray(payload?.items)) {
          raw = payload.items;
        }

        console.log('📋 Parsed Assignments:', raw);

        const ids = raw
          .map(a => a?.station?.id ?? a?.stationId)
          .filter(Boolean)
          .map(id => String(id));
        const uniqueIds = Array.from(new Set(ids));

        console.log('🏢 Assigned Station IDs:', uniqueIds);

        setAssignedStationIds(uniqueIds);

        if (!uniqueIds.length) {
          toast.error(
            'You have not been assigned to any station. Please contact admin.'
          );
        }
      } catch (err) {
        console.error('Failed to load staff assignments:', err);
        toast.error('Failed to load station assignments');
      } finally {
        setLoadingAssignments(false);
      }
    };
    loadAssignments();
  }, [user?.id]);

  // Filter stations to only show assigned ones
  const allowedStations = useMemo(() => {
    const base = Array.isArray(stations) ? stations : [];
    if (!assignedStationIds?.length) return [];
    return base.filter(s => assignedStationIds.includes(String(s.id)));
  }, [stations, assignedStationIds]);

  // Fetch bookings on mount and when station selection changes
  useEffect(() => {
    if (assignedStationIds.length > 0) {
      fetchAvailableBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStation, assignedStationIds]);

  // Fetch customer documents when booking changes
  useEffect(() => {
    if (bookingId) {
      setLoadingDocuments(true);
      fetchCustomerDocuments(bookingId);
    } else {
      // Reset when no booking selected
      setCustomerDocuments([]);
      setLoadingDocuments(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // ==========================================
  // 📡 API FUNCTIONS
  // ==========================================

  const fetchAvailableBookings = async () => {
    try {
      setLoadingBookings(true);

      // Build query parameters for API
      const params = {
        status: 'CONFIRMED', // Only fetch CONFIRMED bookings
      };

      // Filter by selected station or all assigned stations
      if (selectedStation && selectedStation !== 'all') {
        // Single station selected
        params.stationId = selectedStation;
      } else {
        // All stations - use stationIds with comma-separated assigned station IDs
        if (assignedStationIds.length > 0) {
          params.stationIds = assignedStationIds.join(',');
        }
      }

      // Fetch bookings with query parameters
      const response = await apiClient.get(endpoints.bookings.getAll(), {
        params,
      });

      const bookings = response.data?.bookings || [];
      setAvailableBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking list');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchCustomerDocuments = async bookingId => {
    try {
      // Get booking to get userId
      const bookingData =
        booking || (await getBookingById(bookingId).catch(() => null));

      // Get userId from booking (primary field in DB)
      const userId =
        bookingData?.userId || bookingData?.renter_id || bookingData?.user?.id;

      if (!userId) {
        console.warn('No userId found in booking:', bookingData);
        setCustomerDocuments([]);
        return;
      }

      console.log('📄 Fetching documents for userId:', userId);

      // Server API: GET /api/documents/user/:userId
      const response = await apiClient.get(
        endpoints.documents.getByUserId(userId)
      );

      console.log('📄 Documents response:', response);

      // Server response unwrapped by interceptor: { success: true, data: { documents: [...], pagination: {...} } }
      const docs = response.data?.documents || response.documents || [];
      setCustomerDocuments(docs);

      console.log('📄 Customer documents set:', docs.length, 'documents');
    } catch (error) {
      console.error('Error fetching documents:', error);
      setCustomerDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleSelectBooking = async selectedBookingId => {
    try {
      setBookingId(selectedBookingId);
      const bookingData = await getBookingById(selectedBookingId);

      // Handle nested booking structure
      const booking = bookingData?.booking || bookingData;

      // Validate booking station is in assigned stations
      const bookingStationId = String(
        booking?.stationId || booking?.station_id || ''
      );
      console.log('🔍 Booking Validation:', {
        bookingStationId,
        assignedStationIds,
        isIncluded: assignedStationIds.includes(bookingStationId),
        bookingData,
        booking,
      });

      if (!bookingStationId || !assignedStationIds.includes(bookingStationId)) {
        toast.error('This booking does not belong to your assigned station');
        setBookingId('');
        setBooking(null);
        return;
      }

      setBooking(booking);

      // Check if booking has contract - if not, prompt to create
      await checkContractForBooking(selectedBookingId, booking);

      toast.success('Booking selected successfully');
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking information');
    }
  };

  // Check if booking has contract and prompt to create if needed
  const checkContractForBooking = async bookingId => {
    try {
      const response = await apiClient.get(
        endpoints.contracts.getByBooking(bookingId)
      );

      console.log('🔍 Contract Check Response:', {
        bookingId,
        response,
        isArray: Array.isArray(response),
      });

      // Axios interceptor returns {success: true, data: [...]}
      // Extract the contracts array from response.data
      const contracts = Array.isArray(response?.data) ? response.data : [];

      console.log('� Contracts found:', contracts.length);

      // Check if any COMPLETED contract exists for this booking
      // Only contracts with status 'COMPLETED' (created + uploaded) are valid
      const completedContract = contracts.find(c => c.status === 'COMPLETED');

      if (completedContract) {
        // Valid contract exists (created AND uploaded)
        console.log('✅ Valid contract exists:', {
          id: completedContract.id,
          status: completedContract.status,
          contractNumber: completedContract.contractNumber,
        });

        setExistingContract(completedContract);
        toast.success('Contract already exists and is ready');
        // Contract exists and is complete - don't open modal
        return true;
      } else {
        // No valid contract - may have CREATED status but not uploaded yet
        // Treat as if no contract exists and require upload
        const createdContract = contracts.find(c => c.status === 'CREATED');

        if (createdContract) {
          console.log(
            '⚠️ Contract created but not uploaded:',
            createdContract.id
          );
          // Pass the created contract so modal can upload to it
          setExistingContract(createdContract);
        } else {
          console.log('❌ No contract found');
          setExistingContract(null);
        }

        toast.warning(
          'This booking requires a signed contract. Please upload it to proceed with check-in.'
        );
        setCreateContractOpen(true);
        return false;
      }
    } catch (error) {
      // 404 means no contract exists
      if (error?.status === 404 || error?.response?.status === 404) {
        setExistingContract(null);
        toast.warning(
          'This booking does not have a contract. Please create one before check-in.'
        );
        setCreateContractOpen(true);
        return false;
      } else {
        console.error('Error checking contract:', error);
        toast.error('Failed to check contract status');
        return false;
      }
    }
  };

  const validateStep = step => {
    const errors = {};

    switch (step) {
      case 1:
        if (!bookingId) {
          errors.booking = 'Please select a booking';
        }
        // Check if contract exists before allowing to proceed
        if (bookingId && !existingContract) {
          errors.contract =
            'Contract is required. Please create a contract for this booking first.';
        }
        break;

      case 2:
        if (!batteryLevel || batteryLevel < 0 || batteryLevel > 100) {
          errors.batteryLevel = 'Battery level must be 0-100%';
        }
        if (!mileage || mileage < 0) {
          errors.mileage = 'Mileage must be greater than 0';
        }
        break;

      case 3:
        if (inspectionFiles.length === 0) {
          errors.images = 'Please upload at least 1 vehicle photo';
        }
        break;

      case 4:
        if (!documentVerified) {
          errors.documentVerified = 'Please confirm document verification';
        }
        // Check if all required documents are present
        {
          const hasIdCard = customerDocuments?.some(
            d => d.documentType === 'ID_CARD'
          );
          const hasLicense = customerDocuments?.some(
            d => d.documentType === 'DRIVERS_LICENSE'
          );

          console.log('📄 Document validation:', {
            customerDocuments,
            hasIdCard,
            hasLicense,
          });

          if (!hasIdCard || !hasLicense) {
            errors.documents = "Please upload ID card and driver's license";
          }
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==========================================
  // 🎯 STEP NAVIGATION
  // ==========================================

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please complete all information before continuing');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 📤 SUBMIT
  // ==========================================

  const handleSubmitCheckIn = async () => {
    // Validate all steps
    const allValid = [1, 2, 3, 4].every(step => validateStep(step));
    if (!allValid) {
      toast.error('Please complete all information');
      return;
    }

    setIsSubmitting(true);

    try {
      // STEP 1: Check-in booking first (change status CONFIRMED → IN_PROGRESS)
      const checkInData = {
        actualStartTime: new Date().toISOString(),
        actualPickupLocation: booking?.station?.name || booking?.pickupLocation,
        pickupOdometer: parseInt(mileage),
        batteryLevel: parseInt(batteryLevel),
      };

      console.log('📝 Step 1: Check-in booking:', { bookingId, checkInData });

      const checkInResponse = await apiClient.post(
        endpoints.bookings.checkIn(bookingId),
        checkInData
      );

      console.log('✅ Check-in successful:', checkInResponse);

      // STEP 2: Create inspection record (now that booking is IN_PROGRESS)
      const inspectionData = {
        vehicleId:
          booking?.vehicleId || booking?.vehicle_id || booking?.vehicle?.id,
        staffId: user?.id || user?.user_id,
        bookingId: bookingId,
        inspectionType: 'CHECK_IN',
        batteryLevel: parseInt(batteryLevel),
        exteriorCondition: exteriorCondition,
        interiorCondition: interiorCondition,
        mileage: parseInt(mileage),
        tireCondition: tireCondition,
        accessories: accessories,
        damageNotes: damageNotes || null,
        notes: notes || null,
        documentVerified: documentVerified,
      };

      console.log('📝 Step 2: Creating Inspection:', inspectionData);

      const inspectionResponse = await apiClient.post(
        endpoints.inspections.create(),
        inspectionData
      );

      console.log('✅ Inspection Response:', inspectionResponse);

      const inspection =
        inspectionResponse?.data?.inspection ||
        inspectionResponse?.data ||
        inspectionResponse?.inspection;
      const inspectionId = inspection?.id;

      if (!inspectionId) {
        console.error('❌ No inspection ID received:', inspectionResponse);
        throw new Error('Failed to create inspection - no ID returned');
      }

      console.log('✅ Inspection Created:', { inspection, inspectionId });

      // Upload images one by one to the created inspection
      if (inspectionFiles.length > 0 && inspectionId) {
        console.log(`📸 Uploading ${inspectionFiles.length} images...`);

        for (let i = 0; i < inspectionFiles.length; i++) {
          const file = inspectionFiles[i];
          const formData = new FormData();
          formData.append('image', file);

          try {
            await apiClient.post(
              `/api/inspections/${inspectionId}/upload-image`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            );
            console.log(`✅ Image ${i + 1}/${inspectionFiles.length} uploaded`);
          } catch (imgError) {
            console.error(`Failed to upload image ${i + 1}:`, imgError);
            // Continue uploading other images even if one fails
          }
        }
      }

      // Prepare summary data with all relevant information
      const summaryData = {
        inspectionId: inspectionId,
        checkInTime:
          checkInResponse?.data?.checkInSummary?.actualStartTime ||
          new Date().toISOString(),
        customer: booking?.user?.name || booking?.renter?.name,
        vehicleModel: booking?.vehicle?.model,
        licensePlate: booking?.vehicle?.licensePlate,
        batteryLevel: parseInt(batteryLevel),
        mileage: parseInt(mileage),
      };

      console.log('📊 Check-in Summary:', summaryData);

      setCheckInSummary(summaryData);
      setCheckInSummaryOpen(true);
      toast.success('Check-in successful!');

      // Refresh bookings data
      await fetchAvailableBookings();

      // Reset form
      resetForm();
    } catch (error) {
      console.error('❌ Check-in error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred during check-in';

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
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
    setInspectionFiles([]);
    setInspectionPreviews([]);
    setDocumentVerified(false);
    setValidationErrors({});
  };

  // ==========================================
  // 📄 DOCUMENT UPLOAD
  // ==========================================

  const handleUploadDocument = docType => {
    setUploadDocType(docType);
    setUploadDocFile(null);
    setUploadDialogOpen(true);
  };

  const handleViewDocument = doc => {
    setSelectedDocument(doc);
    setViewDocumentOpen(true);
  };

  const submitDocumentUpload = async () => {
    if (!uploadDocFile) {
      toast.error('Please select a file');
      return;
    }

    // Get renterId from booking.userId (primary field in DB)
    const renterId = booking?.userId || booking?.user?.id;

    if (!renterId) {
      toast.error('Customer information not found');
      console.error('Booking data:', booking);
      return;
    }

    setUploadingDocument(true);

    try {
      // Prepare FormData exactly like DocumentUpload component
      const formData = new FormData();
      formData.append('document', uploadDocFile);
      formData.append('documentType', uploadDocType);
      formData.append('renterId', renterId); // Staff uploads for customer

      console.log('📤 Uploading document:', {
        fileName: uploadDocFile.name,
        fileSize: uploadDocFile.size,
        fileType: uploadDocFile.type,
        documentType: uploadDocType,
        renterId: renterId,
      });

      // Use documentService like DocumentUpload component does
      const response = await documentService.uploadDocument(formData);

      console.log('✅ Upload response:', response);

      if (response.success) {
        toast.success(
          response.message || 'Document uploaded successfully and auto-verified'
        );

        setUploadDialogOpen(false);
        setUploadDocFile(null);
        setUploadDocType('');

        // Refresh documents list and wait for it to complete
        setLoadingDocuments(true);
        await fetchCustomerDocuments(bookingId);

        // After refresh, check if all documents are present
        // Note: We need to fetch fresh data, not use stale customerDocuments
        // The component will re-render with new data automatically
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Document upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error data:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Unable to upload document';

      toast.error(errorMessage);
    } finally {
      setUploadingDocument(false);
    }
  };

  // ==========================================
  // 🎨 RENDER
  // ==========================================

  return (
    <div className='container max-w-5xl px-4 py-8 mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>Vehicle Check-In</h1>
        <p className='text-muted-foreground'>
          Inspect and deliver vehicle to customer
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} />

      {/* Step Content */}
      <div className='space-y-6'>
        {/* Step 1: Booking Selection */}
        {currentStep === 1 && (
          <>
            <BookingSelector
              bookings={availableBookings}
              selectedBookingId={bookingId}
              onSelectBooking={handleSelectBooking}
              selectedStation={selectedStation}
              onStationChange={setSelectedStation}
              stations={allowedStations}
              loading={loadingBookings || loadingAssignments}
            />
            <ValidationSummary errors={validationErrors} />
          </>
        )}

        {/* Step 2: Vehicle Inspection */}
        {currentStep === 2 && (
          <>
            <VehicleInspectionForm
              exteriorCondition={exteriorCondition}
              setExteriorCondition={setExteriorCondition}
              interiorCondition={interiorCondition}
              setInteriorCondition={setInteriorCondition}
              tireCondition={tireCondition}
              setTireCondition={setTireCondition}
              accessories={accessories}
              setAccessories={setAccessories}
              batteryLevel={batteryLevel}
              setBatteryLevel={setBatteryLevel}
              mileage={mileage}
              setMileage={setMileage}
              damageNotes={damageNotes}
              setDamageNotes={setDamageNotes}
              notes={notes}
              setNotes={setNotes}
              validationErrors={validationErrors}
            />
            <ValidationSummary errors={validationErrors} />
          </>
        )}

        {/* Step 3: Image Upload */}
        {currentStep === 3 && (
          <>
            <ImageUpload
              files={inspectionFiles}
              previews={inspectionPreviews}
              onFilesChange={(files, previews) => {
                setInspectionFiles(files);
                setInspectionPreviews(previews);
              }}
              maxFiles={10}
            />
            <ValidationSummary errors={validationErrors} />
          </>
        )}

        {/* Step 4: Document Verification */}
        {currentStep === 4 && (
          <>
            <DocumentVerification
              documentVerified={documentVerified}
              setDocumentVerified={setDocumentVerified}
              customerDocuments={customerDocuments}
              onUploadDocument={handleUploadDocument}
              onViewDocument={handleViewDocument}
              loadingDocuments={loadingDocuments}
              bookingId={bookingId}
            />
            <ValidationSummary errors={validationErrors} />

            {/* Final Summary */}
            {booking && (
              <Card className='border-primary/20 bg-primary/5'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-primary' />
                    Check-In Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                    <div>
                      <span className='text-muted-foreground'>Booking:</span>
                      <p className='font-medium'>{booking.booking_id}</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Customer:</span>
                      <p className='font-medium'>{booking.renter?.full_name}</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Vehicle:</span>
                      <p className='font-medium'>
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        License Plate:
                      </span>
                      <p className='font-medium'>
                        {booking.vehicle?.license_plate}
                      </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Battery Level:
                      </span>
                      <p className='font-medium'>{batteryLevel}%</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Mileage:</span>
                      <p className='font-medium'>{mileage} km</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Photos:</span>
                      <p className='font-medium'>{inspectionFiles.length}</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Documents:</span>
                      <p className='font-medium'>
                        {documentVerified ? (
                          <Badge
                            variant='outline'
                            className='text-green-700 bg-green-50'
                          >
                            Confirmed
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='text-red-700 bg-red-50'
                          >
                            Not Confirmed
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className='flex items-center justify-between mt-8'>
        <Button
          variant='outline'
          onClick={handleBack}
          disabled={currentStep === 1}
          className='min-w-32'
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} className='min-w-32'>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmitCheckIn}
            disabled={isSubmitting}
            className='min-w-32'
          >
            {isSubmitting ? 'Processing...' : 'Complete Check-In'}
          </Button>
        )}
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5' />
              Upload Document for Customer
            </DialogTitle>
            <DialogDescription>
              Upload{' '}
              {uploadDocType === 'ID_CARD' ? 'ID Card' : "Driver's License"} for
              customer {booking?.renter?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {/* Info Alert */}
            <div className='p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
                <div className='text-xs text-blue-900 dark:text-blue-100'>
                  <p className='mb-1 font-semibold'>Important Notes:</p>
                  <ul className='list-disc list-inside space-y-0.5'>
                    <li>Ensure document is original or clear copy</li>
                    <li>
                      Information on document must match booking information
                    </li>
                    <li>Document will be auto-verified after upload</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* File Upload với Drag & Drop */}
            <div className='space-y-2'>
              <Label>
                Select document file <span className='text-destructive'>*</span>
              </Label>
              {uploadDocFile ? (
                <div className='flex items-center justify-between p-3 border-2 rounded-lg bg-primary/10 border-primary/30'>
                  <div className='flex items-center gap-3'>
                    <FileText className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-sm font-medium'>
                        {uploadDocFile.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {(uploadDocFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setUploadDocFile(null)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      'border-primary',
                      'bg-primary/10'
                    );
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      'border-primary',
                      'bg-primary/10'
                    );
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      'border-primary',
                      'bg-primary/10'
                    );
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      // Validate theo server: JPEG, PNG, JPG, PDF, max 10MB
                      const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/jpg',
                        'application/pdf',
                      ];
                      const maxSize = 10 * 1024 * 1024; // 10MB

                      if (!allowedTypes.includes(file.type)) {
                        toast.error(
                          'Invalid file type. Only JPEG, PNG, JPG and PDF accepted'
                        );
                        return;
                      }
                      if (file.size > maxSize) {
                        toast.error('File size too large. Maximum 10MB');
                        return;
                      }
                      setUploadDocFile(file);
                    }
                  }}
                  onClick={() =>
                    document.getElementById('doc-upload-input')?.click()
                  }
                  className='p-8 text-center transition-all border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5'
                >
                  <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                  <p className='mb-1 text-sm font-medium'>
                    Drag and drop file here or click to select
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Supports: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
              )}
              <input
                id='doc-upload-input'
                type='file'
                accept='image/jpeg,image/png,image/jpg,application/pdf'
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    // Validate theo server
                    const allowedTypes = [
                      'image/jpeg',
                      'image/png',
                      'image/jpg',
                      'application/pdf',
                    ];
                    const maxSize = 10 * 1024 * 1024;

                    if (!allowedTypes.includes(file.type)) {
                      toast.error(
                        'Invalid file type. Only JPEG, PNG, JPG and PDF accepted'
                      );
                      return;
                    }
                    if (file.size > maxSize) {
                      toast.error('File size too large. Maximum 10MB');
                      return;
                    }
                    setUploadDocFile(file);
                  }
                }}
                className='hidden'
              />
            </div>

            {/* Document Preview */}
            {uploadDocFile && uploadDocFile.type.startsWith('image/') && (
              <div className='space-y-2'>
                <Label>Preview</Label>
                <img
                  src={URL.createObjectURL(uploadDocFile)}
                  alt='Preview'
                  className='w-full border rounded-lg'
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploadingDocument}
            >
              Cancel
            </Button>
            <Button onClick={submitDocumentUpload} disabled={uploadingDocument}>
              {uploadingDocument ? (
                <>
                  <div className='w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4 mr-2' />
                  Upload & Verify
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='w-5 h-5' />
              View Document
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.documentType === 'ID_CARD'
                ? 'ID Card'
                : selectedDocument?.documentType === 'DRIVERS_LICENSE'
                ? "Driver's License"
                : 'Passport'}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-4'>
              {/* Document Info */}
              <div className='grid grid-cols-2 gap-4 p-4 text-sm rounded-lg bg-muted/50'>
                <div>
                  <span className='text-muted-foreground'>Type:</span>
                  <p className='font-medium'>
                    {selectedDocument.documentType === 'ID_CARD'
                      ? 'ID Card'
                      : selectedDocument.documentType === 'DRIVERS_LICENSE'
                      ? "Driver's License"
                      : 'Passport'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Upload Date:</span>
                  <p className='font-medium'>
                    {new Date(selectedDocument.uploadedAt).toLocaleString(
                      'en-US'
                    )}
                  </p>
                </div>
                {selectedDocument.status === 'APPROVED' && (
                  <>
                    <div>
                      <span className='text-muted-foreground'>Status:</span>
                      <p className='font-medium text-green-600'>Verified</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Verification Date:
                      </span>
                      <p className='font-medium'>
                        {selectedDocument.verifiedAt
                          ? new Date(
                              selectedDocument.verifiedAt
                            ).toLocaleString('en-US')
                          : '-'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Document Image/PDF - Server trả về fileUrl và thumbnailUrl */}
              <div className='max-h-[60vh] overflow-auto border rounded-lg'>
                {selectedDocument.mimeType === 'application/pdf' ? (
                  <iframe
                    src={selectedDocument.fileUrl}
                    className='w-full h-[60vh]'
                    title='Document'
                  />
                ) : (
                  <img
                    src={selectedDocument.fileUrl}
                    alt='Document'
                    className='w-full'
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setViewDocumentOpen(false)}
            >
              Close
            </Button>
            {selectedDocument?.document_url && (
              <Button
                onClick={() =>
                  window.open(selectedDocument.document_url, '_blank')
                }
              >
                <Eye className='w-4 h-4 mr-2' />
                Open in New Tab
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-In Summary Dialog */}
      <Dialog open={checkInSummaryOpen} onOpenChange={setCheckInSummaryOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CheckCircle2 className='w-6 h-6 text-green-600' />
              Check-In Successful!
            </DialogTitle>
            <DialogDescription>
              Vehicle has been delivered to customer
            </DialogDescription>
          </DialogHeader>
          {checkInSummary && (
            <div className='space-y-4'>
              {checkInSummary.inspectionId && (
                <div className='p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20'>
                  <p className='text-sm text-green-800 dark:text-green-200'>
                    Inspection ID:{' '}
                    <span className='font-mono font-bold'>
                      {checkInSummary.inspectionId}
                    </span>
                  </p>
                </div>
              )}
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Time:</span>
                  <p className='font-medium'>
                    {checkInSummary.checkInTime
                      ? new Date(checkInSummary.checkInTime).toLocaleString(
                          'en-US'
                        )
                      : new Date().toLocaleString('en-US')}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Customer:</span>
                  <p className='font-medium'>
                    {checkInSummary.customer || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Vehicle:</span>
                  <p className='font-medium'>
                    {checkInSummary.vehicleModel || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>License Plate:</span>
                  <p className='font-medium'>
                    {checkInSummary.licensePlate || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Mileage:</span>
                  <p className='font-medium'>
                    {checkInSummary.mileage || 0} km
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Battery Level:</span>
                  <p className='font-medium'>
                    {checkInSummary.batteryLevel || 0}%
                  </p>
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground'>Documents:</span>
                  <p className='font-medium'>
                    <span className='text-green-600 dark:text-green-400'>
                      ✓ Confirmed
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCheckInSummaryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Contract Modal */}
      {createContractOpen && booking && (
        <CreateContractModal
          booking={booking}
          existingContract={existingContract}
          isOpen={createContractOpen}
          onClose={() => {
            setCreateContractOpen(false);
            // Don't clear existingContract if it was just created
            // Only clear if user cancelled without creating
          }}
          onSuccess={async contract => {
            console.log('Contract created/updated:', contract);

            // Set the created/updated contract immediately
            setExistingContract(contract);

            // Clear validation errors since contract is now created
            setValidationErrors(prev => {
              const { contract: _, ...rest } = prev;
              return rest;
            });

            if (existingContract) {
              toast.success('Contract updated successfully');
            } else {
              toast.success(
                'Contract created successfully. You can now proceed with check-in.'
              );
            }

            setCreateContractOpen(false);

            // Refresh bookings data
            await fetchAvailableBookings();
          }}
        />
      )}
    </div>
  );
}
