import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Upload, CheckCircle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/components/ui/dialog';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Textarea } from '../../shared/components/ui/textarea';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';
import { useAuth } from '../../../app/providers/AuthProvider';

export function CreateContractModal({
  booking,
  existingContract,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    renterName: '',
    witnessName: user?.name || '',
    notes: '',
    file: null,
  });

  // Update form data when booking changes
  useEffect(() => {
    if (booking) {
      const renterName = booking?.user?.name || booking?.renters?.name || booking?.renter?.name || '';
      console.log('📝 Setting renter name:', renterName);
      setFormData(prev => ({
        ...prev,
        renterName: renterName,
        witnessName: user?.name || prev.witnessName,
      }));
    }
  }, [booking, user]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if we're uploading to existing contract or creating new one
  const isUploadOnly = existingContract?.status === 'CREATED';

  // Refs for file input and drop area
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.renterName.trim()) {
      newErrors.renterName = 'Renter name is required';
    }

    if (!formData.witnessName.trim()) {
      newErrors.witnessName = 'Witness name is required';
    }

    if (!formData.file) {
      newErrors.file = 'Contract file is required';
    } else {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.file.size > maxSize) {
        newErrors.file = 'File size must be less than 10MB';
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = 'Only PDF, JPG, PNG files are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!booking?.id) {
      toast.error('Booking ID not found');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      let contractId = existingContract?.id;

      // Step 1: Create contract only if it doesn't exist yet
      if (!isUploadOnly) {
        console.log('📝 Creating new contract for booking:', booking.id);

        const createResponse = await fetch(endpoints.contracts.create(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking.id,
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok || !createData.success) {
          throw new Error(createData.message || 'Failed to create contract');
        }

        contractId = createData.data.id;
        console.log('✅ Contract created with ID:', contractId);
      } else {
        console.log('📤 Uploading to existing contract:', contractId);
      }

      // Step 2: Upload signed contract file
      const formDataToSend = new FormData();
      formDataToSend.append('renterName', formData.renterName.trim());
      formDataToSend.append('witnessName', formData.witnessName.trim());
      if (formData.notes.trim()) {
        formDataToSend.append('notes', formData.notes.trim());
      }
      formDataToSend.append('file', formData.file);

      const uploadResponse = await fetch(
        endpoints.contracts.uploadSignedFile(contractId),
        {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload contract file');
      }

      console.log('✅ Contract uploaded successfully');
      toast.success(
        isUploadOnly
          ? 'Contract file uploaded successfully!'
          : 'Contract created and uploaded successfully!'
      );

      // Reset form
      setFormData({
        renterName: booking?.renters?.name || booking?.user?.name || '',
        witnessName: user?.name || '',
        notes: '',
        file: null,
      });
      setErrors({});

      // Notify parent and close
      if (onSuccess) {
        onSuccess(uploadData.data);
      }
      onClose();
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      if (errors.file) {
        setErrors({ ...errors, file: '' });
      }
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
  };

  // Drag & Drop handlers
  const handleDragOver = e => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-primary', 'bg-primary/20');
    }
  };

  const handleDragLeave = e => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary', 'bg-primary/20');
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary', 'bg-primary/20');
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      if (errors.file) {
        setErrors({ ...errors, file: '' });
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              {isUploadOnly ? (
                <>
                  <FileText className='w-6 h-6 text-blue-500' />
                  Upload Contract File
                </>
              ) : (
                <>
                  <AlertTriangle className='w-6 h-6 text-amber-500' />
                  Contract Required
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isUploadOnly ? (
                <>
                  Contract <strong>{existingContract?.contractNumber}</strong>{' '}
                  is created. Please upload the signed contract file to proceed
                  with check-in.
                </>
              ) : (
                <>
                  This booking does not have a contract yet. Please upload the
                  signed contract before proceeding with check-in.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Booking Info */}
          <div
            className={`p-4 border-2 rounded-lg ${isUploadOnly
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}
          >
            <h3
              className={`font-semibold text-sm mb-2 ${isUploadOnly
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-amber-900 dark:text-amber-100'
                }`}
            >
              {isUploadOnly
                ? 'Contract & Booking Information'
                : 'Booking Information'}
            </h3>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              {isUploadOnly && existingContract?.contractNumber && (
                <div className='col-span-2 pb-2 border-b border-current/20'>
                  <span className='text-muted-foreground'>
                    Contract Number:
                  </span>
                  <span className='ml-2 font-bold text-foreground'>
                    {existingContract.contractNumber}
                  </span>
                </div>
              )}
              <div>
                <span className='text-muted-foreground'>Customer:</span>
                <span className='ml-2 font-medium text-foreground'>
                  {booking?.user?.name || booking?.renters?.name || booking?.renter?.name || 'Unknown'}
                </span>
              </div>
              {(booking?.user?.phone || booking?.renter?.phone || booking?.user?.email) && (
                <div>
                  <span className='text-muted-foreground'>Contact:</span>
                  <span className='ml-2 font-medium text-foreground'>
                    {booking?.user?.phone || booking?.renter?.phone || booking?.user?.email}
                  </span>
                </div>
              )}
              <div>
                <span className='text-muted-foreground'>Vehicle:</span>
                <span className='ml-2 font-medium text-foreground'>
                  {booking?.vehicle?.brand} {booking?.vehicle?.model || 'Unknown'}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground'>License Plate:</span>
                <span className='ml-2 font-medium text-foreground'>
                  {booking?.vehicle?.licensePlate || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Contract Upload Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Renter Name */}
            <div>
              <label className='block text-sm font-semibold mb-1.5 text-foreground'>
                Renter Name <span className='text-destructive'>*</span>
              </label>
              <Input
                type='text'
                value={formData.renterName}
                readOnly
                className='border-2 cursor-not-allowed bg-muted/50 border-input'
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Auto-filled from booking
              </p>
            </div>

            {/* Witness Name */}
            <div>
              <label className='block text-sm font-semibold mb-1.5 text-foreground'>
                Witness Name (Staff) <span className='text-destructive'>*</span>
              </label>
              <Input
                type='text'
                value={formData.witnessName}
                readOnly
                className='border-2 cursor-not-allowed bg-muted/50 border-input'
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Auto-filled from current user
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-semibold mb-1.5 text-foreground'>
                Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder='Add any notes about the contract...'
                maxLength={500}
                rows={3}
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className='block text-sm font-semibold mb-1.5 text-foreground'>
                Contract File <span className='text-destructive'>*</span>
              </label>

              {formData.file ? (
                <div className='flex items-center justify-between p-3 border-2 rounded-lg bg-primary/10 border-primary/30'>
                  <div className='flex items-center gap-3'>
                    <FileText className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        {formData.file.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={removeFile}
                    className='p-1 transition-colors rounded hover:bg-primary/20'
                  >
                    <X className='w-4 h-4 text-muted-foreground hover:text-foreground' />
                  </button>
                </div>
              ) : (
                <div
                  ref={dropAreaRef}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className='p-6 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-input hover:border-primary hover:bg-primary/10 bg-card'
                >
                  <Upload className='w-10 h-10 mx-auto mb-2 text-muted-foreground' />
                  <p className='mb-1 text-sm font-semibold text-foreground'>
                    Choose file or drag and drop
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={handleFileChange}
                className='hidden'
              />
              {errors.file && (
                <p className='mt-1 text-sm text-destructive'>{errors.file}</p>
              )}
            </div>

            {/* Info Box */}
            <div className='p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'>
              <p className='text-xs text-blue-900 dark:text-blue-100'>
                <span className='font-semibold'>Important:</span> Make sure the
                contract is signed by the customer and contains accurate
                information.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='w-4 h-4 mr-2' />
                    Upload Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Using ShadCN Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <AlertTriangle className='w-6 h-6 text-amber-500' />
              Confirm Contract Upload
            </DialogTitle>
            <DialogDescription className='mt-2 text-sm text-muted-foreground'>
              Please verify the following before uploading:
            </DialogDescription>
          </DialogHeader>
          <ul className='mb-4 space-y-2 text-sm'>
            <li className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 shrink-0' />
              <span className='text-foreground'>
                Contract is signed by customer
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 shrink-0' />
              <span className='text-foreground'>
                All information is accurate
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 shrink-0' />
              <span className='text-foreground'>
                File is clear and readable
              </span>
            </li>
          </ul>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              className='flex-1'
              onClick={handleConfirmUpload}
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Confirm Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
